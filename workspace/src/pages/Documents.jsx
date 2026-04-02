import { useState, useEffect } from 'react'
import { api } from '../services/api'
import {
  FileText,
  Upload,
  Trash2,
  X,
  File,
  Image,
  Table,
  CheckCircle2
} from 'lucide-react'

const categoryColors = {
  assessment: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  report: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  plan: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  id_document: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  other: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' }
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
  const [form, setForm] = useState({
    title: '',
    category: 'other',
    description: '',
    file: null
  })

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

  async function handleUpload(e) {
    e.preventDefault()
    if (!form.file || !form.title) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', form.file)
    formData.append('title', form.title)
    formData.append('category', form.category)
    if (form.description) formData.append('description', form.description)

    try {
      const res = await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setDocuments(prev => [res.data.document || { ...form, id: Date.now() }, ...prev])
      setShowUpload(false)
      setForm({ title: '', category: 'other', description: '', file: null })
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setUploading(false)
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

      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg w-fit">
        {['all', ...categories].map(cat => (
          <button
            key={cat}
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
        <form onSubmit={handleUpload} className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Upload Document</h3>
            <button type="button" onClick={() => setShowUpload(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">File</label>
              <input
                type="file"
                onChange={e => setForm({ ...form, file: e.target.files[0] })}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Document title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                rows={3}
                placeholder="Add a description..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </form>
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
                  <div className={`p-2.5 rounded-lg ${color} flex-shrink-0`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 text-sm truncate">{doc.title}</h3>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full capitalize ${catStyle.bg} ${catStyle.text}`}>
                      {doc.category === 'id_document' ? 'ID' : doc.category}
                    </span>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                      <span>{doc.uploaded_by_name}</span>
                      <span>·</span>
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
                  {deleteId === doc.id ? (
                    <div className="flex items-center gap-2">
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
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
