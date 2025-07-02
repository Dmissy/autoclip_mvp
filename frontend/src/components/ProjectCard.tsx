import React, { useState, useEffect } from 'react'
import { Card, Tag, Button, Space, Typography, Progress, Popconfirm, message } from 'antd'
import { PlayCircleOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined, ReloadOutlined, LoadingOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { Project } from '../store/useProjectStore'
import { projectApi } from '../services/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)

const { Text, Title } = Typography
const { Meta } = Card

interface ProjectCardProps {
  project: Project
  onDelete: (id: string) => void
  onRetry?: (id: string) => void
  onClick?: () => void
}

interface LogEntry {
  timestamp: string
  module: string
  level: string
  message: string
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete, onRetry, onClick }) => {
  const navigate = useNavigate()
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [currentLogIndex, setCurrentLogIndex] = useState(0)

  // 获取分类信息
  const getCategoryInfo = (category?: string) => {
    const categoryMap: Record<string, { name: string; icon: string; color: string }> = {
      'default': { name: '默认', icon: '🎬', color: '#4facfe' },
      'knowledge': { name: '知识科普', icon: '📚', color: '#52c41a' },
      'business': { name: '商业财经', icon: '💼', color: '#faad14' },
      'opinion': { name: '观点评论', icon: '💭', color: '#722ed1' },
      'experience': { name: '经验分享', icon: '🌟', color: '#13c2c2' },
      'speech': { name: '演讲脱口秀', icon: '🎤', color: '#eb2f96' },
      'content_review': { name: '内容解说', icon: '🎭', color: '#f5222d' },
      'entertainment': { name: '娱乐内容', icon: '🎪', color: '#fa8c16' }
    }
    return categoryMap[category || 'default'] || categoryMap['default']
  }

  // 生成项目视频缩略图
  useEffect(() => {
    const generateThumbnail = async () => {
      if (!project.video_path) return
      
      try {
        const video = document.createElement('video')
        video.crossOrigin = 'anonymous'
        video.muted = true
        
        const videoUrl = projectApi.getProjectFileUrl(project.id, 'input/input.mp4')
        
        video.onloadedmetadata = () => {
          console.log('开始加载视频:', video.src)
          video.currentTime = Math.min(5, video.duration / 4) // 取视频1/4处或5秒处的帧
        }
        
        video.onseeked = () => {
          try {
            console.log('尝试加载视频:', videoUrl)
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) return
            
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            ctx.drawImage(video, 0, 0)
            
            const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
            setVideoThumbnail(thumbnail)
            console.log('项目缩略图生成成功')
          } catch (error) {
            console.error('生成缩略图失败:', error)
          }
        }
        
        video.onerror = (error) => {
          console.error('视频加载失败:', error)
        }
        
        video.src = videoUrl
      } catch (error) {
        console.error('生成缩略图时发生错误:', error)
      }
    }
    
    generateThumbnail()
  }, [project.id, project.video_path])

  // 获取项目日志（仅在处理中时）
  useEffect(() => {
    if (project.status !== 'processing') {
      setLogs([])
      return
    }

    const fetchLogs = async () => {
      try {
        const response = await projectApi.getProjectLogs(project.id, 20)
        setLogs(response.logs.filter(log => 
          log.message.includes('Step') || 
          log.message.includes('开始') || 
          log.message.includes('完成') ||
          log.message.includes('处理') ||
          log.level === 'ERROR'
        ))
      } catch (error) {
        console.error('获取日志失败:', error)
      }
    }

    // 立即获取一次
    fetchLogs()
    
    // 每3秒更新一次日志
    const logInterval = setInterval(fetchLogs, 3000)
    
    return () => clearInterval(logInterval)
  }, [project.id, project.status])

  // 日志轮播
  useEffect(() => {
    if (logs.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrentLogIndex(prev => (prev + 1) % logs.length)
    }, 2000) // 每2秒切换一条日志
    
    return () => clearInterval(interval)
  }, [logs.length])

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed': return 'success'
      case 'processing': return 'processing'
      case 'error': return 'error'
      case 'uploading': return 'default'
      default: return 'default'
    }
  }

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'completed': return '已完成'
      case 'processing': return '处理中'
      case 'error': return '处理失败'
      case 'uploading': return '上传中'
      default: return '未知状态'
    }
  }

  const getProgressPercent = () => {
    if (project.status === 'completed') return 100
    if (project.status === 'error') return 0
    if (project.current_step && project.total_steps) {
      return Math.round((project.current_step / project.total_steps) * 100)
    }
    return 0
  }

  const handleRetry = async () => {
    if (isRetrying) return
    
    setIsRetrying(true)
    try {
      await projectApi.retryProcessing(project.id)
      message.success('已开始重试处理项目')
      if (onRetry) {
        onRetry(project.id)
      }
    } catch (error) {
      console.error('重试失败:', error)
      message.error('重试失败，请稍后再试')
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <Card
      hoverable
      className="project-card"
      style={{ 
        width: 200, 
        height: 240,
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        marginBottom: '0px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}
      bodyStyle={{
        padding: '12px',
        background: 'transparent',
        height: 'calc(100% - 120px)',
        display: 'flex',
        flexDirection: 'column'
      }}
      cover={
        <div 
          style={{ 
            height: 120, 
            position: 'relative',
            background: videoThumbnail 
              ? `url(${videoThumbnail}) center/cover` 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
          onClick={() => {
            if (onClick) {
              onClick()
            } else {
              navigate(`/project/${project.id}`)
            }
          }}
        >
          {!videoThumbnail && (
            <div style={{ textAlign: 'center' }}>
              <PlayCircleOutlined 
                style={{ 
                  fontSize: '40px', 
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: '4px',
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))'
                }} 
              />
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                fontSize: '12px',
                fontWeight: 500
              }}>
                点击预览
              </div>
            </div>
          )}
          
          {/* 分类标签 - 左上角 */}
          {project.video_category && project.video_category !== 'default' && (
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '8px'
            }}>
              <Tag
                style={{
                  background: `${getCategoryInfo(project.video_category).color}15`,
                  border: `1px solid ${getCategoryInfo(project.video_category).color}40`,
                  borderRadius: '4px',
                  color: getCategoryInfo(project.video_category).color,
                  fontSize: '10px',
                  fontWeight: 500,
                  padding: '2px 6px',
                  lineHeight: '14px',
                  height: '18px',
                  margin: 0
                }}
              >
                <span style={{ marginRight: '2px' }}>{getCategoryInfo(project.video_category).icon}</span>
                {getCategoryInfo(project.video_category).name}
              </Tag>
            </div>
          )}
          
          {/* 移除右上角状态指示器 - 可读性差且冗余 */}
          
          {/* 更新时间和操作按钮 - 移动到封面底部 */}
          <div style={{
            position: 'absolute',
            bottom: '6px',
            left: '8px',
            right: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '4px',
            padding: '4px 6px',
            height: '24px'
          }}>
            <Text style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
              {dayjs(project.updated_at).fromNow()}
            </Text>
            
            {/* 操作按钮 */}
            <div style={{
              display: 'flex',
              gap: '4px'
            }}>
              {/* 失败状态：只显示重试和删除按钮 */}
              {project.status === 'error' ? (
                <>
                  <Button
                    type="text"
                    icon={<ReloadOutlined />}
                    loading={isRetrying}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRetry()
                    }}
                    style={{
                      height: '20px',
                      width: '20px',
                      borderRadius: '3px',
                      color: '#52c41a',
                      border: '1px solid rgba(82, 196, 26, 0.5)',
                      background: 'rgba(82, 196, 26, 0.1)',
                      padding: 0,
                      minWidth: '20px',
                      fontSize: '10px'
                    }}
                  />
                  
                  <Popconfirm
                    title="确定要删除这个项目吗？"
                    description="删除后无法恢复"
                    onConfirm={(e) => {
                      e?.stopPropagation()
                      onDelete(project.id)
                    }}
                    onCancel={(e) => {
                      e?.stopPropagation()
                    }}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                      style={{
                        height: '20px',
                        width: '20px',
                        borderRadius: '3px',
                        color: '#ff6b6b',
                        border: '1px solid rgba(255, 107, 107, 0.5)',
                        background: 'rgba(255, 107, 107, 0.1)',
                        padding: 0,
                        minWidth: '20px',
                        fontSize: '10px'
                      }}
                    />
                  </Popconfirm>
                </>
              ) : (
                /* 其他状态：显示下载和删除按钮 */
                <>
                  <Space size={4}>
                    {/* 下载按钮 - 仅在完成状态显示 */}
                    {project.status === 'completed' && (
                      <Button
                        type="text"
                        icon={<DownloadOutlined />}
                        onClick={(e) => {
                          e.stopPropagation()
                          // 实现下载功能
                          message.info('下载功能开发中...')
                        }}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '3px',
                          color: 'rgba(255, 255, 255, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          background: 'rgba(255, 255, 255, 0.1)',
                          padding: 0,
                          minWidth: '20px',
                          fontSize: '10px'
                        }}
                      />
                    )}
                    
                    {/* 删除按钮 */}
                    <Popconfirm
                      title="确定要删除这个项目吗？"
                      description="删除后无法恢复"
                      onConfirm={(e) => {
                        e?.stopPropagation()
                        onDelete(project.id)
                      }}
                      onCancel={(e) => {
                        e?.stopPropagation()
                      }}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '3px',
                          color: 'rgba(255, 255, 255, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          background: 'rgba(255, 255, 255, 0.1)',
                          padding: 0,
                          minWidth: '20px',
                          fontSize: '10px'
                        }}
                      />
                    </Popconfirm>
                  </Space>
                 </>
               )}
            </div>
          </div>
        </div>
      }
    >
      <div style={{ padding: '0', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          {/* 仅在处理中时显示实时日志 */}
          {project.status === 'processing' && logs.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  minHeight: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid rgba(102, 126, 234, 0.2)'
                }}>
                  <LoadingOutlined style={{ color: '#667eea', fontSize: '12px' }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <Text style={{ 
                      fontSize: '10px', 
                      color: '#ffffff',
                      lineHeight: '12px',
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {logs[currentLogIndex]?.message || '正在处理...'}
                    </Text>
                    <Text style={{ 
                      fontSize: '9px', 
                      color: '#999999',
                      lineHeight: '10px'
                    }}>
                      {logs[currentLogIndex]?.timestamp ? 
                        dayjs(logs[currentLogIndex].timestamp).format('HH:mm:ss') : 
                        ''
                      }
                    </Text>
                  </div>
                  {logs.length > 1 && (
                    <div style={{
                      display: 'flex',
                      gap: '2px'
                    }}>
                      {logs.slice(0, Math.min(3, logs.length)).map((_, index) => (
                        <div
                          key={index}
                          style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: index === currentLogIndex % Math.min(3, logs.length) ? '#667eea' : 'rgba(255, 255, 255, 0.3)',
                            transition: 'background 0.3s'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
            </div>
          )}
          
          {/* 项目名称 */}
          <div style={{ marginBottom: '12px', position: 'relative' }}>
            <Text 
              strong 
              title={project.name}
              style={{ 
                fontSize: '13px', 
                color: '#ffffff',
                fontWeight: 600,
                lineHeight: '16px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                cursor: 'help',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                 const target = e.currentTarget as HTMLElement
                 if (target.scrollHeight > target.clientHeight) {
                   target.style.webkitLineClamp = 'unset'
                   target.style.maxHeight = 'none'
                   target.style.background = 'rgba(0, 0, 0, 0.8)'
                   target.style.padding = '4px'
                   target.style.borderRadius = '4px'
                   target.style.zIndex = '10'
                   target.style.position = 'relative'
                 }
               }}
               onMouseLeave={(e) => {
                 const target = e.currentTarget as HTMLElement
                 target.style.webkitLineClamp = '2'
                 target.style.maxHeight = '32px'
                 target.style.background = 'transparent'
                 target.style.padding = '0'
                 target.style.borderRadius = '0'
                 target.style.zIndex = 'auto'
                 target.style.position = 'static'
               }}
            >
              {project.name}
            </Text>
          </div>
          
          {/* 状态和统计信息 */}
          <div style={{ 
            display: 'flex', 
            gap: '6px'
          }}>
            {/* 状态显示 */}
            <div style={{
              background: project.status === 'completed' ? 'rgba(82, 196, 26, 0.15)' :
                         project.status === 'processing' ? 'rgba(24, 144, 255, 0.15)' :
                         project.status === 'error' ? 'rgba(255, 77, 79, 0.15)' :
                         'rgba(217, 217, 217, 0.15)',
              border: project.status === 'completed' ? '1px solid rgba(82, 196, 26, 0.3)' :
                      project.status === 'processing' ? '1px solid rgba(24, 144, 255, 0.3)' :
                      project.status === 'error' ? '1px solid rgba(255, 77, 79, 0.3)' :
                      '1px solid rgba(217, 217, 217, 0.3)',
              borderRadius: '4px',
              padding: '4px 6px',
              textAlign: 'center',
              flex: 1
            }}>
              <div style={{ 
                color: project.status === 'completed' ? '#52c41a' :
                       project.status === 'processing' ? '#1890ff' :
                       project.status === 'error' ? '#ff4d4f' :
                       '#d9d9d9',
                fontSize: '12px', 
                fontWeight: 600, 
                lineHeight: '14px' 
              }}>
                {project.status === 'processing' && project.current_step && project.total_steps 
                  ? `${Math.round((project.current_step / project.total_steps) * 100)}%`
                  : project.status === 'completed' ? '✓'
                  : project.status === 'error' ? '✗'
                  : '○'
                }
              </div>
              <div style={{ color: '#999999', fontSize: '9px', lineHeight: '10px' }}>
                {project.status === 'completed' ? '已完成' :
                 project.status === 'processing' ? '处理中' :
                 project.status === 'error' ? '失败' :
                 '等待中'
                }
              </div>
            </div>
            
            {/* 切片数量 */}
            <div style={{
              background: 'rgba(102, 126, 234, 0.15)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '4px',
              padding: '4px 6px',
              textAlign: 'center',
              flex: 1
            }}>
              <div style={{ color: '#667eea', fontSize: '12px', fontWeight: 600, lineHeight: '14px' }}>
                {project.clips?.length || 0}
              </div>
              <div style={{ color: '#999999', fontSize: '9px', lineHeight: '10px' }}>
                切片
              </div>
            </div>
            
            {/* 合集数量 */}
            <div style={{
              background: 'rgba(118, 75, 162, 0.15)',
              border: '1px solid rgba(118, 75, 162, 0.3)',
              borderRadius: '4px',
              padding: '4px 6px',
              textAlign: 'center',
              flex: 1
            }}>
              <div style={{ color: '#764ba2', fontSize: '12px', fontWeight: 600, lineHeight: '14px' }}>
                {project.collections?.length || 0}
              </div>
              <div style={{ color: '#999999', fontSize: '9px', lineHeight: '10px' }}>
                合集
              </div>
            </div>
          </div>

        </div>
      </div>
    </Card>
  )
}

export default ProjectCard