'use client';

import { useState } from 'react';
import UploadPage from './UploadPage';
// import ResultsPage from './ResultsPage';

export default function SidebarTabs() {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Sidebar */}
        <div className="col-2">
          <div className="nav flex-column nav-pills" role="tablist" aria-orientation="vertical">
            <button
              className={`nav-link text-start ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              Upload Images
            </button>
            <button
              className={`nav-link text-start ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              Results
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="col-9">
          <div className="tab-content p-3 border rounded bg-light">
          {activeTab === 'upload' && <UploadPage />}
          {/* {activeTab === 'results' && <ResultsPage />} */}
          </div>
        </div>
      </div>
    </div>
  );
}
