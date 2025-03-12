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
      <main className="min-h-screen p-8">
        <h1 className="text-3xl font-bold text-center mb-8">AudioScript</h1>
        <UploadForm />
        {transcriptionId && <TranscriptionResult id={transcriptionId} />}
      </main>
      <Toaster />
    </QueryClientProvider>
  )
}
