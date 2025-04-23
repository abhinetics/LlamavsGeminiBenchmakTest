import React, { useState, useEffect } from 'react';
import { FileText, Upload, FileUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function UploadData({ onDataProcessed }) {
  const navigate = useNavigate();  // Add this line to initialize the navigate function
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  
  // Animation state for liquid
  const [liquidPosition, setLiquidPosition] = useState(0);
  
  // Animate the liquid
  useEffect(() => {
    const interval = setInterval(() => {
      setLiquidPosition(prev => (prev >= 100 ? 0 : prev + 1));
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileChange({ target: { files: [file] } });
    }
  };

  // Process the file from your original component
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setErrorMessage('');
    
    // Update UI state
    if (file) {
      setFileName(file.name);
      setFileType(file.name.endsWith('.csv') ? 'CSV' : 'Text');
    }
  };

  // Handle upload and processing from your original component
  const handleUpload = () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file.');
      return;
    }
    
    if (selectedFile.type !== 'text/plain' && !selectedFile.name.endsWith('.txt')) {
      setErrorMessage('Please select a valid plain text (.txt) file.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawData = e.target.result;
      const processedData = processRawData(rawData);
      onDataProcessed(processedData); // Send processed data to parent component
      navigate('/filter'); // Now this will work because navigate is properly initialized
    };
    reader.onerror = () => setErrorMessage('Error reading the file.');
    reader.readAsText(selectedFile);
  };

  // Process raw data from your original component
  const processRawData = (data) => {
    const lines = data.trim().split('\n').map(line => line.trim());
    return lines.map(line => {
      const parts = line.split('@');
      const text = parts[0].trim();
      const label = parts[1]?.trim() || '';
      return { text, label };
    });
  };

  // Calculate wave position based on animation state
  const wavePosition = Math.sin(liquidPosition * 0.1) * 15;

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center justify-center p-0" style={{ backgroundColor: '#f0f4f8' }}>
      <div className="w-full bg-white shadow-lg p-8 relative min-h-screen">
        
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Step 1: Upload Dataset</h1>
        
        <div className="flex flex-col items-center">
          {/* Conical Flask (Erlenmeyer Flask) SVG - Made wider at bottom */}
          <div className="relative w-full flex justify-center mb-8">
            <svg width="320" height="380" viewBox="0 0 320 380" className="drop-shadow-lg">
              {/* Flask outline - Wider at bottom */}
              <path 
                d="M90,30 L90,140 L30,320 L290,320 L230,140 L230,30 Z" 
                fill="none" 
                stroke="#334155" 
                strokeWidth="3"
              />
              
              {/* Flask neck */}
              <rect x="90" y="30" width="140" height="10" fill="#e2e8f0" stroke="#334155" strokeWidth="2" />
              <rect x="90" y="20" width="140" height="10" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
              
              {/* Base/Stand */}
              <rect x="20" y="320" width="280" height="12" rx="2" fill="#94a3b8" stroke="#334155" strokeWidth="2" />
              <rect x="40" y="332" width="240" height="12" rx="2" fill="#64748b" stroke="#334155" strokeWidth="2" />
              
              {/* Liquid in flask - with animated wave */}
              <defs>
                <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="50%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <clipPath id="flaskClip">
                  <path d="M90,30 L90,140 L30,320 L290,320 L230,140 L230,30 Z" />
                </clipPath>
              </defs>
              
              <path 
                d={`M20,200 
                    C90,${200 + wavePosition} 
                    230,${200 - wavePosition} 
                    300,200 
                    L320,340 
                    L0,340 Z`}
                fill="url(#liquidGradient)"
                clipPath="url(#flaskClip)"
                opacity="0.9"
              >
                <animate 
                  attributeName="d" 
                  dur="4s"
                  repeatCount="indefinite"
                  values={`
                    M20,200 C90,${200 + 20} 230,${200 - 20} 300,200 L320,340 L0,340 Z;
                    M20,200 C90,${200 - 20} 230,${200 + 20} 300,200 L320,340 L0,340 Z;
                    M20,200 C90,${200 + 20} 230,${200 - 20} 300,200 L320,340 L0,340 Z
                  `}
                />
              </path>
              
              {/* Bubbles in liquid - Add more bubbles */}
              <circle cx="90" cy="250" r="8" fill="rgba(255,255,255,0.6)" opacity="0.8">
                <animate 
                  attributeName="cy" 
                  dur="3s"
                  values="290;190"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="130" cy="260" r="6" fill="rgba(255,255,255,0.6)" opacity="0.8">
                <animate 
                  attributeName="cy" 
                  dur="4s"
                  values="290;200"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="170" cy="255" r="7" fill="rgba(255,255,255,0.6)" opacity="0.8">
                <animate 
                  attributeName="cy" 
                  dur="3.5s"
                  values="290;210"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="210" cy="260" r="5" fill="rgba(255,255,255,0.6)" opacity="0.8">
                <animate 
                  attributeName="cy" 
                  dur="2.8s"
                  values="290;200"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="110" cy="240" r="4" fill="rgba(255,255,255,0.6)" opacity="0.8">
                <animate 
                  attributeName="cy" 
                  dur="3.2s"
                  values="280;195"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="190" cy="245" r="6" fill="rgba(255,255,255,0.6)" opacity="0.8">
                <animate 
                  attributeName="cy" 
                  dur="3.7s"
                  values="285;205"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
            
            {/* Upload Button positioned over the middle of the flask */}
            <div className="absolute" style={{ top: '160px' }}>
              <form onSubmit={(e) => e.preventDefault()}>
                <label
                  htmlFor="fileUpload"
                  className={`flex flex-col items-center justify-center bg-white p-4 rounded-full h-28 w-28 cursor-pointer border-4 shadow-lg transition-all ${
                    dragActive ? 'border-indigo-500' : 'border-gray-200 hover:border-indigo-400'
                  }`}
                  style={{ boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)' }}
                >
                  <FileUp className="h-10 w-10 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700 mt-1">Upload</span>
                  <input
                    id="fileUpload"
                    name="fileUpload"
                    type="file"
                    accept=".txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </form>
            </div>
          </div>
          
          {/* Upload Area / File Information - Made wider */}
          <div 
            className={`w-full max-w-2xl rounded-lg px-8 py-10 ${
              fileName ? 'bg-blue-50 border border-blue-100' : ''
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
                {errorMessage}
              </div>
            )}
            
            {fileName ? (
              <div className="flex flex-col items-center space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 w-full">
                  <div className="flex items-center">
                    <FileText className="h-10 w-10 text-indigo-600 mr-4" />
                    <div>
                      <p className="font-medium text-gray-800 text-lg">{fileName}</p>
                      <p className="text-sm text-gray-500">
                        {selectedFile && `${selectedFile.size} bytes`}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-6 mt-6 w-full">
                  <button 
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
                    onClick={() => {
                      setSelectedFile(null);
                      setFileName('');
                      setFileType('');
                    }}
                  >
                    Change File
                  </button>
                  <button 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition shadow-md"
                    onClick={handleUpload}
                    disabled={!selectedFile}
                  >
                    Upload and Proceed
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center border-2 border-dashed border-gray-300 rounded-lg p-8">
                <p className="text-xl font-medium text-gray-700 mb-2">No file selected</p>
                <p className="text-base text-gray-500">
                  Click the upload button in the flask or drag &amp; drop your file here
                </p>
                <p className="text-sm text-gray-400 mt-4">Only .txt files are supported</p>
                <p className="text-sm text-gray-400">Format: text@label on each line</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Laboratory Elements - Enhanced and repositioned */}
        <div className="absolute left-2 top-1/4">
          <svg width="80" height="160" viewBox="0 0 80 160">
            <rect x="10" y="10" width="60" height="140" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
            <rect x="15" y="15" width="50" height="130" rx="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="20" y="20" width="40" height="15" fill="#bfdbfe" />
            <rect x="20" y="40" width="40" height="15" fill="#bfdbfe" />
            <rect x="20" y="60" width="40" height="15" fill="#bfdbfe" />
            <rect x="20" y="80" width="40" height="15" fill="#bfdbfe" />
            <rect x="20" y="100" width="40" height="15" fill="#bfdbfe" />
            <rect x="20" y="120" width="40" height="15" fill="#bfdbfe" />
          </svg>
        </div>
        
        <div className="absolute right-2 top-1/4">
          <svg width="80" height="160" viewBox="0 0 80 160">
            <circle cx="40" cy="40" r="30" fill="#fecaca" stroke="#ef4444" strokeWidth="1" />
            <circle cx="40" cy="110" r="30" fill="#bbf7d0" stroke="#22c55e" strokeWidth="1" />
          </svg>
        </div>

        {/* Adding lab equipment to bottom */}
        <div className="absolute left-10 bottom-6">
          <svg width="160" height="100" viewBox="0 0 160 100">
            {/* Test tubes */}
            <rect x="10" y="10" width="14" height="80" rx="7" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1" opacity="0.7" />
            <rect x="30" y="10" width="14" height="80" rx="7" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1" opacity="0.7" />
            <rect x="50" y="10" width="14" height="80" rx="7" fill="#fae8ff" stroke="#d946ef" strokeWidth="1" opacity="0.7" />
            
            {/* Laboratory equipment */}
            <rect x="80" y="40" width="60" height="30" rx="4" fill="#f1f5f9" stroke="#64748b" strokeWidth="1" />
            <rect x="85" y="45" width="50" height="20" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="95" cy="55" r="6" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1" />
            <circle cx="110" cy="55" r="6" fill="#c7d2fe" stroke="#6366f1" strokeWidth="1" />
            <circle cx="125" cy="55" r="6" fill="#ddd6fe" stroke="#8b5cf6" strokeWidth="1" />
          </svg>
        </div>
        
        <div className="absolute right-10 bottom-6">
          <svg width="160" height="100" viewBox="0 0 160 100">
            {/* Microscope shape */}
            <rect x="70" y="60" width="40" height="10" rx="2" fill="#64748b" stroke="#334155" strokeWidth="1" />
            <rect x="85" y="10" width="10" height="50" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
            <circle cx="90" cy="10" r="8" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
            <ellipse cx="90" cy="70" rx="30" ry="5" fill="#475569" stroke="#334155" strokeWidth="1" />
            
            {/* Beakers */}
            <rect x="10" y="30" width="30" height="40" rx="2" fill="rgba(219, 234, 254, 0.6)" stroke="#3b82f6" strokeWidth="1" />
            <rect x="10" y="25" width="30" height="5" rx="1" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1" />
            
            <rect x="120" y="30" width="30" height="40" rx="2" fill="rgba(237, 233, 254, 0.6)" stroke="#8b5cf6" strokeWidth="1" />
            <rect x="120" y="25" width="30" height="5" rx="1" fill="#ddd6fe" stroke="#8b5cf6" strokeWidth="1" />
          </svg>
        </div>
        
        {/* Footer - Adjusted to bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-sm text-gray-500 bg-gray-50 border-t border-gray-200">
          <p className="font-medium">Upload your data file to begin analysis</p>
          <p className="text-xs mt-1">Format: text@label on each line</p>
        </div>
      </div>
    </div>
  );
}

export default UploadData;