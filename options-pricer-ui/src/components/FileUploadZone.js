import React, { useRef, useState } from 'react';
import { parseMarketDataFile, downloadSampleTemplate } from '../utils/parseMarketData';
import './FileUploadZone.css';

export default function FileUploadZone({ onParsed }) {
  const inputRef = useRef(null);
  const uploadId = useRef(0);
  const [fileName, setFileName] = useState(null);
  const [status, setStatus] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    const id = ++uploadId.current;
    setFileName(file.name);
    setStatus(null);
    onParsed([]);
    try {
      const { matrix, keptCount, droppedCount } = await parseMarketDataFile(file);
      if (id !== uploadId.current) return;
      onParsed(matrix);
      setStatus({ kept: keptCount, dropped: droppedCount });
    } catch (err) {
      if (id !== uploadId.current) return;
      setStatus({ error: err.message || 'Could not parse file.' });
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="upload-zone-container">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        aria-label="Option quotes file"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = '';
        }}
        hidden
      />
      <button
        type="button"
        className={`upload-zone ${isDragging ? 'upload-zone--dragging' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <svg className="upload-zone-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 15V4m-4 4 4-4 4 4M4 15v4h16v-4" />
        </svg>
        <span className="upload-zone-text">{fileName || 'Drop a spreadsheet here or choose a file'}</span>
        <span className="upload-zone-hint">CSV, XLSX, or XLS. Include option price, strike, maturity, and type.</span>
      </button>

      {status && !status.error && (
        <p className="upload-zone-status" role="status">
          Parsed <strong>{status.kept}</strong> row{status.kept !== 1 ? 's' : ''}
          {status.dropped > 0 && <> and skipped {status.dropped} invalid row{status.dropped !== 1 ? 's' : ''}</>}.
        </p>
      )}
      {status?.error && <p className="upload-zone-status upload-zone-status--error" role="alert">{status.error}</p>}

      <button type="button" className="upload-zone-template" onClick={downloadSampleTemplate}>
        Download sample CSV
      </button>
    </div>
  );
}
