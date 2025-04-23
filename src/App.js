import logo from './logo.svg';
import './App.css';
import Home from './HomePage'
import Test from './Test'
import TestSelect from './TestSelect';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Result from './Result';
import UploadData from './UploadData';
import FilterData from './FilterData';
import { useState } from 'react';
import Result2 from './Result2';
import Result3 from './Result3';
import Result4 from './Result4';
import Result5 from './Result5';
import Result6 from './Result6';

const App = () => {
  const [cleanedData, setCleanedData] = useState(null);
  const [processedData, setProcessedData] = useState(null);  // Add this state
  
  const handleDataProcessed = (data) => {
    console.log('Data processed:', data);
    setProcessedData(data);  // Store the processed data
  };

  const handleDataCleaned = (data) => {
    setCleanedData(data);
  };

  const handleTestSelected = (testId, data, component) => {
    console.log('Test selected:', testId, component);
    // Store the cleaned data in state to pass to Result component
    setCleanedData(data);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadData onDataProcessed={handleDataProcessed} />} />
        <Route path="/filter" element={
          <FilterData 
            processedData={processedData}
            onDataCleaned={handleDataCleaned} 
          />
        } />
        <Route path="/test" element={<Test />} />
        <Route path="/test-select" element={
          <TestSelect 
            cleanedData={cleanedData}
            onTestSelected={handleTestSelected}
          />
        } />
        <Route path="/result" element={<Result />} />
        <Route path="/result2" element={<Result2 />} />
        <Route path="/result3" element={<Result3 />} />
        <Route path="/result4" element={<Result4 />} />
        <Route path="/result5" element={<Result5 />} />
        <Route path="/result6" element={<Result6 />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
