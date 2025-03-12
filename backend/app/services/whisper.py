import json
from typing import Dict, List, Optional, Tuple
from openai import AsyncOpenAI, AsyncStream
from openai.types.audio import Translation, Transcription
from ..core.config import settings

class WhisperService:
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
            timeout=settings.OPENAI_TIMEOUT,
            max_retries=settings.OPENAI_MAX_RETRIES,
        )
    
    async def transcribe(
        self,
        audio_file: bytes,
        filename: str,
        language: Optional[str] = None,
        prompt: Optional[str] = None,
    ) -> Tuple[List[Dict], float]:
        """转录音频文件并返回带时间戳的文本片段"""
        try:
            response = await self.client.audio.transcriptions.create(
                model=settings.OPENAI_MODEL,
                file=(filename, audio_file),
                response_format="verbose_json",
                timestamp_granularities=["segment"],
                language=language if language != "auto" else None,
                prompt=prompt,
            )
            
            segments = []
            total_duration = 0.0
            
            # 解析响应
            if isinstance(response, (Translation, Transcription)):
                data = json.loads(response.model_dump_json())
                segments = data.get("segments", [])
                total_duration = float(data.get("duration", 0))
            
            return segments, total_duration
            
        except Exception as e:
            raise Exception(f"Whisper API 调用失败: {str(e)}")
    
    async def detect_language(self, audio_file: bytes, filename: str) -> str:
        """检测音频文件的语言"""
        try:
            response = await self.client.audio.transcriptions.create(
                model=settings.OPENAI_MODEL,
                file=(filename, audio_file),
                response_format="verbose_json",
                timestamp_granularities=["segment"],
            )
            
            if isinstance(response, (Translation, Transcription)):
                data = json.loads(response.model_dump_json())
                return data.get("language", "unknown")
            
            return "unknown"
            
        except Exception as e:
            raise Exception(f"语言检测失败: {str(e)}")
    
    def analyze_tone(self, text: str) -> Dict:
        """分析文本的语气
        这里使用一个简单的规则来模拟语气分析
        实际项目中可以使用更复杂的 NLP 模型
        """
        # 简单的语气词典
        tone_markers = {
            "疑问": ["吗", "？", "怎么", "为什么"],
            "感叹": ["！", "啊", "哇", "太"],
            "命令": ["必须", "一定要", "给我"],
            "祈使": ["请", "麻烦", "建议"],
        }
        
        # 默认为陈述语气
        tone_type = "陈述"
        confidence = 0.7
        
        # 检查语气标记
        for tone, markers in tone_markers.items():
            if any(marker in text for marker in markers):
                tone_type = tone
                confidence = 0.9
                break
        
        return {
            "type": tone_type,
            "confidence": confidence
        } 