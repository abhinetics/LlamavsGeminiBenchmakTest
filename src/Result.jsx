import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

// Define colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function Result() {
    const location = useLocation();
    const cleanedData = location.state?.cleanedData || [];
    const [apiResults, setApiResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Move useState hook to top level
    const [chartData, setChartData] = useState({
        sentimentDistribution: [],
        responseComparison: [],
        sentimentTimeline: []
    });

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
                    cleanedData.map(async (text, index) => {
                        const [llamaResponse, geminiResponse] = await Promise.all([
                            fetch('http://localhost:5800/api/llama-generate', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ text }),
                            }).then(res => res.json()).catch(err => {
                                console.error('llama Error:', err);
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
                            cleaned_text: text,
                            llama_sentiment: geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || 'N/A',
                            gemini_response: geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || 'N/A'
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

    // Move useEffect hook for chart data to top level
    useEffect(() => {
        if (apiResults) {
            // Process sentiment distribution
            const distribution = {};
            apiResults.forEach(result => {
                const sentiment = result.hf_sentiment;
                distribution[sentiment] = (distribution[sentiment] || 0) + 1;
            });
            
            const sentimentDistribution = Object.entries(distribution).map(([name, value]) => ({
                name,
                value
            }));

            // Process response comparison
            const responseComparison = apiResults.map((result, index) => ({
                index: index + 1,
                text: result.cleaned_text.substring(0, 20) + '...',
                Llama: result.llama_sentiment,
                Gemini: result.gemini_response
            }));

            // Process sentiment timeline
            const sentimentTimeline = apiResults.map((result, index) => ({
                index: index + 1,
                sentiment: result.hf_sentiment
            }));

            setChartData({
                sentimentDistribution,
                responseComparison,
                sentimentTimeline
            });
        }
    }, [apiResults]);

    if (loading) {
        return <div className="loading-message">Loading API Results...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="result-container">
            <h1>Sentiment Analysis Results</h1>
            
            {/* Results Table */}
            {apiResults && apiResults.length > 0 ? (
                <>
                    <div className="table-container">
                        <table className="results-table">
                            <thead>
                                <tr>
                                    <th>Text</th>
                                    <th>Llama Sentiment</th>
                                    <th>Gemini Response</th>
                                </tr>
                            </thead>
                            <tbody>
                                {apiResults.map((result, index) => (
                                    <tr key={index}>
                                        <td>{result.cleaned_text}</td>
                                        <td className={`sentiment ${result.llama_sentiment.toLowerCase()}`}>
                                            {result.llama_sentiment}
                                        </td>
                                        <td>{result.gemini_response}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Charts Section */}
                    <div className="charts-grid">
                        {/* Sentiment Distribution */}
                        <div className="chart-container">
                            <h3>Sentiment Distribution</h3>
                            <PieChart width={400} height={300}>
                                <Pie
                                    data={chartData.sentimentDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {chartData.sentimentDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </div>

                        {/* Model Comparison */}
                        <div className="chart-container">
                            <h3>Model Response Comparison</h3>
                            <BarChart
                                width={500}
                                height={300}
                                data={chartData.responseComparison}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="text" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Llama" fill="#8884d8" />
                                <Bar dataKey="Gemini" fill="#82ca9d" />
                            </BarChart>
                        </div>

                        {/* Sentiment Timeline */}
                        <div className="chart-container">
                            <h3>Sentiment Analysis Timeline</h3>
                            <LineChart
                                width={500}
                                height={300}
                                data={chartData.sentimentTimeline}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="index" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="sentiment" stroke="#8884d8" />
                            </LineChart>
                        </div>
                    </div>
                </>
            ) : (
                <p>No results to display.</p>
            )}
        </div>
    );
}

export default Result;