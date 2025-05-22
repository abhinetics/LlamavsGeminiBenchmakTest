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

function Result3() {
    const location = useLocation();
    const cleanedData = location.state?.cleanedData || [];
    const [apiResults, setApiResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartData, setChartData] = useState({
        toxicityDistribution: [],
        severityLevels: [],
        timelineData: []
    });

    useEffect(() => {
        const analyzeToxicity = async () => {
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
                            fetch('https://llamageminibackend.onrender.com/api/llama-toxicity', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ text }),
                            }).then(res => res.json()).catch(err => {
                                console.error('Llama Error:', err);
                                return {};
                            }),
                            fetch('https://llamageminibackend.onrender.com/api/gemini-toxicity', {
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
                            llama_toxicity_score: llamaResponse?.candidates?.[0]?.content?.parts?.[0]?.text || 'N/A',
                            gemini_toxicity_score: geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || 'N/A'
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

        analyzeToxicity();
    }, [cleanedData]);

    useEffect(() => {
        if (apiResults) {
            // Process toxicity distribution
            const distribution = {
                'Non-Toxic': 0,
                'Mildly Toxic': 0,
                'Moderately Toxic': 0,
                'Highly Toxic': 0
            };

            apiResults.forEach(result => {
                const llamaScore = result.llama_toxicity_score.trim();
                if (llamaScore in distribution) {
                    distribution[llamaScore]++;
                }
            });

            const toxicityDistribution = Object.entries(distribution).map(([name, value]) => ({
                name,
                value
            }));

            // Process severity levels
            const severityLevels = apiResults.map((result, index) => ({
                text: result.text.substring(0, 20) + '...',
                llama_score: result.llama_toxicity_score,
                gemini_score: result.gemini_toxicity_score
            }));

            // Process timeline data with categorical values
            const timelineData = apiResults.map((result, index) => ({
                index: index + 1,
                llama_score: result.llama_toxicity_score,
                gemini_score: result.gemini_toxicity_score
            }));

            setChartData({
                toxicityDistribution,
                severityLevels,
                timelineData
            });
        }
    }, [apiResults]);

    if (loading) {
        return <div className="loading-message">Analyzing Toxicity...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="result-container">
            <h1>Toxicity Detection Results</h1>
            
            <div className="table-container mb-8">
                {apiResults && apiResults.length > 0 ? (
                    <table className="results-table w-full">
                        <thead>
                            <tr>
                                <th>Text</th>
                                <th>Llama Toxicity Score</th>
                                <th>Gemini Toxicity Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apiResults.map((result, index) => (
                                <tr key={index}>
                                    <td>{result.text}</td>
                                    <td>{result.llama_toxicity_score}</td>
                                    <td>{result.gemini_toxicity_score}</td>
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
                    <h3>Toxicity Distribution</h3>
                    <PieChart width={400} height={300}>
                        <Pie
                            data={chartData.toxicityDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.toxicityDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </div>

                <div className="chart-container">
                    <h3>Toxicity Severity Levels</h3>
                    <BarChart
                        width={500}
                        height={300}
                        data={chartData.severityLevels}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="text" />
                        <YAxis type="category" domain={['Non-Toxic', 'Mildly Toxic', 'Moderately Toxic', 'Highly Toxic']} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="llama_score" fill="#8884d8" name="Llama Score" />
                        <Bar dataKey="gemini_score" fill="#82ca9d" name="Gemini Score" />
                    </BarChart>
                </div>

                <div className="chart-container">
                    <h3>Toxicity Timeline Analysis</h3>
                    <LineChart
                        width={500}
                        height={300}
                        data={chartData.timelineData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="index" />
                        <YAxis type="category" domain={['Non-Toxic', 'Mildly Toxic', 'Moderately Toxic', 'Highly Toxic']} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="llama_score" stroke="#8884d8" name="Llama Score" />
                        <Line type="monotone" dataKey="gemini_score" stroke="#82ca9d" name="Gemini Score" />
                    </LineChart>
                </div>
            </div>
        </div>
    );
}

export default Result3;