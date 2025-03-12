'use client'

import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { Upload } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LANGUAGE_OPTIONS, MAX_FILE_SIZE, PUNCTUATION_STYLES, SUPPORTED_AUDIO_TYPES } from '@/config/constants'
import { TranscriptionOptions } from '@/types'
import { uploadFile } from '@/lib/api'

export const UploadForm = () => {
  const [isUploading, setIsUploading] = useState(false)
  const queryClient = useQueryClient()
  const form = useForm<TranscriptionOptions>({
    defaultValues: {
      autoPunctuation: true,
      punctuationStyle: 'auto',
      detectLanguage: true,
      multiLanguage: false,
      toneAnalysis: true,
      language: 'auto',
    },
  })

  const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    await handleUpload(file)
  }, [])

  const handleUpload = async (file: File) => {
    if (!SUPPORTED_AUDIO_TYPES.includes(file.type)) {
      toast.error('不支持的文件类型')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('文件大小超过限制')
      return
    }

    try {
      setIsUploading(true)
      const id = await uploadFile(file, form.getValues())
      queryClient.invalidateQueries({ queryKey: ['transcription', id] })
      toast.success('上传成功')
    } catch (error) {
      toast.error('上传失败')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>音频转录</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer mb-4"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = SUPPORTED_AUDIO_TYPES.join(',')
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) handleUpload(file)
              }
              input.click()
            }}
          >
            <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">
              拖放音频文件到此处或点击上传
              <br />
              支持的格式: {SUPPORTED_AUDIO_TYPES.map((type) => type.split('/')[1]).join(', ')}
            </p>
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>语言</FormLabel>
                  <Select
                    disabled={form.watch('detectLanguage')}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LANGUAGE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="punctuationStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>标点样式</FormLabel>
                  <Select
                    disabled={!form.watch('autoPunctuation')}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PUNCTUATION_STYLES.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.setValue('detectLanguage', !form.watch('detectLanguage'))}
              >
                {form.watch('detectLanguage') ? '✓' : ''} 自动检测语言
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.setValue('multiLanguage', !form.watch('multiLanguage'))}
                disabled={!form.watch('detectLanguage')}
              >
                {form.watch('multiLanguage') ? '✓' : ''} 混合语言识别
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.setValue('autoPunctuation', !form.watch('autoPunctuation'))}
              >
                {form.watch('autoPunctuation') ? '✓' : ''} 自动标点
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.setValue('toneAnalysis', !form.watch('toneAnalysis'))}
              >
                {form.watch('toneAnalysis') ? '✓' : ''} 语气分析
              </Button>
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  )
} 