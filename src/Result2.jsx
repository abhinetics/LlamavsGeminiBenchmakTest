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
  const ranges = ['0-0.2', '0.2-0.4', '0.4-0.6', '0.6-0.8', '0.8-1.0'];
  const distribution = ranges.map(range => ({ range, count: 0 }));
  
  results.forEach(result => {
    const score = parseFloat(result.hf_bias_score);
    if (!isNaN(score)) {
      const index = Math.min(Math.floor(score * 5), 4);
      distribution[index].count++;
    }
  });
  
  return distribution;
};

const processCategoriesData = (results) => {
  const categories = {
    'Low Bias': 0,
    'Moderate Bias': 0,
    'High Bias': 0
  };
  
  results.forEach(result => {
    const score = parseFloat(result.hf_bias_score);
    if (!isNaN(score)) {
      if (score < 0.3) categories['Low Bias']++;
      else if (score < 0.7) categories['Moderate Bias']++;
      else categories['High Bias']++;
    }
  });
  
  return Object.entries(categories).map(([name, value]) => ({ name, value }));
};

const processComparativeData = (results) => {
  return results.map((result, index) => ({
    index,
    hf_score: parseFloat(result.hf_bias_score) || 0,
    gemini_score: 0.5 // Placeholder as Gemini doesn't provide numeric scores
  }));
};

const processTimelineData = (results) => {
  return results.map((result, index) => ({
    index,
    bias_score: parseFloat(result.hf_bias_score) || 0
  }));
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
                        const [hfResponse, geminiResponse] = await Promise.all([
                            fetch('http://localhost:5800/api/hf-sentiment', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ text }),
                            }).then(res => res.json()).catch(err => {
                                console.error('Hugging Face Error:', err);
                                return {};
                            }),
                            fetch('http://localhost:5800/api/gemini-generate', {
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
                            hf_bias_score: hfResponse?.[0]?.[0]?.score || 'N/A',
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

    // Second useEffect for processing chart data
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
            
            {/* Results Table */}
            <div className="table-container mb-8">
                {apiResults && apiResults.length > 0 ? (
                    <table className="results-table w-full">
                        <thead>
                            <tr>
                                <th>Text</th>
                                <th>HuggingFace Bias Score</th>
                                <th>Gemini Bias Analysis</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apiResults.map((result, index) => (
                                <tr key={index}>
                                    <td>{result.text}</td>
                                    <td>{result.hf_bias_score}</td>
                                    <td>{result.gemini_bias_analysis}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No results to display.</p>
                )}
            </div>
            
            {/* Charts Section */}
            <div className="charts-grid">
                {/* Bias Score Distribution */}
                <div className="chart-container">
                    <h3>Bias Score Distribution</h3>
                    <BarChart width={500} height={300} data={chartData.distribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                </div>

                {/* Bias Categories */}
                <div className="chart-container">
                    <h3>Bias Categories</h3>
                    <PieChart width={500} height={300}>
                        <Pie
                            data={chartData.categories}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.categories.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </div>

                {/* Timeline Analysis */}
                <div className="chart-container">
                    <h3>Bias Score Timeline</h3>
                    <LineChart width={500} height={300} data={chartData.timeline}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="index" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="bias_score" stroke="#8884d8" />
                    </LineChart>
                </div>

                {/* Comparative Analysis */}
                <div className="chart-container">
                    <h3>Model Comparison</h3>
                    <ScatterChart width={500} height={300}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="index" type="number" name="Index" />
                        <YAxis type="number" name="Score" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend />
                        <Scatter name="HuggingFace Score" data={chartData.comparative} dataKey="hf_score" fill="#8884d8" />
                        <Scatter name="Gemini Score" data={chartData.comparative} dataKey="gemini_score" fill="#82ca9d" />
                    </ScatterChart>
                </div>
            </div>
        </div>
    );
}

export default Result2;