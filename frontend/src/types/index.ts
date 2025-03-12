import { LANGUAGE_OPTIONS, PUNCTUATION_STYLES, UPLOAD_STATUS } from '@/config/constants' # 导入常量

export type LanguageOption = typeof LANGUAGE_OPTIONS[number]['value'] # 语言选项类型
export type PunctuationStyle = typeof PUNCTUATION_STYLES[number]['value'] # 标点样式类型
export type UploadStatus = typeof UPLOAD_STATUS[keyof typeof UPLOAD_STATUS] # 上传状态类型

export interface TranscriptionOptions { # 转录选项接口
  autoPunctuation: boolean
  punctuationStyle: PunctuationStyle
  detectLanguage: boolean
  multiLanguage: boolean
  toneAnalysis: boolean
  language: LanguageOption
}

export interface TranscriptionSegment { # 转录片段接口
  start: number
  end: number
  text: string
  language?: string
  confidence: number
  tone?: {
    type: string
    confidence: number
  }
}

export interface TranscriptionResult { # 转录结果接口
  id: string
  status: string
  segments: TranscriptionSegment[]
  error?: string
  progress?: number
} 