'use client'

import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { Upload, Music2, Languages, Type, Wand2 } from 'lucide-react'
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
    <Card className="w-full backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-2 border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Music2 className="w-6 h-6" />
          音频转录
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer mb-8
              transition-all duration-200 ease-in-out
              ${isUploading ? 'bg-gray-50/50' : 'hover:bg-gray-50/50'}
              dark:hover:bg-gray-700/50
            `}
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
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="w-full h-full max-w-[200px] max-h-[200px]">
                <Upload className="w-full h-full" />
              </div>
            </div>
            <div className="relative">
              <Upload className="w-16 h-16 mx-auto mb-4 text-blue-500" />
              <p className="text-lg font-medium mb-2">
                拖放音频文件到此处或点击上传
              </p>
              <p className="text-sm text-gray-500">
                支持的格式: {SUPPORTED_AUDIO_TYPES.map((type) => type.split('/')[1]).join(', ')}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                最大文件大小: {Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    语言
                  </FormLabel>
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
                  <FormLabel className="flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    标点样式
                  </FormLabel>
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
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Button
              type="button"
              variant={form.watch('detectLanguage') ? 'default' : 'outline'}
              className="w-full h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => form.setValue('detectLanguage', !form.watch('detectLanguage'))}
            >
              <Languages className="w-5 h-5" />
              <span className="text-sm">自动检测语言</span>
            </Button>
            <Button
              type="button"
              variant={form.watch('multiLanguage') ? 'default' : 'outline'}
              className="w-full h-auto py-4 flex flex-col items-center gap-2"
              disabled={!form.watch('detectLanguage')}
              onClick={() => form.setValue('multiLanguage', !form.watch('multiLanguage'))}
            >
              <Languages className="w-5 h-5" />
              <span className="text-sm">混合语言识别</span>
            </Button>
            <Button
              type="button"
              variant={form.watch('autoPunctuation') ? 'default' : 'outline'}
              className="w-full h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => form.setValue('autoPunctuation', !form.watch('autoPunctuation'))}
            >
              <Type className="w-5 h-5" />
              <span className="text-sm">自动标点</span>
            </Button>
            <Button
              type="button"
              variant={form.watch('toneAnalysis') ? 'default' : 'outline'}
              className="w-full h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => form.setValue('toneAnalysis', !form.watch('toneAnalysis'))}
            >
              <Wand2 className="w-5 h-5" />
              <span className="text-sm">语气分析</span>
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  )
} 