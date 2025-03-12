'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { UPLOAD_STATUS } from '@/config/constants'
import { getTranscriptionStatus } from '@/lib/api'

interface TranscriptionResultProps { # 转录结果组件属性
  id: string
}

export const TranscriptionResult = ({ id }: TranscriptionResultProps) => { # 转录结果组件
  const { data, isLoading, error } = useQuery({
    queryKey: ['transcription', id],
    queryFn: () => getTranscriptionStatus(id),
    refetchInterval: (data) => {
      if (data?.status === UPLOAD_STATUS.SUCCESS || data?.status === UPLOAD_STATUS.ERROR) return false
      return 1000
    },
  })

  useEffect(() => { # 自动滚动到最新片段
    const container = document.getElementById('segments-container')
    if (container) container.scrollTop = container.scrollHeight
  }, [data?.segments])

  if (isLoading) return <div>加载中...</div>
  if (error) return <div>加载失败</div>
  if (!data) return null

  return (
    <Card className="w-full max-w-xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>转录结果</CardTitle>
      </CardHeader>
      <CardContent>
        {data.status === UPLOAD_STATUS.PROCESSING && (
          <div className="mb-4">
            <Progress value={data.progress} className="mb-2" />
            <p className="text-sm text-gray-600 text-center">{data.progress}%</p>
          </div>
        )}

        {data.status === UPLOAD_STATUS.ERROR && (
          <div className="text-red-500">{data.error}</div>
        )}

        {data.segments && data.segments.length > 0 && (
          <div id="segments-container" className="space-y-2 max-h-96 overflow-y-auto">
            {data.segments.map((segment, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>
                    {new Date(segment.start * 1000).toISOString().substr(11, 8)} -{' '}
                    {new Date(segment.end * 1000).toISOString().substr(11, 8)}
                  </span>
                  <span>
                    {segment.language && `[${segment.language}]`}
                    {segment.tone && ` - ${segment.tone.type}`}
                  </span>
                </div>
                <p>{segment.text}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 