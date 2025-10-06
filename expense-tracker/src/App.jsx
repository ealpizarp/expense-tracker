import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Main App Component ---
const App = () => {
    // --- State Management ---
    const [expenses, setExpenses] = useState([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [isCategorizing, setIsCategorizing] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState('');
    const [error, setError] = useState(null);

    const categories = useMemo(() => ["Groceries", "Utilities", "Transport", "Entertainment", "Dining", "Shopping", "Health", "Other"], []);

    // --- Load expenses from Local Storage on initial render ---
    useEffect(() => {
        try {
            const storedExpenses = localStorage.getItem('expenses');
            if (storedExpenses) {
                const parsedExpenses = JSON.parse(storedExpenses);
                // Sort by date, newest first
                parsedExpenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setExpenses(parsedExpenses);
            }
        } catch (err) {
            console.error("Failed to load expenses from local storage:", err);
            setError("Could not load your saved data.");
        }
    }, []);

    // --- Save expenses to Local Storage whenever they change ---
    useEffect(() => {
        try {
            localStorage.setItem('expenses', JSON.stringify(expenses));
        } catch (err) {
            console.error("Failed to save expenses to local storage:", err);
            setError("Could not save your latest changes.");
        }
    }, [expenses]);


    // --- AI Categorization ---
    const handleCategorize = useCallback(async (currentDescription) => {
        if (!currentDescription) {
            setError("Please enter a description first.");
            return;
        }
        setIsCategorizing(true);
        setError(null);

        const systemPrompt = `You are an expert expense categorization assistant. Categorize the user's expense description into one of the following exact categories: ${categories.join(', ')}. Your response must be only one of these categories and nothing else.`;
        const userQuery = `Expense description: "${currentDescription}"`;

        try {
            const apiKey = ""; 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`API error: ${response.statusText}`);

            const result = await response.json();
            const suggestedCategory = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

            if (suggestedCategory && categories.includes(suggestedCategory)) {
                setCategory(suggestedCategory);
            } else {
                setCategory("Other");
                console.warn("Received invalid or no category from AI:", suggestedCategory);
            }
        } catch (err) {
            console.error("Categorization failed:", err);
            setError("AI categorization failed. Please select a category manually.");
            setCategory("Other");
        } finally {
            setIsCategorizing(false);
        }
    }, [categories]);

    // --- AI Parsing for Pasted Text ---
    const handlePaste = async (e) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        if (!pastedText) return;

        setIsParsing(true);
        setError(null);

        const systemPrompt = "You are an intelligent financial assistant. Extract the core expense description and the total amount from text like an email receipt. Respond with a JSON object with two keys: 'description' (a short, clean string) and 'amount' (a number). Example: for 'Order #123 from SuperMart for $45.67', respond with {\"description\": \"SuperMart order\", \"amount\": 45.67}. If no amount is found, use null.";

        try {
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const payload = {
                contents: [{ parts: [{ text: pastedText }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            description: { type: "STRING" },
                            amount: { type: "NUMBER" },
                        },
                        required: ["description", "amount"],
                    },
                },
            };
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`API error: ${response.statusText}`);

            const result = await response.json();
            const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (jsonText) {
                const parsedData = JSON.parse(jsonText);
                const newDescription = parsedData.description || 'Pasted content';
                setDescription(newDescription);
                setAmount(parsedData.amount?.toString() || '');
                // Automatically categorize after parsing
                handleCategorize(newDescription);
            } else {
                throw new Error("No content from API.");
            }

        } catch (err) {
            console.error("Pasting/Parsing failed:", err);
            setError("AI failed to read that. Please enter manually.");
            setDescription(pastedText.substring(0, 100)); // fallback to pasted text
        } finally {
            setIsParsing(false);
        }
    };

    // --- AI Spending Analysis ---
    const handleAnalysis = async () => {
        if (expenses.length < 3) {
            setError("Please add at least 3 expenses to get a meaningful analysis.");
            return;
        }
        setIsAnalyzing(true);
        setAnalysis('');
        setError(null);

        const expenseSummary = expenses.map(e => `${e.category}: $${e.amount.toFixed(2)} - ${e.description}`).join('\n');
        const systemPrompt = "You are a friendly and insightful financial analyst. Your tone is encouraging and helpful. Based on the user's expense list, provide a brief, actionable analysis. Identify the top 1-2 spending categories and offer 2-3 specific, creative, and practical saving tips related to those categories. Format your response in markdown, using bullet points for the tips.";
        const userQuery = `Here is my expense list:\n${expenseSummary}\n\nPlease provide a short analysis of my spending and some savings tips.`;

        try {
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`API error: ${response.statusText}`);

            const result = await response.json();
            const analysisText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (analysisText) {
                setAnalysis(analysisText);
            } else {
                throw new Error("No analysis content received from API.");
            }
        } catch (err) {
            console.error("Analysis failed:", err);
            setError("The AI analyst is unavailable right now. Please try again later.");
        } finally {
            setIsAnalyzing(false);
        }
    };


    // --- Form Submission ---
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description || !amount || !category) {
            setError("Please fill all fields and select a category.");
            return;
        }

        const newExpense = {
            id: Date.now(), // Use timestamp for a simple unique ID
            description,
            amount: parseFloat(amount),
            category,
            createdAt: new Date().toISOString(),
        };

        setExpenses(prevExpenses => [newExpense, ...prevExpenses]);
        
        // Reset form
        setDescription('');
        setAmount('');
        setCategory('');
        setError(null);
    };

    // --- Delete Expense ---
    const handleDelete = (id) => {
        setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
    };

    // --- Data for Chart ---
    const chartData = useMemo(() => {
        const dataMap = new Map();
        categories.forEach(cat => dataMap.set(cat, 0));
        
        expenses.forEach(expense => {
            if (dataMap.has(expense.category)) {
                dataMap.set(expense.category, dataMap.get(expense.category) + expense.amount);
            }
        });
        
        return Array.from(dataMap.entries()).map(([name, total]) => ({ name, total }));
    }, [expenses, categories]);


    // --- UI Rendering ---
    const isLoading = isCategorizing || isParsing;

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
            <div className="container mx-auto p-4 md:p-8">
                <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900">AI Expense Tracker</h1>
                    <p className="text-slate-600 mt-2">Your personal AI-powered financial assistant</p>
                </header>
                
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert" onClick={() => setError(null)}>{error}</div>}

                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- Input Form Section --- */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-2xl">
                                <div className="flex items-center space-x-2 text-slate-600">
                                   <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>{isParsing ? 'Reading...' : 'Categorizing...'}</span>
                                </div>
                            </div>
                        )}
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-3">Add New Expense</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
                                <input
                                    type="text"
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    onPaste={handlePaste}
                                    placeholder="e.g., Coffee or paste receipt"
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-slate-700">Amount ($)</label>
                                <input
                                    type="number"
                                    id="amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="e.g., 4.50"
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => handleCategorize(description)}
                                    disabled={isCategorizing || !description}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                                >
                                    ✨ Categorize with AI
                                </button>
                            </div>
                             <div>
                                <label htmlFor="category" className="block text-sm font-medium text-slate-700">Category</label>
                                <select 
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="" disabled>Select a category</option>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Add Expense
                            </button>
                        </form>
                    </div>

                    {/* --- Main Content Area --- */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* --- Chart & Analysis Section --- */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold">Spending Summary</h2>
                                <button onClick={handleAnalysis} disabled={isAnalyzing || expenses.length < 3} className="flex items-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300">
                                   {isAnalyzing ? (
                                       <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                   ) : '✨'}
                                    <span>{isAnalyzing ? 'Analyzing...' : 'Analyze My Spending'}</span>
                                </button>
                            </div>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip cursor={{fill: 'rgba(240, 240, 240, 0.5)'}} />
                                        <Legend />
                                        <Bar dataKey="total" fill="#4f46e5" name="Total Spent ($)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            {analysis && (
                                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-2 text-slate-800">AI Financial Analyst says:</h3>
                                    <div className="prose prose-sm max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }}></div>
                                </div>
                            )}
                        </div>
                        {/* --- Expense List Section --- */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                             <h2 className="text-2xl font-semibold mb-4 border-b pb-3">Recent Expenses</h2>
                             <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {expenses.length > 0 ? expenses.map(expense => (
                                    <div key={expense.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg hover:bg-slate-100 transition-colors">
                                        <div>
                                            <p className="font-semibold text-slate-800">{expense.description}</p>
                                            <p className="text-sm text-slate-500">{expense.category}</p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <p className="font-semibold text-lg text-slate-900">${expense.amount.toFixed(2)}</p>
                                            <button onClick={() => handleDelete(expense.id)} className="text-red-500 hover:text-red-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-slate-500 text-center py-4">No expenses added yet. Add one to get started!</p>
                                )}
                             </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;

