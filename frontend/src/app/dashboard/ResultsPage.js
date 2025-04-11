'use client';

import { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function ResultsPage() {
  const [selectedDate, setSelectedDate] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState([]);
  const [filesCount, setFilesCount] = useState(0);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setFiles([]);

    try {
      console.log(`Select date: ${selectedDate}`);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_API}/getOutput`,
        { date: selectedDate },
        {
          withCredentials: true,  // Allow backend to get cookies
        }
      );

      setFilesCount(res.data.count);
      toast.success(`Successfully got ${res.data.count} files.`, {
        duration: 2000,
      });

      setFiles(res.data.files);
    } catch (err) {
      console.error(err);
      toast.error('Get results failed!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container py-4">
      <Toaster />
      <div className="d-flex align-items-center gap-3 mb-3">
        <input
          type="date"
          className="form-control"
          value={selectedDate}
          onChange={handleDateChange}
          max={today}
          style={{ maxWidth: '200px' }}
        />

        <span className="text-muted">
          {filesCount > 0
            ? `${filesCount} results found`
            : 'No results found'}
        </span>

        <button
          className="btn btn-primary ms-auto"
          onClick={handleSubmit}
          disabled={submitting | selectedDate === ''}
        >
          View Results
        </button>
      </div>

      <div className="row">
        {files.map((file, index) => (
          <div key={index} className="col-md-4 mb-4">
            <div className="card">
              <img
                src={`data:image/jpeg;base64,${file.base64}`}
                className="card-img-top"
                alt={file.key}
              />
              <div className="card-body">
                <p className="card-text text-center">{file.key}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
