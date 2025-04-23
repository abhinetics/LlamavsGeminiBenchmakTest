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
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';
import './Result.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function Result6() {
    const location = useLocation();
    const cleanedData = location.state?.cleanedData || [];
    const [apiResults, setApiResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartData, setChartData] = useState({
        numericalDistribution: [],
        correlationData: [],
        trendAnalysis: []
    });

    useEffect(() => {
        const analyzeQuantitative = async () => {
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

                        // Extract numerical values from text using regex
                        const numbers = text.match(/\d+(\.\d+)?/g) || [];
                        const numericalValues = numbers.map(num => parseFloat(num));

                        return {
                            text: text,
                            numerical_values: numericalValues,
                            quantitative_score: hfResponse?.[0]?.[0]?.score || 'N/A',
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

        analyzeQuantitative();
    }, [cleanedData]);

    useEffect(() => {
        if (apiResults) {
            // Process numerical distribution
            const numericalCounts = {
                'Low Range (0-33)': 0,
                'Mid Range (34-66)': 0,
                'High Range (67-100)': 0
            };

            apiResults.forEach(result => {
                result.numerical_values.forEach(value => {
                    if (value <= 33) numericalCounts['Low Range (0-33)']++;
                    else if (value <= 66) numericalCounts['Mid Range (34-66)']++;
                    else numericalCounts['High Range (67-100)']++;
                });
            });

            const numericalDistribution = Object.entries(numericalCounts).map(([name, value]) => ({
                name,
                value
            }));

            // Generate correlation data
            const correlationData = apiResults.map((result, index) => ({
                index: index + 1,
                numerical_count: result.numerical_values.length,
                text_length: result.text.length
            }));

            // Generate trend analysis
            const trendAnalysis = apiResults.map((result, index) => ({
                index: index + 1,
                average_value: result.numerical_values.length > 0 
                    ? result.numerical_values.reduce((a, b) => a + b, 0) / result.numerical_values.length 
                    : 0
            }));

            setChartData({
                numericalDistribution,
                correlationData,
                trendAnalysis
            });
        }
    }, [apiResults]);

    if (loading) {
        return <div className="loading-message">Analyzing Quantitative Data...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="result-container">
            <h1>Quantitative Reasoning Results</h1>
            
            {/* Results Table */}
            <div className="table-container mb-8">
                {apiResults && apiResults.length > 0 ? (
                    <table className="results-table w-full">
                        <thead>
                            <tr>
                                <th>Text</th>
                                <th>Numerical Values</th>
                                <th>Analysis</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apiResults.map((result, index) => (
                                <tr key={index}>
                                    <td>{result.text}</td>
                                    <td>{result.numerical_values.join(', ')}</td>
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
                {/* Numerical Distribution */}
                <div className="chart-container">
                    <h3>Numerical Value Distribution</h3>
                    <PieChart width={400} height={300}>
                        <Pie
                            data={chartData.numericalDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.numericalDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </div>

                {/* Correlation Analysis */}
                <div className="chart-container">
                    <h3>Text Length vs Numerical Count Correlation</h3>
                    <ScatterChart
                        width={500}
                        height={300}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="text_length" name="Text Length" />
                        <YAxis dataKey="numerical_count" name="Number Count" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend />
                        <Scatter name="Data Points" data={chartData.correlationData} fill="#8884d8" />
                    </ScatterChart>
                </div>

                {/* Trend Analysis */}
                <div className="chart-container">
                    <h3>Average Value Trend</h3>
                    <LineChart
                        width={500}
                        height={300}
                        data={chartData.trendAnalysis}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="index" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="average_value" stroke="#8884d8" />
                    </LineChart>
                </div>
            </div>
        </div>
    );
}

export default Result6;