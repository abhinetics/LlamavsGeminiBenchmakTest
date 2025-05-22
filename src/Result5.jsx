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
                        const [llamaResponse, geminiResponse] = await Promise.all([
                            fetch('http://localhost:5800/api/llama-factuality', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ text }),
                            }).then(res => res.json()).catch(err => {
                                console.error('Llama Error:', err);
                                return {};
                            }),
                            fetch('http://localhost:5800/api/gemini-factuality', {
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
                            factuality_score: llamaResponse?.candidates?.[0]?.content?.parts?.[0]?.text || 'N/A',
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
                'Factual': 0,
                'Non-Factual': 0,
                'Unclear': 0
            };

            apiResults.forEach(result => {
                const llamaResult = result.factuality_score.trim();
                if (llamaResult in distribution) {
                    distribution[llamaResult]++;
                }
            });

            const factualityDistribution = Object.entries(distribution).map(([name, value]) => ({
                name,
                value
            }));

            // Process confidence scores
            const confidenceScores = apiResults.map((result, index) => ({
                text: result.text.substring(0, 20) + '...',
                llama_result: result.factuality_score,
                gemini_result: result.factuality_analysis
            }));

            // Process timeline data
            const timelineData = apiResults.map((result, index) => ({
                index: index + 1,
                llama_result: result.factuality_score,
                gemini_result: result.factuality_analysis
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
                                <th>Llama Factuality </th>
                                <th>Gemini Factuality</th>
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
                        <YAxis type="category" domain={['Factual', 'Non-Factual', 'Unclear']} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="llama_result" fill="#8884d8" name="Llama Result" />
                        <Bar dataKey="gemini_result" fill="#82ca9d" name="Gemini Result" />
                    </BarChart>
                </div>

                {/* Timeline Analysis */}
                <div className="chart-container">
                    <h3>Factuality Analysis Timeline</h3>
                    <LineChart
                        width={500}
                        height={300}
                        data={chartData.timelineData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="index" />
                        <YAxis type="category" domain={['Factual', 'Non-Factual', 'Unclear']} />
                        <Tooltip />
                        <Legend />
                        <Line type="stepAfter" dataKey="llama_result" stroke="#8884d8" name="Llama Result" />
                        <Line type="stepAfter" dataKey="gemini_result" stroke="#82ca9d" name="Gemini Result" />
                    </LineChart>
                </div>
            </div>
        </div>
    );
}

export default Result5;