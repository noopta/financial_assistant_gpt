import React, { useState } from 'react';

export function FileUploader() {
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFileChange = (event) => {
        // Filter out non-PDF files
        const pdfFiles = Array.from(event.target.files).filter(file => file.type === 'application/pdf');
        setSelectedFiles(pdfFiles);
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} multiple accept="application/pdf" />
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
}

export default FileUploader;