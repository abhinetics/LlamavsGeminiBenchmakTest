import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  BarChart, Bar, 
  PieChart, Pie, 
  ScatterChart, Scatter,
  LineChart, Line,
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Cell
} from 'recharts';
import './Result.css';

// Define COLORS constant
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Data processing functions
const processDistributionData = (results) => {
  const categories = ['Unbiased', 'Neutral', 'Biased'];
  const distribution = categories.map(category => ({
    category,
    Llama: 0,
    Gemini: 0
  }));
  
  results.forEach(result => {
    const llamaResponse = result.llama_bias_score.toLowerCase();
    const geminiResponse = result.gemini_bias_analysis.toLowerCase();
    
    categories.forEach((category, index) => {
      if (llamaResponse.includes(category.toLowerCase())) distribution[index].Llama++;
      if (geminiResponse.includes(category.toLowerCase())) distribution[index].Gemini++;
    });
  });
  
  return distribution;
};

const processCategoriesData = (results) => {
  const data = {
    Llama: { Unbiased: 0, Neutral: 0, Biased: 0 },
    Gemini: { Unbiased: 0, Neutral: 0, Biased: 0 }
  };
  
  results.forEach(result => {
    const llamaResponse = result.llama_bias_score.toLowerCase();
    const geminiResponse = result.gemini_bias_analysis.toLowerCase();
    
    if (llamaResponse.includes('unbiased')) data.Llama.Unbiased++;
    else if (llamaResponse.includes('neutral')) data.Llama.Neutral++;
    else if (llamaResponse.includes('biased')) data.Llama.Biased++;
    
    if (geminiResponse.includes('unbiased')) data.Gemini.Unbiased++;
    else if (geminiResponse.includes('neutral')) data.Gemini.Neutral++;
    else if (geminiResponse.includes('biased')) data.Gemini.Biased++;
  });
  
  return [
    { name: 'Unbiased', Llama: data.Llama.Unbiased, Gemini: data.Gemini.Unbiased },
    { name: 'Neutral', Llama: data.Llama.Neutral, Gemini: data.Gemini.Neutral },
    { name: 'Biased', Llama: data.Llama.Biased, Gemini: data.Gemini.Biased }
  ];
};

const processTimelineData = (results) => {
  return results.map((result, index) => ({
    index,
    Llama: result.llama_bias_score.toLowerCase().includes('unbiased') ? 'Unbiased' :
           result.llama_bias_score.toLowerCase().includes('neutral') ? 'Neutral' : 'Biased',
    Gemini: result.gemini_bias_analysis.toLowerCase().includes('unbiased') ? 'Unbiased' :
            result.gemini_bias_analysis.toLowerCase().includes('neutral') ? 'Neutral' : 'Biased'
  }));
};

const processComparativeData = (results) => {
  return results.map((result, index) => {
    const llamaResponse = result.llama_bias_score.toLowerCase();
    const geminiResponse = result.gemini_bias_analysis.toLowerCase();
    
    const getCategoryValue = (response) => {
      if (response.includes('unbiased')) return 'Unbiased';
      if (response.includes('neutral')) return 'Neutral';
      return 'Biased';
    };

    return {
      index,
      llama_category: getCategoryValue(llamaResponse),
      gemini_category: getCategoryValue(geminiResponse)
    };
  });
};

function Result2() {
    const location = useLocation();
    const cleanedData = location.state?.cleanedData || [];
    const [apiResults, setApiResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartData, setChartData] = useState({
        distribution: [],
        categories: [],
        comparative: [],
        timeline: []
    });
    
    // First useEffect for API calls
    useEffect(() => {
        const callApis = async () => {
            if (!cleanedData || cleanedData.length === 0) {
                setError('No cleaned data to process.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const results = await Promise.all(
                    cleanedData.map(async (text) => {
                        const [llamaResponse, geminiResponse] = await Promise.all([
                            fetch('https://llamageminibackend.onrender.com/api/llama-bias', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ text }),
                            }).then(res => res.json()).catch(err => {
                                console.error('Llama Error:', err);
                                return {};
                            }),
                            fetch('https://llamageminibackend.onrender.com/api/gemini-bias', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ text }),
                            }).then(res => res.json()).catch(err => {
                                console.error('Gemini Error:', err);
                                return {};
                            })
                        ]);

                        return {
                            text: text,
                            llama_bias_score: llamaResponse?.candidates?.[0]?.content?.parts?.[0]?.text || 'N/A',
                            gemini_bias_analysis: geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || 'N/A'
                        };
                    })
                );
                setApiResults(results);
            } catch (err) {
                setError('Failed to fetch API results.');
                console.error('API Error:', err);
            } finally {
                setLoading(false);
            }
        };

        callApis();
    }, [cleanedData]);

    useEffect(() => {
        if (apiResults) {
            const distribution = processDistributionData(apiResults);
            const categories = processCategoriesData(apiResults);
            const comparative = processComparativeData(apiResults);
            const timeline = processTimelineData(apiResults);

            setChartData({
                distribution,
                categories,
                comparative,
                timeline
            });
        }
    }, [apiResults]);

    if (loading) {
        return <div className="loading-message">Analyzing Bias...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="result-container">
            <h1>Bias Assessment Results</h1>
            
            <div className="table-container mb-8">
                {apiResults && apiResults.length > 0 ? (
                    <table className="results-table w-full">
                        <thead>
                            <tr>
                                <th>Text</th>
                                <th>Llama Bias Score</th>
                                <th>Gemini Bias Analysis</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apiResults.map((result, index) => (
                                <tr key={index}>
                                    <td>{result.text}</td>
                                    <td>{result.llama_bias_score}</td>
                                    <td>{result.gemini_bias_analysis}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No results to display.</p>
                )}
            </div>
            
            <div className="charts-grid">
                <div className="chart-container">
                    <h3>Bias Distribution Comparison</h3>
                    <BarChart width={500} height={300} data={chartData.distribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Llama" fill="#8884d8" />
                        <Bar dataKey="Gemini" fill="#82ca9d" />
                    </BarChart>
                </div>

                <div className="chart-container">
                    <h3>Bias Categories Comparison</h3>
                    <BarChart width={500} height={300} data={chartData.categories}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Llama" fill="#8884d8" />
                        <Bar dataKey="Gemini" fill="#82ca9d" />
                    </BarChart>
                </div>

                <div className="chart-container">
                    <h3>Bias Analysis Timeline</h3>
                    <LineChart width={500} height={300} data={chartData.timeline}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="index" />
                        <YAxis type="category" domain={['Unbiased', 'Neutral', 'Biased']} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Llama" stroke="#8884d8" />
                        <Line type="monotone" dataKey="Gemini" stroke="#82ca9d" />
                    </LineChart>
                </div>

                <div className="chart-container">
                    <h3>Model Comparison</h3>
                    <ScatterChart width={500} height={300}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="index" type="number" name="Index" />
                        <YAxis type="category" dataKey="category" name="Category" 
                               domain={['Unbiased', 'Neutral', 'Biased']} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend />
                        <Scatter 
                            name="Llama Analysis" 
                            data={chartData.comparative} 
                            dataKey="llama_category" 
                            fill="#8884d8" 
                        />
                        <Scatter 
                            name="Gemini Analysis" 
                            data={chartData.comparative} 
                            dataKey="gemini_category" 
                            fill="#82ca9d" 
                        />
                    </ScatterChart>
                </div>
            </div>
        </div>
    );
}

export default Result2;