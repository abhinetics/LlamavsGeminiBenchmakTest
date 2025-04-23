import React, { useState } from 'react';
   import './HomePage.css';
   import UploadData from './UploadData';
   import FilterData from './FilterData'; // Import FilterData
import TestSelect from './TestSelect'; // Import TestSelect

   function HomePage() {
       const [rawData, setRawData] = useState(null);
       const [currentStep, setCurrentStep] = useState(1);
       const [processedData, setProcessedData] = useState([]);
       const [cleanedData, setCleanedData] = useState(null);
       const [apiResults, setApiResults] = useState(null);

       const handleDataProcessed = (data) => {
           setProcessedData(data);
           setCurrentStep(2);
       };

       const handleDataCleaned = (data) => {
           setCleanedData(data);
           setCurrentStep(3);
       };

       const runApiComparison = async () => {
           if (!cleanedData) return;
           const results = await Promise.all(
               cleanedData.map(async (text, index) => {
                   console.log('Processing index:', index);
                   console.log('Text:', text);

                   // --- Hugging Face ---
                   console.log('Sending to HF:', text);
                   const hfResponse = await fetch('http://localhost:5800/api/hf-sentiment', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ text }),
                   });
                   console.log('HF Response:', hfResponse);
                   const hfData = await hfResponse.json();
                   console.log('HF Data:', hfData);

                   // --- Gemini ---
                   console.log('Sending to Gemini:', text);
                   const geminiResponse = await fetch('http://localhost:5800/api/gemini-generate', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ text }),
                   });
                   const geminiData = await geminiResponse.json();
                   console.log('Gemini Data:', geminiData);

                   // --- Llama 2 ---
                   console.log('Sending to Llama 2:', text);
                   const llamaResponse = await fetch('http://localhost:5800/api/llama2-sentiment', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ text }),
                   });
                   console.log('Llama 2 Response:', llamaResponse);
                   const llamaData = await llamaResponse.json();
                   console.log('Llama 2 Data:', llamaData);

                   return {
                       original_text: processedData[index]?.text, // Added optional chaining
                       expected_label: processedData[index]?.label, // Added optional chaining
                       cleaned_text: text,
                       hf_sentiment: hfData?.[0]?.[0]?.label,
                       gemini_response: geminiData?.candidates?.[0]?.content?.parts?.[0]?.text,
                       llama_sentiment: llamaData?.sentiment,
                       llama_full_response: llamaData?.full_response,
                   };
               })
           );

           setApiResults(results);
           setCurrentStep(4);
       };

       const renderStep = () => {
           switch (currentStep) {
               case 1:
                   return <UploadData onDataProcessed={handleDataProcessed} />;
               case 2:
                   return (
                       <FilterData
                           processedData={processedData}
                           onDataCleaned={handleDataCleaned}
                       />
                   );
               case 3:
                   return (
                       <div className="api-comparison-container">
                           {/* <h1>Step 3: Run API Comparison</h1>
                           <p>
                               Click the button below to compare sentiment using Hugging Face
                               and generate text using Gemini.
                           </p>
                           <button onClick={runApiComparison} className="run-button">
                               Run API Comparison
                           </button> */}
                          <TestSelect/>

                       </div>
                   );
               case 4:
                   return (
                       <div className="visualization-container">
                           <h1>Step 4: API Comparison Results</h1>
                           {apiResults && apiResults.length > 0 ? (
                               <div>
                                   <h2>Comparison:</h2>
                                   <table className="results-table">
                                       <thead>
                                           <tr>
                                               <th>Original Text</th>
                                               <th>Expected Label</th>
                                               <th>Cleaned Text</th>
                                               <th>Hugging Face Sentiment</th>
                                               <th>Gemini Response</th>
                                               <th>Llama 2 Sentiment</th>
                                           </tr>
                                       </thead>
                                       <tbody>
                                           {apiResults.map((result, index) => (
                                               <tr key={index}>
                                                   <td>{result?.original_text || 'N/A'}</td> {/* Added optional chaining */}
                                                   <td>{result?.expected_label || 'N/A'}</td> {/* Added optional chaining */}
                                                   <td>{result?.cleaned_text || 'N/A'}</td> {/* Added optional chaining */}
                                                   <td>{result?.hf_sentiment || 'N/A'}</td>
                                                   <td>{result?.gemini_response || 'N/A'}</td>
                                                   <td>{result?.llama_sentiment || 'N/A'}</td>
                                               </tr>
                                           ))}
                                       </tbody>
                                   </table>
                               </div>
                           ) : (
                               <p>No API comparison results to display.</p>
                           )}
                       </div>
                   );
               default:
                   return null;
           }
       };

       return <div className="homepage-container">{renderStep()}</div>;
   }

   export default HomePage;