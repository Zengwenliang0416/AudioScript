export const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3001' // API 端点

export const SUPPORTED_AUDIO_TYPES = [ // 支持的音频类型
  'audio/wav',
  'audio/mp3',
  'audio/mpeg',
  'audio/ogg',
  'audio/webm',
  'audio/m4a',
]

export const MAX_FILE_SIZE = 100 * 1024 * 1024 // 最大文件大小 100MB

export const LANGUAGE_OPTIONS = [ // 语言选项
  { value: 'auto', label: '自动检测' },
  { value: 'zh', label: '中文' },
  { value: 'en', label: '英文' },
  { value: 'ja', label: '日语' },
  { value: 'ko', label: '韩语' },
] as const

export const PUNCTUATION_STYLES = [ // 标点样式
  { value: 'auto', label: '自动' },
  { value: 'formal', label: '正式' },
  { value: 'casual', label: '随意' },
] as const

export const UPLOAD_STATUS = { // 上传状态
  IDLE: 'idle',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
} as const 