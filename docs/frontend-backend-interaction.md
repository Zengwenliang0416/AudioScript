# 前后端交互文档

## 1. 交互流程

### 1.1 文件上传和转录流程

```mermaid
sequenceDiagram
    participant C as 客户端
    participant F as 前端服务
    participant B as 后端服务
    participant T as 转录服务

    C->>F: 选择文件
    F->>F: 文件验证
    F->>B: 上传文件
    B->>B: 文件处理
    B->>T: 发送转录请求
    B->>C: 返回jobId
    
    loop 状态轮询
        C->>B: 查询转录状态
        B->>T: 检查任务状态
        T-->>B: 返回状态
        B-->>C: 更新状态
    end

    T->>B: 转录完成通知
    B->>B: 保存结果
    C->>B: 获取转录结果
    B->>C: 返回文本结果
```

### 1.2 状态管理流程

```mermaid
stateDiagram-v2
    [*] --> 文件选择
    文件选择 --> 文件验证
    文件验证 --> 上传中
    上传中 --> 转录中
    转录中 --> 完成
    转录中 --> 失败
    完成 --> [*]
    失败 --> 重试
    重试 --> 转录中
```

## 2. 数据交互格式

### 2.1 文件上传请求

**前端代码示例:**
```typescript
const uploadFile = async (file: File, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // 添加多语言和语气标点选项
  if (options.language) {
    formData.append('language', options.language);
  }
  
  // 多语言识别选项
  formData.append('detect_language', options.detectLanguage ?? true);
  formData.append('multi_language', options.multiLanguage ?? true);
  
  // 语气标点选项
  formData.append('auto_punctuation', options.autoPunctuation ?? true);
  formData.append('punctuation_style', options.punctuationStyle ?? 'standard');
  formData.append('tone_analysis', options.toneAnalysis ?? true);
  
  try {
    const response = await axios.post('/api/transcription/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        updateProgress(progress);
      },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
```

**后端处理示例:**
```typescript
const handleFileUpload = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const options = {
      language: req.body.language,
      detectLanguage: req.body.detect_language === 'true',
      multiLanguage: req.body.multi_language === 'true',
      autoPunctuation: req.body.auto_punctuation === 'true',
      punctuationStyle: req.body.punctuation_style || 'standard',
      toneAnalysis: req.body.tone_analysis === 'true'
    };
    
    const jobId = await transcriptionService.createJob(file, options);
    res.json({
      success: true,
      data: {
        jobId,
        status: 'waiting',
      },
    });
  } catch (error) {
    handleError(error, res);
  }
};
```

## 3. 状态管理

### 3.1 前端状态管理

```typescript
// 使用 React Query 管理状态
const useTranscriptionStatus = (jobId: string) => {
  return useQuery({
    queryKey: ['transcription', jobId],
    queryFn: () => fetchTranscriptionStatus(jobId),
    enabled: !!jobId,
    refetchInterval: (data) => {
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return 3000; // 每3秒轮询一次
    },
  });
};
```

### 3.2 后端状态更新

```typescript
const updateTranscriptionStatus = async (
  jobId: string,
  status: TranscriptionStatus,
  progress?: number
) => {
  try {
    await TranscriptionModel.update(jobId, {
      status,
      progress,
      updatedAt: new Date(),
    });
  } catch (error) {
    logger.error('Failed to update transcription status', {
      jobId,
      status,
      error,
    });
  }
};
```

## 4. 错误处理

### 4.1 前端错误处理

```typescript
const handleError = (error: any) => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.error?.message 
      || '上传失败，请重试';
    
    toast.error(errorMessage);
    
    // 特定错误处理
    switch (error.response?.status) {
      case 413:
        handleFileTooLarge();
        break;
      case 415:
        handleInvalidFileType();
        break;
      default:
        handleGenericError();
    }
  }
};
```

### 4.2 后端错误处理

```typescript
const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('API Error:', error);

  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
      },
    });
  }

  // 默认错误响应
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: '服务器内部错误',
    },
  });
};
```

## 5. 安全考虑

### 5.1 文件上传安全

- 文件类型验证
- 文件大小限制
- 文件名清理
- 病毒扫描（可选）

### 5.2 API 安全

- CORS 配置
- 请求限制
- 认证授权
- 数据验证

## 6. 性能优化

### 6.1 前端优化

- 文件分片上传
- 状态缓存
- 懒加载组件
- 防抖/节流处理

### 6.2 后端优化

- 文件流处理
- 任务队列
- 结果缓存
- 并发控制

## 7. 组件交互图

```mermaid
graph TD
    subgraph "页面组件"
        HomePage[首页]
        UploadPage[上传页面]
        ResultPage[结果页面]
        HistoryPage[历史记录页面]
    end
    
    subgraph "功能组件"
        UploadForm[上传表单]
        DropZone[拖放区域]
        ProgressBar[进度条]
        TranscriptionViewer[转录查看器]
        SegmentList[分段列表]
        SegmentEditor[分段编辑器]
        ExportPanel[导出面板]
        AudioPlayer[音频播放器]
    end
    
    subgraph "UI组件"
        Button[按钮]
        Input[输入框]
        Toast[提示消息]
        Modal[模态框]
        Tabs[标签页]
        Card[卡片]
    end
    
    subgraph "状态管理"
        TranscriptionState[转录状态]
        UploadState[上传状态]
        UIState[界面状态]
    end
    
    subgraph "API服务"
        TranscriptionAPI[转录API]
        FileAPI[文件API]
        UserAPI[用户API]
    end
    
    HomePage --> UploadPage
    HomePage --> HistoryPage
    UploadPage --> ResultPage
    
    UploadPage --> UploadForm
    UploadForm --> DropZone
    UploadForm --> Button
    UploadForm --> ProgressBar
    UploadForm --> Toast
    
    ResultPage --> TranscriptionViewer
    ResultPage --> ExportPanel
    ResultPage --> AudioPlayer
    
    TranscriptionViewer --> SegmentList
    SegmentList --> SegmentEditor
    
    UploadForm --> UploadState
    UploadState --> TranscriptionAPI
    
    TranscriptionViewer --> TranscriptionState
    TranscriptionState --> TranscriptionAPI
    
    ExportPanel --> FileAPI
    
    HistoryPage --> TranscriptionAPI
    HistoryPage --> Card
    HistoryPage --> Tabs
```

## 8. 详细组件结构

### 8.1 上传组件详细结构

```mermaid
classDiagram
    class UploadPage {
        +render()
    }
    
    class UploadForm {
        -files: File[]
        -isUploading: boolean
        -progress: number
        -errors: string[]
        +handleSubmit(): void
        +resetForm(): void
        +render()
    }
    
    class DropZone {
        -isActive: boolean
        -acceptedTypes: string[]
        -maxSize: number
        +onDrop(files): void
        +onDragEnter(): void
        +onDragLeave(): void
        +render()
    }
    
    class FilePreview {
        -file: File
        -previewUrl: string
        +generatePreview(): void
        +removeFile(): void
        +render()
    }
    
    class ProgressIndicator {
        -progress: number
        -status: string
        -showLabel: boolean
        +updateProgress(value): void
        +updateStatus(status): void
        +render()
    }
    
    class UploadButton {
        -isDisabled: boolean
        -isLoading: boolean
        +onClick(): void
        +render()
    }
    
    class FileValidator {
        +validateType(file, allowedTypes): boolean
        +validateSize(file, maxSize): boolean
        +validateName(filename): boolean
    }
    
    UploadPage --> UploadForm
    UploadForm --> DropZone
    UploadForm --> FilePreview
    UploadForm --> ProgressIndicator
    UploadForm --> UploadButton
    UploadForm --> FileValidator
```

### 8.2 转录结果组件详细结构

```mermaid
classDiagram
    class ResultPage {
        -jobId: string
        +render()
    }
    
    class TranscriptionViewer {
        -result: TranscriptionResult
        -currentSegment: number
        -isEditing: boolean
        +navigateToSegment(index): void
        +toggleEditMode(): void
        +render()
    }
    
    class SegmentList {
        -segments: Segment[]
        -selectedIndex: number
        +selectSegment(index): void
        +render()
    }
    
    class SegmentRow {
        -segment: Segment
        -isSelected: boolean
        -isEditing: boolean
        +startEdit(): void
        +saveEdit(text): void
        +cancelEdit(): void
        +render()
    }
    
    class SegmentEditor {
        -originalText: string
        -editedText: string
        -hasChanges: boolean
        +handleTextChange(text): void
        +save(): void
        +cancel(): void
        +render()
    }
    
    class ExportPanel {
        -formats: ExportFormat[]
        -selectedFormat: string
        -isExporting: boolean
        +selectFormat(format): void
        +exportTranscription(): void
        +render()
    }
    
    class AudioPlayer {
        -audioUrl: string
        -isPlaying: boolean
        -currentTime: number
        -duration: number
        +play(): void
        +pause(): void
        +seekTo(time): void
        +syncWithSegment(segment): void
        +render()
    }
    
    class TranscriptionControls {
        -canEdit: boolean
        -canExport: boolean
        -canShare: boolean
        +handleEdit(): void
        +handleExport(): void
        +handleShare(): void
        +render()
    }
    
    ResultPage --> TranscriptionViewer
    ResultPage --> ExportPanel
    ResultPage --> AudioPlayer
    ResultPage --> TranscriptionControls
    
    TranscriptionViewer --> SegmentList
    SegmentList --> SegmentRow
    SegmentRow --> SegmentEditor
```

## 9. 前后端数据流详解

### 9.1 上传流程数据流

```mermaid
sequenceDiagram
    participant Client as 客户端
    participant FE as 前端服务
    participant BE as 后端API
    participant Storage as 文件存储
    participant Queue as 任务队列
    
    Client->>FE: 选择文件
    FE->>FE: 验证文件(类型/大小)
    
    alt 验证失败
        FE-->>Client: 显示错误信息
    else 验证通过
        FE->>FE: 准备上传(可能分片)
        
        loop 对每个分片
            FE->>BE: 上传分片
            BE->>Storage: 存储分片
            Storage-->>BE: 存储确认
            BE-->>FE: 分片上传成功
            FE->>Client: 更新进度
        end
        
        FE->>BE: 完成上传请求
        BE->>BE: 合并分片(如需要)
        BE->>Storage: 存储完整文件
        BE->>Queue: 创建转录任务
        BE->>BE: 生成jobId
        BE-->>FE: 返回jobId和初始状态
        FE-->>Client: 显示上传完成，准备转录
    end
```

### 9.2 状态轮询数据流

```mermaid
sequenceDiagram
    participant Client as 客户端
    participant FE as 前端服务
    participant BE as 后端API
    participant Queue as 任务队列
    participant Whisper as 转录服务
    
    Client->>FE: 查看转录状态
    
    loop 每3秒轮询，直到完成或失败
        FE->>BE: 请求状态(jobId)
        BE->>Queue: 查询任务状态
        
        alt 任务等待中
            Queue-->>BE: 返回"waiting"状态
            BE-->>FE: 返回等待状态
            FE-->>Client: 显示等待中(0%)
        else 任务处理中
            Queue-->>BE: 返回"processing"状态和进度
            BE->>Whisper: 查询API进度
            Whisper-->>BE: 返回进度信息
            BE-->>FE: 返回处理状态和进度
            FE-->>Client: 更新进度条(X%)
        else 任务完成
            Queue-->>BE: 返回"completed"状态
            BE-->>FE: 返回完成状态
            FE-->>Client: 显示完成(100%)
            FE->>BE: 请求转录结果
            BE-->>FE: 返回结果数据
            FE-->>Client: 显示转录结果
            Note over FE: 停止轮询
        else 任务失败
            Queue-->>BE: 返回"failed"状态和错误
            BE-->>FE: 返回失败状态和错误信息
            FE-->>Client: 显示错误信息
            Note over FE: 停止轮询
        end
    end

    opt 用户手动刷新
        Client->>FE: 请求刷新状态
        FE->>BE: 请求状态(jobId)
        BE->>Queue: 查询任务状态
        Queue-->>BE: 返回最新状态
        BE-->>FE: 返回状态数据
        FE-->>Client: 更新界面
    end
```

### 9.3 结果处理数据流

```mermaid
sequenceDiagram
    participant Client as 客户端
    participant FE as 前端服务
    participant BE as 后端API
    participant Storage as 结果存储
    
    Client->>FE: 请求查看结果
    FE->>BE: 获取结果(jobId)
    BE->>Storage: 检索结果数据
    Storage-->>BE: 返回转录结果
    BE-->>FE: 返回格式化结果
    FE->>FE: 处理结果数据
    FE-->>Client: 渲染结果界面
    
    alt 编辑结果
        Client->>FE: 编辑文本段落
        FE->>BE: 保存编辑(jobId, segmentId, text)
        BE->>Storage: 更新结果数据
        Storage-->>BE: 更新确认
        BE-->>FE: 返回成功
        FE-->>Client: 显示保存成功
    else 导出结果
        Client->>FE: 选择导出格式
        FE->>BE: 请求导出(jobId, format)
        BE->>BE: 生成导出文件
        BE-->>FE: 返回文件URL
        FE-->>Client: 触发文件下载
    end
```

## 10. 多语言与语气标点处理流程

### 10.1 多语言识别流程

```mermaid
sequenceDiagram
    participant C as 客户端
    participant F as 前端服务
    participant B as 后端服务
    participant L as 语言检测服务
    participant T as 转录服务

    C->>F: 上传文件(multi_language=true)
    F->>B: 发送文件和选项
    B->>L: 检测主要语言
    L-->>B: 返回检测结果
    
    alt 单一语言
        B->>T: 使用特定语言模型
    else 多语言混合
        B->>T: 使用多语言模型
    end
    
    T->>T: 处理音频并标记语言
    T-->>B: 返回带语言标记的结果
    B-->>F: 返回处理结果
    F->>F: 根据语言标记渲染UI
    F-->>C: 显示多语言结果
```

### 10.2 语气标点处理流程

```mermaid
sequenceDiagram
    participant C as 客户端
    participant F as 前端服务
    participant B as 后端服务
    participant T as 转录服务
    participant P as 标点处理服务

    C->>F: 上传文件(auto_punctuation=true)
    F->>B: 发送文件和标点选项
    B->>T: 基础转录请求
    T-->>B: 返回原始转录
    
    B->>P: 发送转录结果进行语气分析
    P->>P: 分析语音特征
    P->>P: 识别语气和停顿
    P->>P: 根据语气添加标点
    P-->>B: 返回带标点的文本
    
    B-->>F: 返回带语气标点的结果
    F->>F: 渲染带标点的文本
    F-->>C: 显示最终结果
```

### 10.3 前端语气标点设置组件

**设置组件示例:**
```tsx
const TranscriptionSettings = ({ 
  settings, 
  onSettingsChange 
}: SettingsProps) => {
  return (
    <div className="settings-panel">
      <h3>转录设置</h3>
      
      <div className="setting-group">
        <h4>语言设置</h4>
        <div className="setting-item">
          <Switch
            id="detect-language"
            checked={settings.detectLanguage}
            onCheckedChange={(checked) => 
              onSettingsChange({...settings, detectLanguage: checked})
            }
          />
          <Label htmlFor="detect-language">自动检测语言</Label>
        </div>
        
        {!settings.detectLanguage && (
          <Select
            value={settings.language}
            onValueChange={(value) => 
              onSettingsChange({...settings, language: value})
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="选择语言" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zh">中文</SelectItem>
              <SelectItem value="en">英语</SelectItem>
              <SelectItem value="ja">日语</SelectItem>
              {/* 更多语言选项 */}
            </SelectContent>
          </Select>
        )}
        
        <div className="setting-item">
          <Switch
            id="multi-language"
            checked={settings.multiLanguage}
            onCheckedChange={(checked) => 
              onSettingsChange({...settings, multiLanguage: checked})
            }
          />
          <Label htmlFor="multi-language">支持混合多语言</Label>
        </div>
      </div>
      
      <div className="setting-group">
        <h4>标点和语气设置</h4>
        <div className="setting-item">
          <Switch
            id="auto-punctuation"
            checked={settings.autoPunctuation}
            onCheckedChange={(checked) => 
              onSettingsChange({...settings, autoPunctuation: checked})
            }
          />
          <Label htmlFor="auto-punctuation">智能标点</Label>
        </div>
        
        {settings.autoPunctuation && (
          <>
            <div className="setting-item">
              <Label htmlFor="punctuation-style">标点风格</Label>
              <RadioGroup
                id="punctuation-style"
                value={settings.punctuationStyle}
                onValueChange={(value) => 
                  onSettingsChange({...settings, punctuationStyle: value})
                }
              >
                <div className="radio-item">
                  <RadioGroupItem value="minimal" id="minimal" />
                  <Label htmlFor="minimal">最小标点</Label>
                </div>
                <div className="radio-item">
                  <RadioGroupItem value="standard" id="standard" />
                  <Label htmlFor="standard">标准标点</Label>
                </div>
                <div className="radio-item">
                  <RadioGroupItem value="detailed" id="detailed" />
                  <Label htmlFor="detailed">详细标点</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="setting-item">
              <Switch
                id="tone-analysis"
                checked={settings.toneAnalysis}
                onCheckedChange={(checked) => 
                  onSettingsChange({...settings, toneAnalysis: checked})
                }
              />
              <Label htmlFor="tone-analysis">语气分析</Label>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
```

### 10.4 多语言结果显示组件

**多语言结果组件示例:**
```tsx
const MultiLanguageTranscription = ({ segments }) => {
  return (
    <div className="transcription-result">
      {segments.map((segment, index) => (
        <div 
          key={index} 
          className="segment"
          data-language={segment.language}
        >
          <div className="segment-header">
            <span className="timestamp">
              {formatTime(segment.start)} - {formatTime(segment.end)}
            </span>
            <span className="language-badge">
              {getLanguageName(segment.language)}
            </span>
            {segment.tone && (
              <span className={`tone-indicator tone-${segment.tone}`}>
                {getToneName(segment.tone)}
              </span>
            )}
          </div>
          <p className="segment-text">{segment.text}</p>
        </div>
      ))}
    </div>
  );
};

// 辅助函数
const getLanguageName = (code) => {
  const languages = {
    zh: '中文',
    en: '英语',
    ja: '日语',
    // 更多语言...
  };
  return languages[code] || code;
};

const getToneName = (tone) => {
  const tones = {
    neutral: '平述',
    question: '疑问',
    exclamation: '感叹',
    informative: '说明',
    uncertain: '不确定',
    emphatic: '强调'
  };
  return tones[tone] || tone;
};
```

## 11. 后端中间件流程

```mermaid
flowchart LR
    Request[请求] --> Auth[认证中间件]
    Auth --> RateLimit[速率限制]
    RateLimit --> BodyParser[请求体解析]
    BodyParser --> FileUpload[文件上传]
    FileUpload --> Validation[请求验证]
    Validation --> Route[路由处理]
    Route --> Controller[控制器]
    Controller --> Response[响应]
    
    Error[错误处理] -.-> Response
    Logger[日志记录] -.-> Response
```

**代码示例:**
```typescript
// 应用中间件
const app = express();

// 基础中间件
app.use(helmet()); // 安全头
app.use(cors(corsOptions)); // CORS配置
app.use(morgan('combined')); // 请求日志
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true })); // URL编码解析

// 认证中间件 (可选)
app.use('/api', authMiddleware);

// 速率限制
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每IP限制请求数
}));

// 文件上传中间件
app.use('/api/transcription/upload', upload.single('file'));

// 路由
app.use('/api/transcription', transcriptionRoutes);
app.use('/api/user', userRoutes);

// 错误处理中间件 (放在最后)
app.use(errorHandler);
```