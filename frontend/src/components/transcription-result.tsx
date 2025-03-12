'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { UPLOAD_STATUS } from '@/config/constants'
import { getTranscriptionStatus } from '@/lib/api'
import { FileText, Clock, Languages, Wand2 } from 'lucide-react'

interface TranscriptionResultProps { // 转录结果组件属性
  id: string
}

export const TranscriptionResult = ({ id }: TranscriptionResultProps) => { // 转录结果组件
  const { data, isLoading, error } = useQuery({
    queryKey: ['transcription', id],
    queryFn: () => getTranscriptionStatus(id),
    refetchInterval: (data) => {
      if (data?.status === UPLOAD_STATUS.SUCCESS || data?.status === UPLOAD_STATUS.ERROR) return false
      return 1000
    },
  })

  useEffect(() => { // 自动滚动到最新片段
    const container = document.getElementById('segments-container')
    if (container) container.scrollTop = container.scrollHeight
  }, [data?.segments])

  if (isLoading) return (
    <Card className="w-full mt-8 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50">
      <CardContent className="py-12">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
          <p className="text-lg">加载中...</p>
        </div>
      </CardContent>
    </Card>
  )

  if (error) return (
    <Card className="w-full mt-8 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-red-200">
      <CardContent className="py-12">
        <div className="flex flex-col items-center justify-center text-red-500">
          <FileText className="w-12 h-12 mb-4" />
          <p className="text-lg">加载失败</p>
        </div>
      </CardContent>
    </Card>
  )

  if (!data) return null

  return (
    <Card className="w-full mt-8 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <FileText className="w-6 h-6" />
          转录结果
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.status === UPLOAD_STATUS.PROCESSING && (
          <div className="mb-8">
            <Progress value={data.progress} className="h-2 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
              正在处理... {data.progress}%
            </p>
          </div>
        )}

        {data.status === UPLOAD_STATUS.ERROR && (
          <div className="flex items-center justify-center text-red-500 py-8">
            <p>{data.error}</p>
          </div>
        )}

        {data.segments && data.segments.length > 0 && (
          <div id="segments-container" className="space-y-4 max-h-[600px] overflow-y-auto pr-4 -mr-4">
            {data.segments.map((segment, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(segment.start * 1000).toISOString().substr(11, 8)} -{' '}
                      {new Date(segment.end * 1000).toISOString().substr(11, 8)}
                    </span>
                  </div>
                  {segment.language && (
                    <div className="flex items-center gap-1">
                      <Languages className="w-4 h-4" />
                      <span>{segment.language}</span>
                    </div>
                  )}
                  {segment.tone && (
                    <div className="flex items-center gap-1">
                      <Wand2 className="w-4 h-4" />
                      <span>{segment.tone.type}</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-800 dark:text-gray-200">{segment.text}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 