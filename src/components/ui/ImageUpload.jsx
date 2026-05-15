import { useState } from 'react'
import api from '../../services/api'

export default function ImageUpload({ value, onChange, label = 'Photo' }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value || null)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Preview local
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)

    // Upload
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      onChange(res.data.url)
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange('')
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      {preview ? (
        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200">
          <img src={preview} alt="preview"
            className="w-full h-full object-cover" />
          <button type="button" onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 transition">
            ✕
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <p className="text-white font-semibold">Upload en cours...</p>
            </div>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50 transition">
          <div className="text-center">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-sm text-gray-500">Cliquez pour ajouter une photo</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — max 5MB</p>
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          {uploading && <p className="text-green-600 text-sm mt-2">Upload en cours...</p>}
        </label>
      )}
    </div>
  )
}