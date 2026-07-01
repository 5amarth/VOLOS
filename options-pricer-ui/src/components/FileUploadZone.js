import React, { useRef, useState } from 'react';
import { parseMarketDataFile, downloadSampleTemplate } from '../utils/parseMarketData';
import './FileUploadZone.css';

export default function FileUploadZone({ onParsed }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState(null);
  const [status, setStatus] = useState(null); // { kept, dropped } | { error }
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setStatus(null);
    try {
      const { matrix, keptCount, droppedCount } = await parseMarketDataFile(file);
      onParsed(matrix);
      setStatus({ kept: keptCount, dropped: droppedCount });
    } catch (err) {
      onParsed([]);
      setStatus({ error: err.message || 'Could not parse file.' });
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  return (
    <div className="upload-zone-container">
      <div
        className={`upload-zone ${isDragging ? 'upload-zone--dragging' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleInputChange}
          className="upload-zone-input"
        />
        <span className="upload-zone-icon">&#9670;</span>
        <span className="upload-zone-text">
          {fileName ? fileName : 'Drop a .csv or .xlsx file, or click to browse'}
        </span>
        <span className="upload-zone-hint">Columns required: Option Price, Strike, Maturity, Type</span>
      </div>

      {status && !status.error && (
        <p className="upload-zone-status">
          Parsed <strong>{status.kept}</strong> row{status.kept !== 1 ? 's' : ''}
          {status.dropped > 0 && <> &mdash; dropped {status.dropped} invalid row{status.dropped !== 1 ? 's' : ''}</>}
        </p>
      )}
      {status && status.error && (
        <p className="upload-zone-status upload-zone-status--error">{status.error}</p>
      )}

      <button type="button" className="upload-zone-template" onClick={downloadSampleTemplate}>
        Download sample template CSV
      </button>
    </div>
  );
}
