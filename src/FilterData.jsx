import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Filter, ChevronRight, Beaker, Trash2, Settings } from 'lucide-react';


function FilterData({ processedData, onDataCleaned }) {
  const [options, setOptions] = useState({
    removePunctuation: false,
    toLowerCase: false,
    removeStopWords: false,
    removeNumbers: false,
    trimWhitespace: false,
  });
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);
  const [preview, setPreview] = useState('');
  const [liquidLevel, setLiquidLevel] = useState(0);
  const [bubblePositions, setBubblePositions] = useState([]);
  
  // Create random bubbles
  useEffect(() => {
    const bubbles = [];
    for (let i = 0; i < 8; i++) {
      bubbles.push({
        x: 80 + Math.random() * 160,
        delay: Math.random() * 5,
        size: 3 + Math.random() * 5,
        duration: 2 + Math.random() * 3
      });
    }
    setBubblePositions(bubbles);
  }, []);
  
  // Animate the liquid
  useEffect(() => {
    const interval = setInterval(() => {
      setLiquidLevel(prev => (prev >= 100 ? 0 : prev + 1));
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    // Initial animation on component mount
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
    
    // Set preview data if available
    if (processedData && processedData.length > 0) {
      setPreview(processedData[0].text?.substring(0, 100) + '...');
    }
  }, [processedData]);

  const handleOptionChange = (e) => {
    const { name, checked } = e.target;
    setOptions(prevOptions => ({
      ...prevOptions,
      [name]: checked,
    }));
  };

  const handleCleanData = () => {
    setIsAnimating(true);
    
    setTimeout(() => {
      if (!processedData) return;
      let cleanedTextArray = processedData.map(item => item.text);

      if (options.removePunctuation) {
        cleanedTextArray = cleanedTextArray.map(text => text.replace(/[^\w\s]/g, ''));
      }
      if (options.toLowerCase) {
        cleanedTextArray = cleanedTextArray.map(text => text.toLowerCase());
      }
      if (options.removeStopWords) {
        const stopWords = ['the', 'a', 'is', 'in', 'on', 'at', 'and', 'to', 'of', 'it', 'for', 'with', 'this', 'that'];
        cleanedTextArray = cleanedTextArray.map(text => 
          text.split(' ').filter(word => !stopWords.includes(word)).join(' ').trim()
        );
      }
      if (options.removeNumbers) {
        cleanedTextArray = cleanedTextArray.map(text => text.replace(/\d+/g, ''));
      }
      if (options.trimWhitespace) {
        cleanedTextArray = cleanedTextArray.map(text => text.replace(/\s+/g, ' ').trim());
      }

      onDataCleaned(cleanedTextArray);
      setIsAnimating(false);
      navigate('/test-select'); 
    }, 800);
  };

  // Calculate wave position based on animation state
  const wavePosition = Math.sin(liquidLevel * 0.1) * 15;

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center justify-center p-0" style={{ backgroundColor: '#f0f4f8' }}>
      <div className="w-full bg-white shadow-lg p-8 relative min-h-screen">
        
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Step 2: Data Cleaning Configuration</h1>
        
        <div className="flex flex-col items-center">
          {/* Filter Beaker SVG */}
          <div className="relative w-full flex justify-center mb-8">
            <svg width="320" height="350" viewBox="0 0 320 350" className="drop-shadow-lg">
              {/* Beaker/Filter container */}
              <defs>
                <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="50%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <clipPath id="beakerClip">
                  <path d="M70,80 L70,300 Q70,320 90,320 L230,320 Q250,320 250,300 L250,80 Z" />
                </clipPath>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              
              {/* Beaker body */}
              <path 
                d="M70,80 L70,300 Q70,320 90,320 L230,320 Q250,320 250,300 L250,80 Z" 
                fill="rgba(255,255,255,0.25)" 
                stroke="#94a3b8" 
                strokeWidth="2"
              />
              
              {/* Beaker top rim */}
              <path 
                d="M60,80 L70,80 L70,60 L250,60 L250,80 L260,80" 
                fill="none" 
                stroke="#94a3b8" 
                strokeWidth="2"
              />
              
              {/* Liquid in beaker - with animated wave */}
              <path 
                d={`M70,150 
                    C110,${150 + wavePosition} 
                    210,${150 - wavePosition} 
                    250,150 
                    L250,320 
                    Q250,320 230,320
                    L90,320
                    Q70,320 70,300
                    L70,150 Z`}
                fill="url(#liquidGradient)"
                clipPath="url(#beakerClip)"
                opacity="0.9"
              >
                <animate 
                  attributeName="d" 
                  dur="4s"
                  repeatCount="indefinite"
                  values={`
                    M70,150 C110,${150 + 15} 210,${150 - 15} 250,150 L250,320 Q250,320 230,320 L90,320 Q70,320 70,300 L70,150 Z;
                    M70,150 C110,${150 - 15} 210,${150 + 15} 250,150 L250,320 Q250,320 230,320 L90,320 Q70,320 70,300 L70,150 Z;
                    M70,150 C110,${150 + 15} 210,${150 - 15} 250,150 L250,320 Q250,320 230,320 L90,320 Q70,320 70,300 L70,150 Z
                  `}
                />
              </path>
              
              {/* Filter funnel */}
              <path 
                d="M120,10 L200,10 L230,80 L90,80 Z" 
                fill="#f1f5f9" 
                stroke="#94a3b8" 
                strokeWidth="2"
              />
              
              {/* Filter stem */}
              <rect x="150" y="10" width="20" height="30" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
              
              {/* Base/Stand */}
              <rect x="20" y="320" width="280" height="10" rx="2" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
              <rect x="40" y="330" width="240" height="10" rx="2" fill="#64748b" stroke="#334155" strokeWidth="1" />
              
              {/* Bubbles in liquid */}
              {bubblePositions.map((bubble, index) => (
                <circle 
                  key={index} 
                  cx={bubble.x} 
                  cy="280" 
                  r={bubble.size} 
                  fill="rgba(255,255,255,0.6)" 
                  opacity="0.8"
                >
                  <animate 
                    attributeName="cy" 
                    dur={`${bubble.duration}s`}
                    values="280;160"
                    begin={`${bubble.delay}s`}
                    repeatCount="indefinite"
                  />
                  <animate 
                    attributeName="opacity" 
                    dur={`${bubble.duration}s`}
                    values="0.8;0"
                    begin={`${bubble.delay}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ))}
              
              {/* Filter drops - animated */}
              <circle cx="160" cy="80" r="3" fill="url(#liquidGradient)" filter="url(#glow)">
                <animate 
                  attributeName="cy" 
                  dur="1.5s"
                  values="80;120"
                  repeatCount="indefinite"
                />
                <animate 
                  attributeName="opacity" 
                  dur="1.5s"
                  values="1;0"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="160" cy="80" r="3" fill="url(#liquidGradient)" filter="url(#glow)">
                <animate 
                  attributeName="cy" 
                  dur="1.5s"
                  values="80;120"
                  begin="0.5s"
                  repeatCount="indefinite"
                />
                <animate 
                  attributeName="opacity" 
                  dur="1.5s"
                  values="1;0"
                  begin="0.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="160" cy="80" r="3" fill="url(#liquidGradient)" filter="url(#glow)">
                <animate 
                  attributeName="cy" 
                  dur="1.5s"
                  values="80;120"
                  begin="1s"
                  repeatCount="indefinite"
                />
                <animate 
                  attributeName="opacity" 
                  dur="1.5s"
                  values="1;0"
                  begin="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
            
            {/* Filter Settings Button positioned above middle of filter */}
            <div className="absolute" style={{ top: '50px' }}>
              <div className="flex flex-col items-center justify-center bg-white p-4 rounded-full h-24 w-24 cursor-pointer border-4 border-indigo-100 shadow-lg">
                <Settings className="h-8 w-8 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700 mt-1">Filter</span>
                <span className="text-xs font-medium text-indigo-600 mt-1">Settings</span>
              </div>
            </div>
          </div>
          
          {/* Filter Options Area */}
          <div className="w-full max-w-2xl rounded-lg px-8 py-10 bg-blue-50 border border-blue-100">
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-2">
                <Beaker className="h-6 w-6 text-indigo-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Data Sample</h2>
              </div>
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 font-mono overflow-x-auto border border-gray-200">
                {preview || 'No data available for preview'}
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <Filter className="h-6 w-6 text-purple-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Select Filtering Operations</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors cursor-pointer">
                  <div className="w-6 h-6 bg-white rounded-md border border-gray-300 flex items-center justify-center mr-4">
                    {options.removePunctuation && <div className="w-4 h-4 rounded-sm bg-indigo-500"></div>}
                  </div>
                  <input
                    type="checkbox"
                    name="removePunctuation"
                    checked={options.removePunctuation}
                    onChange={handleOptionChange}
                    className="hidden"
                  />
                  <div>
                    <span className="font-medium text-gray-800">Remove Punctuation</span>
                    <p className="text-xs text-gray-500 mt-1">Remove all non-alphanumeric characters</p>
                  </div>
                </label>
                
                <label className="flex items-center bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors cursor-pointer">
                  <div className="w-6 h-6 bg-white rounded-md border border-gray-300 flex items-center justify-center mr-4">
                    {options.toLowerCase && <div className="w-4 h-4 rounded-sm bg-indigo-500"></div>}
                  </div>
                  <input
                    type="checkbox"
                    name="toLowerCase"
                    checked={options.toLowerCase}
                    onChange={handleOptionChange}
                    className="hidden"
                  />
                  <div>
                    <span className="font-medium text-gray-800">Convert to Lowercase</span>
                    <p className="text-xs text-gray-500 mt-1">Normalize case for all text</p>
                  </div>
                </label>
                
                <label className="flex items-center bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors cursor-pointer">
                  <div className="w-6 h-6 bg-white rounded-md border border-gray-300 flex items-center justify-center mr-4">
                    {options.removeStopWords && <div className="w-4 h-4 rounded-sm bg-indigo-500"></div>}
                  </div>
                  <input
                    type="checkbox"
                    name="removeStopWords"
                    checked={options.removeStopWords}
                    onChange={handleOptionChange}
                    className="hidden"
                  />
                  <div>
                    <span className="font-medium text-gray-800">Remove Stop Words</span>
                    <p className="text-xs text-gray-500 mt-1">Filter out common words like "the", "and", etc.</p>
                  </div>
                </label>
                
                <label className="flex items-center bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors cursor-pointer">
                  <div className="w-6 h-6 bg-white rounded-md border border-gray-300 flex items-center justify-center mr-4">
                    {options.removeNumbers && <div className="w-4 h-4 rounded-sm bg-indigo-500"></div>}
                  </div>
                  <input
                    type="checkbox"
                    name="removeNumbers"
                    checked={options.removeNumbers}
                    onChange={handleOptionChange}
                    className="hidden"
                  />
                  <div>
                    <span className="font-medium text-gray-800">Remove Numbers</span>
                    <p className="text-xs text-gray-500 mt-1">Remove all numerical digits</p>
                  </div>
                </label>
                
                <label className="flex items-center bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors cursor-pointer">
                  <div className="w-6 h-6 bg-white rounded-md border border-gray-300 flex items-center justify-center mr-4">
                    {options.trimWhitespace && <div className="w-4 h-4 rounded-sm bg-indigo-500"></div>}
                  </div>
                  <input
                    type="checkbox"
                    name="trimWhitespace"
                    checked={options.trimWhitespace}
                    onChange={handleOptionChange}
                    className="hidden"
                  />
                  <div>
                    <span className="font-medium text-gray-800">Trim Whitespace</span>
                    <p className="text-xs text-gray-500 mt-1">Normalize spaces and remove excess whitespace</p>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="flex justify-center mt-8">
              <button 
                onClick={handleCleanData} 
                className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-4 px-10 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 flex items-center"
                disabled={isAnimating}
              >
                {isAnimating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Data...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Trash2 size={20} className="mr-2" />
                    Clean Data and Proceed
                    <ChevronRight size={20} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Laboratory Elements - Left side */}
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
        
        {/* Laboratory Elements - Right side */}
        <div className="absolute right-2 top-1/4">
          <svg width="80" height="160" viewBox="0 0 80 160">
            <circle cx="40" cy="40" r="30" fill="#fecaca" stroke="#ef4444" strokeWidth="1" />
            <circle cx="40" cy="110" r="30" fill="#bbf7d0" stroke="#22c55e" strokeWidth="1" />
          </svg>
        </div>

        {/* Adding lab equipment to bottom left */}
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
        
        {/* Adding lab equipment to bottom right */}
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
        
        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-sm text-gray-500 bg-gray-50 border-t border-gray-200">
          <p className="font-medium">Data Filtering Laboratory</p>
          <p className="text-xs mt-1">Select filtering operations for your dataset</p>
        </div>
      </div>
    </div>
  );
}

export default FilterData;