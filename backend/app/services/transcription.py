import os
import uuid
import asyncio
import aiofiles
from typing import Dict, Optional
from ..core.config import settings
from ..models.transcription import TranscriptionOptions, TranscriptionStatus, Segment, ToneInfo
from .whisper import WhisperService

class TranscriptionService:
    def __init__(self):
        self._tasks: Dict[str, TranscriptionStatus] = {}
        self._whisper = WhisperService()
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    async def create_transcription(
        self,
        filename: str,
        content: bytes,
        options: TranscriptionOptions,
    ) -> TranscriptionStatus:
        task_id = str(uuid.uuid4())
        file_path = os.path.join(settings.UPLOAD_DIR, f"{task_id}_{filename}")
        
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(content)
        
        status = TranscriptionStatus(
            id=task_id,
            status="PROCESSING",
            progress=0,
        )
        self._tasks[task_id] = status
        
        # 启动异步处理任务
        asyncio.create_task(self._process_transcription(task_id, file_path, content, options))
        
        return status
    
    async def get_transcription_status(self, task_id: str) -> Optional[TranscriptionStatus]:
        return self._tasks.get(task_id)
    
    async def _process_transcription(
        self,
        task_id: str,
        file_path: str,
        content: bytes,
        options: TranscriptionOptions,
    ) -> None:
        try:
            # 检测语言
            if options.detect_language:
                self._tasks[task_id].progress = 10
                detected_language = await self._whisper.detect_language(content, os.path.basename(file_path))
                language = detected_language if detected_language != "unknown" else "auto"
            else:
                language = options.language
            
            # 转录音频
            self._tasks[task_id].progress = 20
            segments_data, duration = await self._whisper.transcribe(
                content,
                os.path.basename(file_path),
                language=language,
            )
            
            # 处理转录结果
            segments = []
            total_segments = len(segments_data)
            
            for i, seg_data in enumerate(segments_data):
                # 更新进度
                progress = 20 + (i + 1) / total_segments * 70
                self._tasks[task_id].progress = progress
                
                # 分析语气
                tone = None
                if options.tone_analysis:
                    tone_result = self._whisper.analyze_tone(seg_data["text"])
                    tone = ToneInfo(
                        type=tone_result["type"],
                        confidence=tone_result["confidence"]
                    )
                
                # 创建片段
                segment = Segment(
                    start=float(seg_data["start"]),
                    end=float(seg_data["end"]),
                    text=seg_data["text"],
                    language=language if not options.multi_language else seg_data.get("language", language),
                    tone=tone
                )
                segments.append(segment)
                
                # 更新状态
                self._tasks[task_id].segments = segments
            
            self._tasks[task_id].status = "SUCCESS"
            self._tasks[task_id].progress = 100
            
        except Exception as e:
            self._tasks[task_id].status = "ERROR"
            self._tasks[task_id].error = str(e)
        
        finally:
            # 清理临时文件
            try:
                os.remove(file_path)
            except:
                pass 