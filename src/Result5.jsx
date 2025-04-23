import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  BarChart, Bar, 
  PieChart, Pie, 
  LineChart, Line,
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Cell
} from 'recharts';
import './Result.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function Result5() {
    const location = useLocation();
    const cleanedData = location.state?.cleanedData || [];
    const [apiResults, setApiResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartData, setChartData] = useState({
        factualityDistribution: [],
        confidenceScores: [],
        timelineData: []
    });

    useEffect(() => {
        const analyzeFactuality = async () => {
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
                            factuality_score: hfResponse?.[0]?.[0]?.score || 'N/A',
                            factuality_analysis: geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || 'N/A'
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

        analyzeFactuality();
    }, [cleanedData]);

    useEffect(() => {
        if (apiResults) {
            // Process factuality distribution
            const distribution = {
                'Highly Factual': 0,
                'Mostly Factual': 0,
                'Partially Factual': 0,
                'Not Factual': 0
            };

            apiResults.forEach(result => {
                const score = parseFloat(result.factuality_score);
                if (!isNaN(score)) {
                    if (score > 0.8) distribution['Highly Factual']++;
                    else if (score > 0.6) distribution['Mostly Factual']++;
                    else if (score > 0.4) distribution['Partially Factual']++;
                    else distribution['Not Factual']++;
                }
            });

            const factualityDistribution = Object.entries(distribution).map(([name, value]) => ({
                name,
                value
            }));

            // Process confidence scores
            const confidenceScores = apiResults.map((result, index) => ({
                text: result.text.substring(0, 20) + '...',
                factuality_score: parseFloat(result.factuality_score) || 0
            }));

            // Process timeline data
            const timelineData = apiResults.map((result, index) => ({
                index: index + 1,
                score: parseFloat(result.factuality_score) || 0
            }));

            setChartData({
                factualityDistribution,
                confidenceScores,
                timelineData
            });
        }
    }, [apiResults]);

    if (loading) {
        return <div className="loading-message">Analyzing Factuality...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="result-container">
            <h1>Factuality Evaluation Results</h1>
            
            {/* Results Table */}
            <div className="table-container mb-8">
                {apiResults && apiResults.length > 0 ? (
                    <table className="results-table w-full">
                        <thead>
                            <tr>
                                <th>Text</th>
                                <th>Factuality Score</th>
                                <th>Analysis</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apiResults.map((result, index) => (
                                <tr key={index}>
                                    <td>{result.text}</td>
                                    <td>{result.factuality_score}</td>
                                    <td>{result.factuality_analysis}</td>
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
                {/* Factuality Distribution */}
                <div className="chart-container">
                    <h3>Factuality Distribution</h3>
                    <PieChart width={400} height={300}>
                        <Pie
                            data={chartData.factualityDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.factualityDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </div>

                {/* Confidence Scores */}
                <div className="chart-container">
                    <h3>Factuality Confidence Scores</h3>
                    <BarChart
                        width={500}
                        height={300}
                        data={chartData.confidenceScores}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="text" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="factuality_score" fill="#8884d8" />
                    </BarChart>
                </div>

                {/* Timeline Analysis */}
                <div className="chart-container">
                    <h3>Factuality Score Timeline</h3>
                    <LineChart
                        width={500}
                        height={300}
                        data={chartData.timelineData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="index" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="score" stroke="#8884d8" />
                    </LineChart>
                </div>
            </div>
        </div>
    );
}

export default Result5;