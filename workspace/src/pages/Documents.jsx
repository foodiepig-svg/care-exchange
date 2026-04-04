import { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'
import {
  FileText,
  Upload,
  Trash2,
  X,
  File,
  Image,
  Table,
  Download,
  CheckCircle2,
} from 'lucide-react'

const categoryColors = {
  assessment: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  report: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  plan: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  id_document: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  other: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
}

function getFileIcon(mimeType) {
  if (mimeType?.includes('pdf')) return { icon: File, color: 'text-red-600 bg-red-50' }
  if (mimeType?.includes('word') || mimeType?.includes('document')) return { icon: FileText, color: 'text-blue-600 bg-blue-50' }
  if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return { icon: Table, color: 'text-green-600 bg-green-50' }
  if (mimeType?.includes('image')) return { icon: Image, color: 'text-violet-600 bg-violet-50' }
  return { icon: File, color: 'text-slate-600 bg-slate-50' }
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const categories = ['assessment', 'report', 'plan', 'id_document', 'other']

export default function Documents() {
  const [documents, setDocuments] = useState([])
  const [filter, setFilter] = useState('all')
  const [showUpload, setShowUpload] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState(null)
  const [downloadingId, setDownloadingId] = useState(null)
  const [form, setForm] = useState({
    title: '',
    category: 'other',
    description: '',
    file: null,
  })
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  async function loadDocuments() {
    try {
      const res = await api.get('/documents')
      setDocuments(res.data.documents || [])
    } catch (err) {
      console.error('Failed to load documents', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Upload flow (presigned S3/R2):
   * 1. POST /documents/presign → get upload_url + storage_key
   * 2. PUT file directly to upload_url (browser → S3)
   * 3. POST /documents with storage_key + metadata → create DB record
   */
  async function handleUpload(e) {
    e.preventDefault()
    if (!form.file || !form.title) return

    setUploading(true)
    setUploadProgress(0)
    setUploadError(null)

    try {
      // Step 1: Get presigned upload URL
      setUploadProgress(10)
      let storage_key, upload_url
      try {
        const presignRes = await api.post('/documents/presign', {
          filename: form.file.name,
          content_type: form.file.type || 'application/octet-stream',
        })
        storage_key = presignRes.data.storage_key
        upload_url = presignRes.data.upload_url
      } catch (presignErr) {
        // S3 not configured — fall back to direct multipart upload
        if (presignErr?.response?.status === 503) {
          await handleUploadFallback()
          return
        }
        throw presignErr
      }

      // Step 2: Upload file directly to S3/R2 via presigned URL
      setUploadProgress(30)
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', upload_url)
        xhr.setRequestHeader('Content-Type', form.file.type || 'application/octet-stream')
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            const pct = 10 + Math.round((ev.loaded / ev.total) * 60)
            setUploadProgress(pct)
          }
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else reject(new Error(`S3 upload failed: HTTP ${xhr.status}`))
        }
        xhr.onerror = () => reject(new Error('S3 upload network error'))
        xhr.send(form.file)
      })

      // Step 3: Create DB record
      setUploadProgress(95)
      const res = await api.post('/documents', {
        storage_key,
        original_filename: form.file.name,
        file_type: form.file.type || 'application/octet-stream',
        file_size: form.file.size,
        title: form.title,
        category: form.category,
        description: form.description || '',
      })

      setUploadProgress(100)
      setDocuments(prev => [res.data.document, ...prev])
      setShowUpload(false)
      setForm({ title: '', category: 'other', description: '', file: null })
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      console.error('Upload failed', err)
      setUploadError(err?.response?.data?.error || err.message || 'Upload failed')
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1500)
    }
  }

  /** Fallback: direct multipart upload to backend (dev / no S3) */
  async function handleUploadFallback() {
    setUploadProgress(20)
    const formData = new FormData()
    formData.append('file', form.file)
    formData.append('title', form.title)
    formData.append('category', form.category)
    if (form.description) formData.append('description', form.description)

    try {
      const res = await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (ev) => {
          if (ev.lengthComputable) {
            setUploadProgress(Math.round((ev.loaded / ev.total) * 95))
          }
        },
      })
      setUploadProgress(100)
      setDocuments(prev => [res.data.document, ...prev])
      setShowUpload(false)
      setForm({ title: '', category: 'other', description: '', file: null })
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      console.error('Upload failed', err)
      setUploadError(err?.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1500)
    }
  }

  async function handleDownload(doc) {
    setDownloadingId(doc.id)
    try {
      // GET /documents/:id/download redirects to presigned S3 URL (or serves local file)
      const win = window.open(`/api/v1/documents/${doc.id}/download`, '_blank')
      if (!win) {
        // Popup blocked — use hidden iframe as fallback
        const iframe = document.createElement('iframe')
        iframe.style.display = 'none'
        iframe.src = `/api/v1/documents/${doc.id}/download`
        document.body.appendChild(iframe)
        setTimeout(() => document.body.removeChild(iframe), 10000)
      }
    } catch (err) {
      console.error('Download failed', err)
    } finally {
      setTimeout(() => setDownloadingId(null), 3000)
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/documents/${id}`)
      setDocuments(prev => prev.filter(d => d.id !== id))
      setDeleteId(null)
    } catch (err) {
      console.error('Delete failed', err)
    }
  }

  const filtered = filter === 'all'
    ? documents
    : documents.filter(d => d.category === filter)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Upload size={16} />
          Upload
        </button>
      </div>

      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg w-fit" role="tablist">
        {['all', ...categories].map(cat => (
          <button
            key={cat}
            role="tab"
            aria-selected={filter === cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
              filter === cat
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {cat === 'id_document' ? 'ID' : cat}
          </button>
        ))}
      </div>

      {showUpload && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-dialog-title"
        >
          <form
            onSubmit={handleUpload}
            className="bg-white rounded-xl border border-slate-200 p-6 w-full max-w-md mx-4 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 id="upload-dialog-title" className="font-semibold text-slate-900">Upload Document</h3>
              <button
                type="button"
                onClick={() => { setShowUpload(false); setUploadError(null) }}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close upload dialog"
              >
                <X size={20} />
              </button>
            </div>

            {uploadError && (
              <div role="alert" className="mb-4 bg-rose-50 text-rose-700 text-sm px-4 py-3 rounded-lg border border-rose-200">
                {uploadError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="doc-file" className="block text-sm font-medium text-slate-700 mb-1">File</label>
                <input
                  id="doc-file"
                  ref={fileInputRef}
                  type="file"
                  onChange={e => setForm({ ...form, file: e.target.files[0] })}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  required
                />
                {form.file && (
                  <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-green-500" />
                    {form.file.name} ({formatFileSize(form.file.size)})
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="doc-title" className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  id="doc-title"
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Document title"
                  required
                />
              </div>

              <div>
                <label htmlFor="doc-category" className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  id="doc-category"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'id_document' ? 'ID Document' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="doc-description" className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
                <textarea
                  id="doc-description"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  rows={3}
                  placeholder="Add a description..."
                />
              </div>

              {uploading && uploadProgress > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowUpload(false); setUploadError(null) }}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !form.file}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <File size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No documents found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(doc => {
            const { icon: Icon, color } = getFileIcon(doc.file_type)
            const catStyle = categoryColors[doc.category] || categoryColors.other
            return (
              <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
                <div className="flex gap-3">
                  <div className={`p-2.5 rounded-lg ${color} flex-shrink-0`} aria-hidden="true">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 text-sm truncate">{doc.title}</h3>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full capitalize ${catStyle.bg} ${catStyle.text}`}>
                      {doc.category === 'id_document' ? 'ID' : doc.category}
                    </span>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                      <span>{doc.uploaded_by_name}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatFileSize(doc.file_size)}</span>
                    </div>
                    {doc.description && (
                      <p className="text-xs text-slate-400 mt-1 truncate">{doc.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDownload(doc)}
                      disabled={downloadingId === doc.id}
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                      aria-label={`Download ${doc.title}`}
                    >
                      {downloadingId === doc.id ? (
                        <span className="text-xs animate-pulse">...</span>
                      ) : (
                        <Download size={14} />
                      )}
                    </button>
                    {deleteId === doc.id ? (
                      <div className="flex items-center gap-2" role="group" aria-label="Confirm delete">
                        <span className="text-xs text-slate-500">Delete?</span>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="text-xs text-red-600 font-medium"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="text-xs text-slate-500"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteId(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label={`Delete ${doc.title}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
