import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { MessageSquare, Send, Plus, X, ChevronLeft, Paperclip, FileText, Image as ImageIcon } from 'lucide-react'

function formatRelativeTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default function Messages() {
  const { user } = useAuth()
  const [threads, setThreads] = useState([])
  const [selectedThread, setSelectedThread] = useState(null)
  const [threadMessages, setThreadMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewThread, setShowNewThread] = useState(false)
  const [newThread, setNewThread] = useState({ topic: '', participant_id: '', content: '', is_group: false, participant_ids: [] })
  const [sending, setSending] = useState(false)
  const [sendingMessage, setSendingMessage] = useState('')
  const [pendingAttachments, setPendingAttachments] = useState([])
  const [careTeam, setCareTeam] = useState([])
  const messagesEndRef = useRef(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showMobileThread, setShowMobileThread] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetchThreads()
    fetchCareTeam()
  }, [])

  useEffect(() => {
    if (selectedThread) {
      fetchThreadMessages(selectedThread.id)
    }
  }, [selectedThread])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [threadMessages])

  const fetchThreads = async () => {
    try {
      const res = await api.get('/messages/threads')
      setThreads(res.data?.threads || [])
    } catch (err) {
      console.error('Failed to fetch threads:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCareTeam = async () => {
    try {
      const res = await api.get('/participants/me/care-team')
      setCareTeam(res.data?.care_team || [])
    } catch (err) {
      console.error('Failed to fetch care team:', err)
    }
  }

  const fetchThreadMessages = async (threadId) => {
    try {
      const res = await api.get(`/messages/threads/${threadId}`)
      setThreadMessages(res.data?.messages || [])
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    }
  }

  const handleCreateThread = async (e) => {
    e.preventDefault()
    if (!newThread.topic || !newThread.participant_id || !newThread.content) return

    setSending(true)
    try {
      const payload = {
        topic: newThread.topic,
        participant_id: newThread.participant_id,
        content: newThread.content,
        thread_type: newThread.is_group ? 'group' : 'direct',
        participant_ids: newThread.is_group ? newThread.participant_ids : []
      }
      const res = await api.post('/messages/threads', payload)
      const newThreadObj = res.data?.thread
      if (newThreadObj) {
        setThreads(prev => [newThreadObj, ...prev])
        setSelectedThread(newThreadObj)
      }
      setShowNewThread(false)
      setNewThread({ topic: '', participant_id: '', content: '', is_group: false, participant_ids: [] })
      setShowMobileThread(true)
    } catch (err) {
      console.error('Failed to create thread:', err)
    } finally {
      setSending(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if ((!sendingMessage.trim() && pendingAttachments.length === 0) || !selectedThread) return

    setSending(true)
    try {
      const payload = {
        content: sendingMessage,
        attachments: pendingAttachments.map(({ filename, mime_type, data_base64 }) => ({
          filename, mime_type, data_base64
        }))
      }
      const res = await api.post(`/messages/threads/${selectedThread.id}`, payload)
      const newMsg = res.data?.message
      if (newMsg) {
        setThreadMessages(prev => [...prev, newMsg])
      }
      setSendingMessage('')
      setPendingAttachments([])
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  const handleSelectThread = (thread) => {
    setSelectedThread(thread)
    setShowMobileThread(true)
  }

  const handleBackToList = () => {
    setShowMobileThread(false)
    setSelectedThread(null)
    fetchThreads()
  }

  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const base64 = ev.target.result.split(',')[1]
        setPendingAttachments(prev => [...prev, {
          filename: file.name,
          mime_type: file.type,
          data_base64: base64,
          preview: file.type.startsWith('image/') ? ev.target.result : null
        }])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeAttachment = (idx) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== idx))
  }

  const isPdf = (mime_type) => mime_type === 'application/pdf'
  const isImage = (mime_type) => mime_type.startsWith('image/')

  const getOtherParticipant = (thread) => {
    if (thread.thread_type === 'group') {
      const ids = thread.participant_ids || []
      if (ids.length > 0) {
        return `${ids.length} participants`
      }
      return 'Group thread'
    }
    if (user?.role === 'participant') {
      return thread.provider_name || 'Unknown Provider'
    }
    return thread.participant_name || 'Unknown Participant'
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
          <p className="text-slate-500 mt-1">Loading conversations...</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-500 mt-1">Communicate with your care team.</p>
      </div>

      <div
        className="bg-white rounded-xl border border-slate-200 overflow-hidden
          flex flex-col
          md:h-[calc(100vh-220px)] md:min-h-[500px] md:max-h-[calc(100vh-140px)]
          md:flex-row"
      >
        <div className="flex h-full">
          {(!isMobile || !showMobileThread) && (
            <div className="w-80 border-r border-slate-200 flex flex-col">
              <div className="p-4 border-b border-slate-200">
                <button
                  onClick={() => setShowNewThread(true)}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  <Plus size={16} />
                  New Thread
                </button>
              </div>

              {showNewThread && (
                <form onSubmit={handleCreateThread} className="p-4 border-b border-slate-200 bg-slate-50">
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="thread-topic" className="sr-only">Topic</label>
                      <input
                        id="thread-topic"
                        type="text"
                        placeholder="Topic"
                        value={newThread.topic}
                        onChange={e => setNewThread(prev => ({ ...prev, topic: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label htmlFor="thread-participant-id" className="sr-only">Participant ID</label>
                      <input
                        id="thread-participant-id"
                        type="text"
                        placeholder="Participant ID"
                        value={newThread.participant_id}
                        onChange={e => setNewThread(prev => ({ ...prev, participant_id: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={newThread.is_group}
                        onChange={e => setNewThread(prev => ({ ...prev, is_group: e.target.checked, participant_ids: [] }))}
                        className="rounded border-slate-300"
                      />
                      Group Thread
                    </label>
                    {newThread.is_group && (
                      <fieldset className="space-y-1">
                        <legend className="text-xs text-slate-500 sr-only">Select participants</legend>
                        {careTeam.map(member => (
                          <label key={member.user_id} className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                              type="checkbox"
                              checked={newThread.participant_ids.includes(member.user_id)}
                              onChange={e => {
                                const ids = e.target.checked
                                  ? [...newThread.participant_ids, member.user_id]
                                  : newThread.participant_ids.filter(id => id !== member.user_id)
                                setNewThread(prev => ({ ...prev, participant_ids: ids }))
                              }}
                              className="rounded border-slate-300"
                            />
                            {member.full_name || member.email}
                          </label>
                        ))}
                      </fieldset>
                    )}
                    <label htmlFor="thread-initial-message" className="sr-only">Initial message</label>
                    <textarea
                      id="thread-initial-message"
                      placeholder="Initial message"
                      value={newThread.content}
                      onChange={e => setNewThread(prev => ({ ...prev, content: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowNewThread(false)}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={sending}
                        className="flex-1 bg-primary text-white px-3 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {sending ? 'Sending...' : 'Create'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="flex-1 overflow-y-auto">
                {threads.length === 0 && !showNewThread ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <MessageSquare size={24} className="text-slate-300 mb-2" />
                    <p className="text-slate-500 text-sm">No message threads yet</p>
                    <p className="text-slate-400 text-xs mt-1">Start a conversation with your care team</p>
                  </div>
                ) : (
                  threads.map(thread => (
                    <div
                      key={thread.id}
                      onClick={() => handleSelectThread(thread)}
                      className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedThread?.id === thread.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-medium text-slate-900 text-sm truncate">{thread.topic}</h3>
                        <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                          {formatRelativeTime(thread.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-1">{getOtherParticipant(thread)}</p>
                      <p className="text-xs text-slate-500 truncate">{thread.last_message || 'No messages yet'}</p>
                      {thread.message_count > 0 && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-500">
                          {thread.message_count} {thread.message_count === 1 ? 'message' : 'messages'}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {(!isMobile || showMobileThread) && (
            <div className="flex-1 flex flex-col min-h-0">
              {selectedThread ? (
                <>
                  <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                    {isMobile && (
                      <button onClick={handleBackToList} className="p-1 hover:bg-slate-100 rounded">
                        <ChevronLeft size={20} className="text-slate-600" />
                      </button>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-slate-900 truncate">{selectedThread.topic}</h2>
                      <p className="text-xs text-slate-500">{getOtherParticipant(selectedThread)}</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                    {threadMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageSquare size={24} className="text-slate-300 mb-2" />
                        <p className="text-slate-500 text-sm">No messages yet</p>
                        <p className="text-slate-400 text-xs mt-1">Send a message to start the conversation</p>
                      </div>
                    ) : (
                      threadMessages.map((msg, idx) => {
                        const isOwn = msg.sender_id === user?.id || msg.sender_email === user?.email
                        const attachments = msg.attachments || []
                        return (
                          <div
                            key={msg.id || idx}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                isOwn
                                  ? 'bg-primary text-white'
                                  : 'bg-slate-100 text-slate-900'
                              }`}
                            >
                              {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                              {attachments.length > 0 && (
                                <div className={`mt-2 space-y-2 ${msg.content ? 'border-t' : ''} ${isOwn ? 'border-primary-300' : 'border-slate-200'} pt-2`}>
                                  {attachments.map((att, ai) => {
                                    const isImage = att.file_type?.startsWith('image/')
                                    const isPdf = att.file_type === 'application/pdf'
                                    const sizeKB = att.size_bytes ? Math.round(att.size_bytes / 1024) : null
                                    return (
                                      <div key={ai} className={`rounded border ${isOwn ? 'bg-primary-700 border-primary-600' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
                                        {isImage ? (
                                          <div>
                                            <a href={att.url} target="_blank" rel="noreferrer" className="block">
                                              <img src={att.url} alt={att.filename} className="max-w-[240px] max-h-[200px] object-cover hover:opacity-90 transition-opacity" />
                                            </a>
                                            <div className={`px-2 py-1 flex items-center justify-between ${isOwn ? 'bg-primary-800' : 'bg-slate-50'}`}>
                                              <span className={`text-xs truncate max-w-[160px] ${isOwn ? 'text-primary-200' : 'text-slate-500'}`}>{att.filename}</span>
                                              {sizeKB && <span className={`text-xs ${isOwn ? 'text-primary-300' : 'text-slate-400'}`}>{sizeKB}KB</span>}
                                            </div>
                                          </div>
                                        ) : isPdf ? (
                                          <div className="flex items-center gap-3 px-3 py-2">
                                            <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${isOwn ? 'bg-primary-600' : 'bg-red-50'}`}>
                                              <FileText size={20} className={isOwn ? 'text-white' : 'text-red-500'} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className={`text-sm font-medium truncate ${isOwn ? 'text-white' : 'text-slate-800'}`}>{att.filename}</p>
                                              {sizeKB && <p className={`text-xs ${isOwn ? 'text-primary-300' : 'text-slate-400'}`}>{sizeKB} KB</p>}
                                            </div>
                                            <a
                                              href={att.url}
                                              download={att.filename}
                                              className={`flex-shrink-0 px-3 py-1.5 rounded text-xs font-medium ${isOwn ? 'bg-primary-500 text-white hover:bg-primary-400' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} transition-colors`}
                                            >
                                              Download
                                            </a>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-3 px-3 py-2">
                                            <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${isOwn ? 'bg-primary-600' : 'bg-slate-100'}`}>
                                              <FileText size={20} className={isOwn ? 'text-white' : 'text-slate-500'} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className={`text-sm font-medium truncate ${isOwn ? 'text-white' : 'text-slate-800'}`}>{att.filename}</p>
                                              {sizeKB && <p className={`text-xs ${isOwn ? 'text-primary-300' : 'text-slate-400'}`}>{sizeKB} KB</p>}
                                            </div>
                                            <a
                                              href={att.url}
                                              download={att.filename}
                                              className={`flex-shrink-0 px-3 py-1.5 rounded text-xs font-medium ${isOwn ? 'bg-primary-500 text-white hover:bg-primary-400' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} transition-colors`}
                                            >
                                              Download
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                              <p className={`text-xs mt-1 ${isOwn ? 'text-primary-200' : 'text-slate-400'}`}>
                                {formatRelativeTime(msg.sent_at)}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*,.pdf"
                      multiple
                      className="hidden"
                    />
                    {pendingAttachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {pendingAttachments.map((att, idx) => (
                          <div key={idx} className={`relative flex items-center gap-2 rounded border px-2 py-1.5 text-xs max-w-[200px] ${att.preview ? 'bg-slate-50 border-slate-200' : 'bg-slate-50 border-slate-200'}`}>
                            {att.preview ? (
                              <img src={att.preview} alt={att.filename} className="w-8 h-8 object-cover rounded flex-shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center flex-shrink-0">
                                <FileText size={14} className="text-red-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-700 truncate text-xs">{att.filename}</p>
                              <p className="text-slate-400 text-[10px]">{att.mime_type.split('/')[1]?.toUpperCase() || 'FILE'}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(idx)}
                              className="flex-shrink-0 text-slate-400 hover:text-red-500 p-0.5 rounded hover:bg-red-50 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAttachmentClick}
                        className="text-slate-400 hover:text-primary p-2 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <Paperclip size={18} />
                      </button>
                      <textarea
                        value={sendingMessage}
                        onChange={e => setSendingMessage(e.target.value)}
                        placeholder="Type your message..."
                        rows={1}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage(e)
                          }
                        }}
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      />
                      <button
                        type="submit"
                        disabled={sending || (!sendingMessage.trim() && pendingAttachments.length === 0)}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <MessageSquare size={24} className="text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm">Select a conversation</p>
                  <p className="text-slate-400 text-xs mt-1">Choose a thread from the list to view messages</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
