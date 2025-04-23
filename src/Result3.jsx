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
                            toxicity_score: hfResponse?.[0]?.[0]?.score || 'N/A',
                            toxicity_analysis: geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || 'N/A'
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
                const score = parseFloat(result.toxicity_score);
                if (!isNaN(score)) {
                    if (score < 0.3) distribution['Non-Toxic']++;
                    else if (score < 0.6) distribution['Mildly Toxic']++;
                    else if (score < 0.8) distribution['Moderately Toxic']++;
                    else distribution['Highly Toxic']++;
                }
            });

            const toxicityDistribution = Object.entries(distribution).map(([name, value]) => ({
                name,
                value
            }));

            // Process severity levels
            const severityLevels = apiResults.map((result, index) => ({
                text: result.text.substring(0, 20) + '...',
                toxicity_score: parseFloat(result.toxicity_score) || 0
            }));

            // Process timeline data
            const timelineData = apiResults.map((result, index) => ({
                index: index + 1,
                toxicity_score: parseFloat(result.toxicity_score) || 0
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
            
            {/* Results Table */}
            <div className="table-container mb-8">
                {apiResults && apiResults.length > 0 ? (
                    <table className="results-table w-full">
                        <thead>
                            <tr>
                                <th>Text</th>
                                <th>Toxicity Score</th>
                                <th>Analysis</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apiResults.map((result, index) => (
                                <tr key={index}>
                                    <td>{result.text}</td>
                                    <td>{result.toxicity_score}</td>
                                    <td>{result.toxicity_analysis}</td>
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
                {/* Toxicity Distribution */}
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

                {/* Severity Levels */}
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
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="toxicity_score" fill="#8884d8" />
                    </BarChart>
                </div>

                {/* Timeline Analysis */}
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
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="toxicity_score" stroke="#8884d8" />
                    </LineChart>
                </div>
            </div>
        </div>
    );
}

export default Result3;