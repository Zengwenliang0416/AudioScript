import { API_ENDPOINT } from '@/config/constants'
import { TranscriptionOptions, TranscriptionResult } from '@/types'

export const uploadFile = async (file: File, options: TranscriptionOptions): Promise<string> => { // 上传文件
  const formData = new FormData()
  formData.append('file', file)
  formData.append('options', JSON.stringify(options))

  const response = await fetch(`${API_ENDPOINT}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) throw new Error('Upload failed')
  const { id } = await response.json()
  return id
}

export const getTranscriptionStatus = async (id: string): Promise<TranscriptionResult> => { // 获取转录状态
  const response = await fetch(`${API_ENDPOINT}/status/${id}`)
  if (!response.ok) throw new Error('Failed to get status')
  return response.json()
}

export const cancelTranscription = async (id: string): Promise<void> => { // 取消转录
  const response = await fetch(`${API_ENDPOINT}/cancel/${id}`, { method: 'POST' })
  if (!response.ok) throw new Error('Failed to cancel transcription')
} 