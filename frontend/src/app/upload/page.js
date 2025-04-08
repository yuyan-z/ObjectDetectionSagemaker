'use client';

import { useState } from 'react';
import axios from 'axios';

export default function UploadPage() {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        const formData = new FormData();
        selectedFiles.forEach((file) => {
            formData.append('images', file);
        });

        setUploading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Upload success:', res.data);
            alert('Upload successful!');
        } catch (err) {
            console.error(err);
            alert('Upload failed.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <main className="container py-5">
            <h2 className="mb-4">Upload Images</h2>
            <div className="d-flex align-items-center gap-3 mb-3">
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="form-control"
                    style={{ maxWidth: '400px' }}
                />

                <button
                    onClick={handleUpload}
                    disabled={uploading || selectedFiles.length === 0}
                    className="btn btn-primary"
                >
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
            </div>

            {/* preview */}
            {selectedFiles.length > 0 && (
                <div className="mb-3 d-flex flex-wrap gap-3">
                    {selectedFiles.map((file, idx) => (
                        <>
                            <img
                                key={idx}
                                src={URL.createObjectURL(file)}
                                alt="preview"
                                style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }}
                            />
                        </>
                    ))}
                </div>
            )}
        </main>
    );
}
