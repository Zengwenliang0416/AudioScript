import json
from typing import List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from ...core.config import settings
from ...models.transcription import TranscriptionOptions, TranscriptionStatus
from ...services.transcription import TranscriptionService

router = APIRouter()
transcription_service = TranscriptionService()

@router.post("/upload", response_model=TranscriptionStatus)
async def upload_file(
    file: UploadFile = File(...),
    options: str = Form(...),
) -> TranscriptionStatus:
    if file.content_type not in settings.SUPPORTED_AUDIO_TYPES:
        raise HTTPException(status_code=400, detail="不支持的文件类型")
    
    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="文件大小超过限制")
    
    try:
        options_data = TranscriptionOptions.model_validate(json.loads(options))
    except Exception as e:
        raise HTTPException(status_code=400, detail="无效的选项")
    
    return await transcription_service.create_transcription(file.filename, content, options_data)

@router.get("/{transcription_id}", response_model=TranscriptionStatus)
async def get_transcription_status(transcription_id: str) -> TranscriptionStatus:
    status = await transcription_service.get_transcription_status(transcription_id)
    if not status:
        raise HTTPException(status_code=404, detail="转录任务不存在")
    return status 