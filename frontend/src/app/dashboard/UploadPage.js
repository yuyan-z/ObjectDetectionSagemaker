'use client';

import { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function UploadPage() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = null;
  };

  const handleRemove = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    setUploading(true);

    try {
      console.log('UploadPage', Array.from(formData.entries()).length);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_API}/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true, // Allow backend to get cookies
        }
      );
      console.log('Upload success:', res.data);
      toast.success(`Successfully Uploaded ${res.data.count} files.`,{
        duration: 2000,
      });
      setSelectedFiles([]);
    } catch (err) {
      console.error(err);
      toast.error('Upload failed!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="container py-4">
      <Toaster />
      <div className="d-flex align-items-center gap-3 mb-3">
        {/* File input with label */}
        <label htmlFor="fileInput" className="btn btn-outline-secondary">
          Select Files
        </label>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="form-control"
          style={{ display: 'none' }}
        />

        <span className="text-muted">
          {selectedFiles.length > 0
            ? `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} selected`
            : 'No file selected'}
        </span>

        <button
          onClick={handleUpload}
          disabled={uploading || selectedFiles.length === 0}
          className="btn btn-primary ms-auto"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {/* Preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-3 d-flex flex-wrap gap-3">
          {selectedFiles.map((file, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                style={{
                  width: 100,
                  height: 100,
                  objectFit: 'cover',
                  borderRadius: 8,
                  border: '1px solid #ccc',
                }}
              />
              <button
                onClick={() => handleRemove(idx)}
                type="button"
                className="btn-close"
                aria-label="Remove"
                style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  padding: 4,
                }}
              ></button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
