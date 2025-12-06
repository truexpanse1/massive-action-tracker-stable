import React, { useState } from 'react';
import { getRevenueAnalysis } from '../services/geminiService';

interface RevenueAIEvaluatorProps {
  productData: { product: string; revenue: number; count: number }[];
  timeframeText: string;
}

type AnalysisResult = {
    questions: string[];
    strategies: string[];
    reading: { title: string; author: string; description: string };
    quote: { text: string; author: string };
};

const RevenueAIEvaluator: React.FC<RevenueAIEvaluatorProps> = ({ productData, timeframeText }) => {
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGetAnalysis = async () => {
        if (productData.length === 0) {
            setError("No sales data available to analyze for this period.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await getRevenueAnalysis(productData, timeframeText);
            setAnalysis(result);
        } catch (err) {
            setError("Failed to generate AI analysis. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
            <h3 className="text-lg font-bold mb-4 bg-brand-gray/80 text-white p-2 rounded text-center">AI REVENUE ANALYSIS</h3>
            
            {!analysis && !isLoading && (
                 <div className="text-center p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Get AI-powered insights on your product sales, marketing strategies, and more.</p>
                    <button onClick={handleGetAnalysis} className="bg-brand-red text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition">
                        Analyze My Revenue
                    </button>
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                </div>
            )}
            
            {isLoading && (
                <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
                </div>
            )}

            {analysis && !isLoading && (
                <div className="space-y-6 animate-fade-in">
                    <div>
                        <h4 className="font-bold text-brand-red mb-2">Key Questions</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                            {analysis.questions.map((q, i) => <li key={i}>{q}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-bold text-brand-lime mb-2">Marketing Strategies</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                             {analysis.strategies.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-bold text-brand-blue mb-2">Recommended Reading</h4>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                           <p><span className="font-semibold">{analysis.reading.title}</span> by {analysis.reading.author}</p>
                           <p className="text-xs italic text-gray-500">{analysis.reading.description}</p>
                        </div>
                    </div>
                                       {analysis.quote && (

                     <div className="border-t border-dashed border-brand-light-border dark:border-brand-gray pt-4 text-center">
                         <blockquote className="italic text-gray-700 dark:text-gray-300">"{analysis.quote.text}"</blockquote>
                         <cite className="not-italic font-semibold text-sm text-gray-500 dark:text-gray-400">- {analysis.quote.author}</cite>
                    </div>
                  )}
                </div>
            )}
        </div>
    );
};

export default RevenueAIEvaluator;
