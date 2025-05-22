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

function Result4() {
    const location = useLocation();
    const cleanedData = location.state?.cleanedData || [];
    const [apiResults, setApiResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartData, setChartData] = useState({
        hallucinationDistribution: [],
        confidenceScores: [],
        timelineData: []
    });

    useEffect(() => {
        const analyzeHallucination = async () => {
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
                            fetch('https://llamageminibackend.onrender.com/api/llama-hallucination', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ text }),
                            }).then(res => res.json()).catch(err => {
                                console.error('Llama Error:', err);
                                return {};
                            }),
                            fetch('https://llamageminibackend.onrender.com/api/gemini-hallucination', {
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
                            hallucination_score: llamaResponse?.candidates?.[0]?.content?.parts?.[0]?.text || 'N/A',
                            analysis: geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || 'N/A'
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

        analyzeHallucination();
    }, [cleanedData]);

    useEffect(() => {
        if (apiResults) {
            // Process hallucination distribution
            const distribution = {
                'Factual': 0,
                'Hallucinated': 0,
                'Unsure': 0
            };

            apiResults.forEach(result => {
                const llamaResult = result.hallucination_score.trim();
                if (llamaResult in distribution) {
                    distribution[llamaResult]++;
                }
            });

            const hallucinationDistribution = Object.entries(distribution).map(([name, value]) => ({
                name,
                value
            }));

            // Process confidence scores
            const confidenceScores = apiResults.map((result, index) => ({
                text: result.text.substring(0, 20) + '...',
                llama_result: result.hallucination_score,
                gemini_result: result.analysis
            }));

            // Process timeline data
            const timelineData = apiResults.map((result, index) => ({
                index: index + 1,
                llama_result: result.hallucination_score,
                gemini_result: result.analysis
            }));

            setChartData({
                hallucinationDistribution,
                confidenceScores,
                timelineData
            });
        }
    }, [apiResults]);

    if (loading) {
        return <div className="loading-message">Analyzing Hallucination Risk...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="result-container">
            <h1>Hallucination Detection Results</h1>
            
            {/* Results Table */}
            <div className="table-container mb-8">
                {apiResults && apiResults.length > 0 ? (
                    <table className="results-table w-full">
                        <thead>
                            <tr>
                                <th>Text</th>
                                <th> Llama Hallucination Analysis</th>
                                <th>Gemini Hallucination Analysis</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apiResults.map((result, index) => (
                                <tr key={index}>
                                    <td>{result.text}</td>
                                    <td>{result.hallucination_score}</td>
                                    <td>{result.analysis}</td>
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
                {/* Hallucination Distribution */}
                <div className="chart-container">
                    <h3>Hallucination Risk Distribution</h3>
                    <PieChart width={400} height={300}>
                        <Pie
                            data={chartData.hallucinationDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.hallucinationDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </div>

                {/* Confidence Scores */}
                <div className="chart-container">
                    <h3>Model Confidence Scores</h3>
                    <BarChart
                        width={500}
                        height={300}
                        data={chartData.confidenceScores}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="text" />
                        <YAxis type="category" domain={['Factual', 'Unsure', 'Hallucinated']} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="llama_result" fill="#8884d8" name="Llama Result" />
                        <Bar dataKey="gemini_result" fill="#82ca9d" name="Gemini Result" />
                    </BarChart>
                </div>

                {/* Timeline Analysis */}
                <div className="chart-container">
                    <h3>Hallucination Analysis Timeline</h3>
                    <LineChart
                        width={500}
                        height={300}
                        data={chartData.timelineData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="index" />
                        <YAxis type="category" domain={['Factual', 'Unsure', 'Hallucinated']} />
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

export default Result4;