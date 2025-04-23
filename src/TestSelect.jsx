import React, { useState, useEffect } from 'react';
import { 
  Beaker, 
  ChevronRight, 
  BarChart2, 
  GitCompare, 
  FileText, 
  Microscope,
  AlertTriangle,
  Check,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';


function TestSelect({ cleanedData, onTestSelected }) {
  const [selectedTest, setSelectedTest] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [liquidEffects, setLiquidEffects] = useState({
    level: 0,
    color: '#4f46e5'
  });
  const navigate = useNavigate();

  // Animation for laboratory liquid effects
  useEffect(() => {
    const interval = setInterval(() => {
      setLiquidEffects(prev => ({
        ...prev,
        level: (prev.level + 1) % 100
      }));
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  const tests = [
    {
      id: 'test1',
      name: 'Sentiment Analysis',
      description: 'Analyze text sentiment using advanced NLP techniques',
      icon: <BarChart2 className="h-5 w-5 md:h-6 md:w-6" />,
      color: '#8b5cf6',
      component: 'TestOne'
    },
    {
      id: 'test2',
      name: 'Bias Assessment',
      description: 'Evaluate text for potential bias and fairness',
      icon: <Microscope className="h-5 w-5 md:h-6 md:w-6" />,
      color: '#ec4899',
      component: 'TestTwo'
    },
    {
      id: 'test3',
      name: 'Toxicity Detection',
      description: 'Detect and analyze toxic content in text',
      icon: <FileText className="h-5 w-5 md:h-6 md:w-6" />,
      color: '#10b981',
      component: 'TestThree'
    },
    {
      id: 'test4',
      name: 'Hallucination Detection',
      description: 'Detect and analyze AI model hallucinations in responses',
      icon: <Beaker className="h-5 w-5 md:h-6 md:w-6" />,
      color: '#3b82f6',
      component: 'TestFour'
    },
    {
      id: 'test5',
      name: 'Factuality Evaluation',
      description: 'Evaluate the factual accuracy and truthfulness of statements',
      icon: <AlertTriangle className="h-5 w-5 md:h-6 md:w-6" />,
      color: '#f59e0b',
      component: 'TestFive'
    },
    {
      id: 'test6',
      name: 'Quantitative Analysis',
      description: 'Statistical Analysis',
      icon: <BarChart2 className="h-5 w-5 md:h-6 md:w-6" />,
      color: '#6366f1',
      component: 'TestSix'
    }
  ];
  
  const handleTestSelect = (testId) => {
    // If already selected, deselect it; otherwise select it
    setSelectedTest(selectedTest === testId ? null : testId);
  };
  
  const handleRunTest = (testId) => {
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      // Find the selected test object
      const selectedTestObj = tests.find(test => test.id === testId);
      onTestSelected(testId, cleanedData, selectedTestObj.component);
    }, 800);
  };
  
  const handleCompareButtonClick = () => {
    if (!selectedTest) {
      alert('Please select a test to run');
      return;
    }
    
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      const selectedTestObj = tests.find(test => test.id === selectedTest);
      
      if (selectedTest === 'test1') {
        navigate('/result', { 
          state: { 
            cleanedData: cleanedData,
            processedData: [] 
          } 
        });
      } else if (selectedTest === 'test2') {
        navigate('/result2', { 
          state: { 
            cleanedData: cleanedData
          } 
        });
      } else if (selectedTest === 'test3') {
        navigate('/result3', { 
          state: { 
            cleanedData: cleanedData
          } 
        });
      } else if (selectedTest === 'test4') {
        navigate('/result4', { 
          state: { 
            cleanedData: cleanedData
          } 
        });
      } else if (selectedTest === 'test5') {
        navigate('/result5', { 
          state: { 
            cleanedData: cleanedData
          } 
        });
      } else if (selectedTest === 'test6') {
        navigate('/result6', { 
          state: { 
            cleanedData: cleanedData
          } 
        });
      }
    }, 800);
  };
  
  // Calculate wave position based on animation
  const wavePosition = Math.sin(liquidEffects.level * 0.1) * 15;
  
  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: '#f0f4f8' }}>
      <div className="w-full max-w-6xl bg-white shadow-lg p-4 md:p-8 relative rounded-lg mb-24">
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-4 md:mb-8 text-gray-800">Step 3: Test Selection</h1>
        
        {/* Laboratory Container - Hidden on very small screens */}
        <div className="relative mb-6 md:mb-10 hidden sm:block">
          <svg className="w-full h-24 md:h-32" viewBox="0 0 800 120" preserveAspectRatio="xMidYMid meet">
            {/* Laboratory shelf background */}
            <rect x="50" y="10" width="700" height="110" rx="4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
            
            {/* Test tubes containing the tests */}
            {tests.map((test, index) => {
              const xPos = 100 + index * (700/tests.length);
              return (
                <g key={test.id} className="cursor-pointer">
                  {/* Test tube */}
                  <rect 
                    x={xPos-15} 
                    y="20" 
                    width="30" 
                    height="60" 
                    rx="15"
                    fill="rgba(255,255,255,0.8)" 
                    stroke={test.color} 
                    strokeWidth="2"
                  />
                  
                  {/* Liquid in tube */}
                  <path 
                    d={`M${xPos-15},40 
                        C${xPos-5},${40 + wavePosition} 
                        ${xPos+5},${40 - wavePosition} 
                        ${xPos+15},40 
                        L${xPos+15},80 
                        Q${xPos+15},80 ${xPos},80
                        L${xPos-15},80
                        L${xPos-15},40 Z`}
                    fill={test.color}
                    opacity="0.7"
                  >
                    <animate 
                      attributeName="d" 
                      dur="3s"
                      repeatCount="indefinite"
                      values={`
                        M${xPos-15},40 C${xPos-5},${40 + 5} ${xPos+5},${40 - 5} ${xPos+15},40 L${xPos+15},80 Q${xPos+15},80 ${xPos},80 L${xPos-15},80 L${xPos-15},40 Z;
                        M${xPos-15},40 C${xPos-5},${40 - 5} ${xPos+5},${40 + 5} ${xPos+15},40 L${xPos+15},80 Q${xPos+15},80 ${xPos},80 L${xPos-15},80 L${xPos-15},40 Z;
                        M${xPos-15},40 C${xPos-5},${40 + 5} ${xPos+5},${40 - 5} ${xPos+15},40 L${xPos+15},80 Q${xPos+15},80 ${xPos},80 L${xPos-15},80 L${xPos-15},40 Z
                      `}
                    />
                  </path>
                  
                  {/* Test label */}
                  <text 
                    x={xPos} 
                    y="105" 
                    textAnchor="middle" 
                    fill="#334155" 
                    fontSize="10"
                    fontWeight="bold"
                    className="select-none"
                  >
                    {test.name.split(' ').map((word, i, arr) => (
                      <tspan 
                        key={i} 
                        x={xPos} 
                        dy={i === 0 ? 0 : 12}
                      >
                        {word}
                      </tspan>
                    ))}
                  </text>
                  
                  {/* Bubbles in test tube */}
                  <circle cx={xPos} cy="60" r="2" fill="white" opacity="0.8">
                    <animate 
                      attributeName="cy" 
                      dur="2s"
                      values="60;45"
                      begin={`${index * 0.3}s`}
                      repeatCount="indefinite"
                    />
                    <animate 
                      attributeName="opacity" 
                      dur="2s"
                      values="0.8;0"
                      begin={`${index * 0.3}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                  
                  <circle cx={xPos-5} cy="65" r="1.5" fill="white" opacity="0.6">
                    <animate 
                      attributeName="cy" 
                      dur="2.5s"
                      values="65;50"
                      begin={`${index * 0.3 + 0.2}s`}
                      repeatCount="indefinite"
                    />
                    <animate 
                      attributeName="opacity" 
                      dur="2.5s"
                      values="0.6;0"
                      begin={`${index * 0.3 + 0.2}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}
          </svg>
        </div>
        
        {/* Test Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-20">
          {tests.map(test => (
            <div 
              key={test.id}
              className={`border rounded-lg p-3 md:p-6 transition-all duration-300 cursor-pointer ${
                selectedTest === test.id 
                  ? `border-2 shadow-md` 
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow'
              }`}
              style={{ 
                borderColor: selectedTest === test.id ? test.color : '',
                backgroundColor: selectedTest === test.id ? `${test.color}15` : ''
              }}
              onClick={() => handleTestSelect(test.id)}
            >
              <div className="flex items-start">
                <div 
                  className="p-2 md:p-3 rounded-lg mr-3 md:mr-4" 
                  style={{ backgroundColor: `${test.color}20` }}
                >
                  <div style={{ color: test.color }}>{test.icon}</div>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-base md:text-lg text-gray-800">{test.name}</h3>
                  <p className="text-gray-600 text-xs md:text-sm mt-1">{test.description}</p>
                  
                  <div className="mt-3 md:mt-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <div 
                        className={`w-4 h-4 md:w-5 md:h-5 rounded flex items-center justify-center ${
                          selectedTest === test.id ? 'bg-indigo-600' : 'border border-gray-300'
                        }`}
                      >
                        {selectedTest === test.id && <Check className="h-2 w-2 md:h-3 md:w-3 text-white" />}
                      </div>
                      <span className="ml-2 text-xs md:text-sm text-gray-600">
                        {selectedTest === test.id ? 'Selected' : 'Select'}
                      </span>
                    </div>
                    
                    <button 
                      className="text-xs md:text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRunTest(test.id);
                      }}
                    >
                      Run <ArrowRight className="ml-1 h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Run Selected Test Button */}
        <div className="flex justify-center mt-6 md:mt-10 pb-16">
          <button
            onClick={handleCompareButtonClick}
            disabled={!selectedTest || animating}
            className={`group bg-gradient-to-r from-indigo-600 to-purple-600 ${
              !selectedTest ? 'opacity-60 cursor-not-allowed' : 'hover:from-indigo-700 hover:to-purple-700 transform transition-all duration-300 hover:scale-105'
            } text-white font-medium py-3 md:py-4 px-6 md:px-10 rounded-lg shadow-lg flex items-center text-sm md:text-base`}
          >
            {animating ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center">
                <GitCompare size={16} className="mr-2" />
                Run Selected Test
                <ChevronRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </div>
        
        {/* Additional Laboratory Decorations - Hidden on small screens */}
        <div className="absolute left-8 bottom-8 hidden md:block">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <rect x="10" y="10" width="60" height="60" rx="4" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="40" cy="40" r="25" fill="none" stroke="#cbd5e1" strokeWidth="1" />
            <circle cx="40" cy="40" r="15" fill="none" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="10" y1="40" x2="70" y2="40" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="40" y1="10" x2="40" y2="70" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
        </div>
        
        <div className="absolute right-8 bottom-8 hidden md:block">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <polygon points="10,70 70,70 40,10" fill="none" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="40" cy="10" r="3" fill="#cbd5e1" />
            <circle cx="10" cy="70" r="3" fill="#cbd5e1" />
            <circle cx="70" cy="70" r="3" fill="#cbd5e1" />
            <line x1="10" y1="70" x2="40" y2="40" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="40" y1="40" x2="70" y2="70" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="40" y1="40" x2="40" y2="10" stroke="#cbd5e1" strokeWidth="1" />
          </svg>
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 text-center text-xs md:text-sm text-gray-500 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <p className="font-medium">Laboratory Test Selection</p>
          <p className="text-xs mt-1 hidden sm:block">Select a test to analyze your cleaned data</p>
        </div>
      </div>
    </div>
  );
}

export default TestSelect;