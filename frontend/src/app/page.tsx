'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { UploadForm } from '@/components/upload-form'
import { TranscriptionResult } from '@/components/transcription-result'
import { useSearchParams } from 'next/navigation'

const queryClient = new QueryClient()

export default function Home() {
  const searchParams = useSearchParams()
  const transcriptionId = searchParams.get('id')

  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
              AudioScript
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-2xl">
              智能音频转录工具 - 支持多语言识别和语气分析
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <UploadForm />
            {transcriptionId && <TranscriptionResult id={transcriptionId} />}
          </div>
        </div>
      </main>
      <Toaster position="top-center" />
    </QueryClientProvider>
  )
}
