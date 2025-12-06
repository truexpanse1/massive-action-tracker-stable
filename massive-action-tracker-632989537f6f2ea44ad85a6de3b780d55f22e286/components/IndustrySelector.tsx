
import React, { useState, useEffect } from 'react';
import { getProductsForIndustry } from '../services/geminiService';

interface IndustrySelectorProps {
  onProductSelect: (productName: string) => void;
}

const predefinedIndustries = [
    'Business Coach', 'Landscaper', 'Hardscaper', 'Painter', 'Plumber', 
    'Electrician', 'HVAC', 'Roofer', 'General Contractor', 'Financial Services', 
    'Insurance Agent', 'Real Estate Agent', 'Marketing Agency', 'Software/SaaS', 
    'Personal Trainer', 'Photographer', 'Web Developer', 'IT Services', 'Lawyer', 'Accountant'
];

const IndustrySelector: React.FC<IndustrySelectorProps> = ({ onProductSelect }) => {
    const [selectedIndustry, setSelectedIndustry] = useState('');
    const [generatedProducts, setGeneratedProducts] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [customProduct, setCustomProduct] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            if (!selectedIndustry) {
                setGeneratedProducts([]);
                return;
            };
            setIsLoading(true);
            setGeneratedProducts([]);
            setError(null);
            try {
                const products = await getProductsForIndustry(selectedIndustry);
                setGeneratedProducts(products);
            } catch (error) {
                console.error("Error fetching products:", error);
                setError("Could not fetch suggestions due to an API error. This can happen if the API key is invalid or quota has been exceeded.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, [selectedIndustry]);
    
    const handleAddCustomProduct = () => {
        if (customProduct.trim()) {
            onProductSelect(customProduct.trim());
            setCustomProduct('');
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddCustomProduct();
        }
    }


    return (
        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray space-y-4">
            <div>
                <h3 className="text-lg font-bold mb-2 text-brand-light-text dark:text-white">Industry &amp; Products</h3>
                <select 
                    value={selectedIndustry} 
                    onChange={e => setSelectedIndustry(e.target.value)}
                    className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                    <option value="">-- Select an Industry --</option>
                    {predefinedIndustries.sort().map(industry => <option key={industry} value={industry}>{industry}</option>)}
                </select>
            </div>

            {isLoading && (
                 <div className="flex justify-center items-center h-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red"></div>
                </div>
            )}

            {error && !isLoading && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-center">
                    <p className="text-xs text-red-500">{error}</p>
                </div>
            )}

            {generatedProducts.length > 0 && !isLoading && (
                <div>
                    <h4 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Suggested Products</h4>
                     <ul className="space-y-2">
                        {generatedProducts.map(product => (
                            <li key={product} className="flex items-center justify-between p-2 bg-brand-light-bg dark:bg-brand-gray/20 rounded-md">
                                <span className="text-sm text-brand-light-text dark:text-gray-300">{product}</span>
                                <button 
                                    onClick={() => onProductSelect(product)}
                                    className="bg-brand-blue text-white text-xs font-semibold px-3 py-1 rounded-full hover:bg-blue-600 transition-colors"
                                >
                                    Select
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            <div className="border-t border-brand-light-border dark:border-brand-gray pt-4">
                <h4 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Add Custom Product</h4>
                <div className="flex gap-2">
                     <input 
                        type="text" 
                        placeholder="Custom Product Name" 
                        value={customProduct}
                        onChange={e => setCustomProduct(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full bg-transparent border-b border-dashed border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white text-sm p-1 focus:outline-none focus:border-brand-blue focus:border-solid"
                    />
                    <button 
                        onClick={handleAddCustomProduct}
                        className="bg-brand-lime text-brand-ink font-bold py-1 px-3 rounded-lg hover:bg-green-400 transition text-xs"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IndustrySelector;
