import React, { useState, useMemo, useEffect } from 'react';
import ContentTemplatesCard from '../components/ContentTemplatesCard';
import { generateBusinessContent } from '../services/geminiService';

interface SavedContent {
    id: string;
    template: string;
    content: string;
    createdAt: string;
}

const templateFields: Record<string, { label: string; name: string; placeholder: string }[]> = {
    'Welcome Email': [
        { label: 'Client Name', name: 'clientName', placeholder: 'Jane Doe' },
        { label: 'Your Company Name', name: 'companyName', placeholder: 'Acme Inc.' },
        { label: 'Key Service/Product', name: 'service', placeholder: 'our premium marketing package' },
    ],
    'Business Proposal': [
        { label: 'Client Name', name: 'clientName', placeholder: 'John Smith' },
        { label: 'Project Name', name: 'projectName', placeholder: 'Website Redesign' },
        { label: 'Key Objective', name: 'objective', placeholder: 'Increase online leads by 30%' },
        { label: 'Total Price', name: 'price', placeholder: '$5,000' },
    ],
    'Service Contract': [
        { label: 'Client Name', name: 'clientName', placeholder: 'Innovate Corp' },
        { label: 'Service Provided', name: 'service', placeholder: 'Monthly social media management' },
        { label: 'Term Length', name: 'term', placeholder: '12 months' },
        { label: 'Monthly Fee', name: 'fee', placeholder: '$1,500' },
    ],
    'LinkedIn Post': [
        { label: 'Topic', name: 'topic', placeholder: 'The importance of follow-up in sales' },
        { label: 'Key Takeaway', name: 'takeaway', placeholder: 'Consistency is more important than perfection.' },
        { label: 'Call to Action', name: 'cta', placeholder: 'What\'s your best follow-up tip?' },
    ],
    'Anniversary/Birthday Message': [
        { label: 'Client Name', name: 'clientName', placeholder: 'Susan' },
        { label: 'Occasion', name: 'occasion', placeholder: 'Work Anniversary' },
        { label: 'Years', name: 'years', placeholder: '3' },
    ],
    'Sales Email Sequence (3 emails)': [
        { label: 'Prospect Name', name: 'prospectName', placeholder: 'David' },
        { label: 'Your Product/Service', name: 'product', placeholder: 'our automated CRM' },
        { label: 'Key Pain Point', name: 'painPoint', placeholder: 'spending too much time on data entry' },
    ],
    'Website Landing Page Copy': [
        { label: 'Product Name', name: 'productName', placeholder: 'ConnectSphere CRM' },
        { label: 'Target Audience', name: 'audience', placeholder: 'Small business owners' },
        { label: 'Main Benefit', name: 'benefit', placeholder: 'Saves 10+ hours per week' },
    ],
    'New Product Introduction': [
        { label: 'Product Name', name: 'productName', placeholder: 'InnovateX' },
        { label: 'Key Feature', name: 'feature', placeholder: 'AI-powered predictive analysis' },
        { label: 'Target Market', name: 'market', placeholder: 'Enterprise-level sales teams' },
    ],
};

// Templates that should show a free-form description box
const templatesRequiringDescription = [
    'Mastermind Group Invitation',
    'Company Newsletter',
    'Lesson Outline',
    'Checklist',
];

const getDescriptionHelperText = (template: string): string => {
    switch (template) {
        case 'Mastermind Group Invitation':
            return 'Describe who the mastermind is for, the main promise, how often you meet, what topics you cover, and the tone you want (casual, elite, faith-based, etc.).';
        case 'Company Newsletter':
            return 'Describe this issue\'s focus: your audience, main theme, key company updates or wins, and any important calls to action or offers you want included.';
        case 'Lesson Outline':
            return 'Describe the lesson topic, audience (e.g., sales team, congregation, youth), time length, key points or scriptures, and the main outcome you want for your listeners.';
        case 'Checklist':
            return 'Describe what the checklist should cover (e.g., sermon prep, public talk, sales presentation, home inspection, ministry event), the setting, and what "done" should look like.';
        default:
            return 'Add any details that will help the AI create exactly what you have in mind.';
    }
};

const AIContentPage: React.FC = () => {
    const [selectedTemplate, setSelectedTemplate] = useState('Welcome Email');
    const [formDetails, setFormDetails] = useState<Record<string, string>>({});
    const [description, setDescription] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedContent, setSavedContent] = useState<SavedContent[]>([]);
    const [selectedSavedContent, setSelectedSavedContent] = useState<SavedContent | null>(null);

    // Load saved content from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('aiContentSaved');
        if (saved) {
            try {
                setSavedContent(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse saved content:', e);
            }
        }
    }, []);

    const currentFields = useMemo(() => {
        // reset fields + description whenever template changes
        setFormDetails({});
        setDescription('');
        return templateFields[selectedTemplate] || [];
    }, [selectedTemplate]);

    const handleInputChange = (name: string, value: string) => {
        setFormDetails(prev => ({ ...prev, [name]: value }));
    };
    
    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setGeneratedContent('');
        try {
            const payload: Record<string, string> = {
                ...formDetails,
            };

            // include description for targeted templates
            if (templatesRequiringDescription.includes(selectedTemplate) && description.trim()) {
                payload.description = description.trim();
            }

            const content = await generateBusinessContent(selectedTemplate, payload);
            setGeneratedContent(content);
        } catch (err) {
            console.error(err);
            setError('Failed to generate content. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        navigator.clipboard.writeText(generatedContent).then(
            () => {
                alert('Content copied to clipboard!');
            },
            (err) => {
                console.error('Could not copy text: ', err);
                alert('Failed to copy content.');
            }
        );
    };

    const handleSave = () => {
        if (!generatedContent) {
            alert('No content to save!');
            return;
        }

        const newSaved: SavedContent = {
            id: Date.now().toString(),
            template: selectedTemplate,
            content: generatedContent,
            createdAt: new Date().toISOString(),
        };

        const updated = [newSaved, ...savedContent];
        setSavedContent(updated);
        localStorage.setItem('aiContentSaved', JSON.stringify(updated));
        alert('Content saved successfully!');
    };

    const handleLoadSaved = (saved: SavedContent) => {
        setSelectedSavedContent(saved);
        setGeneratedContent(saved.content);
    };

    const handleDeleteSaved = (id: string) => {
        if (!confirm('Are you sure you want to delete this saved content?')) return;
        
        const updated = savedContent.filter(item => item.id !== id);
        setSavedContent(updated);
        localStorage.setItem('aiContentSaved', JSON.stringify(updated));
        
        if (selectedSavedContent?.id === id) {
            setSelectedSavedContent(null);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
                <ContentTemplatesCard
                    selectedTemplate={selectedTemplate}
                    setSelectedTemplate={setSelectedTemplate}
                />

                <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
                    <h3 className="text-lg font-bold mb-2 text-brand-light-text dark:text-white">
                        Template Details
                    </h3>
                    <div className="space-y-4">
                        {currentFields.length > 0 ? (
                            currentFields.map(field => (
                                <div key={field.name}>
                                    <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">
                                        {field.label}
                                    </label>
                                    <input
                                        type="text"
                                        value={formDetails[field.name] || ''}
                                        onChange={e => handleInputChange(field.name, e.target.value)}
                                        placeholder={field.placeholder}
                                        className="w-full bg-transparent border-b-2 border-brand-light-border dark:border-brand-gray text-brand-light-text dark:text-white p-1 focus:outline-none focus:border-brand-blue"
                                    />
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-center text-gray-500 py-4">
                                This template has no structured fields. Use the description box below to guide the AI.
                            </p>
                        )}

                        {/* Description box for specific templates */}
                        {templatesRequiringDescription.includes(selectedTemplate) && (
                            <div>
                                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">
                                    Description of what to create
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    {getDescriptionHelperText(selectedTemplate)}
                                </p>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full bg-transparent border border-brand-light-border dark:border-brand-gray rounded-md text-brand-light-text dark:text-white text-sm p-2 focus:outline-none focus:border-brand-blue"
                                    placeholder="Type a clear description here (who it\'s for, context, key points, tone, etc.)..."
                                />
                            </div>
                        )}

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full bg-brand-red text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition disabled:bg-brand-gray"
                        >
                            {isLoading ? 'Generating...' : 'Generate Content'}
                        </button>
                        {error && (
                            <p className="text-sm text-red-500 text-center">
                                {error}
                            </p>
                        )}
                    </div>
                </div>

                {/* Saved Content List */}
                {savedContent.length > 0 && (
                    <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
                        <h3 className="text-lg font-bold mb-3 text-brand-light-text dark:text-white">
                            Saved Content ({savedContent.length})
                        </h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {savedContent.map(item => (
                                <div
                                    key={item.id}
                                    className={`p-3 rounded-lg border transition ${
                                        selectedSavedContent?.id === item.id
                                            ? 'bg-brand-blue/10 border-brand-blue'
                                            : 'bg-brand-light-bg dark:bg-brand-ink border-brand-light-border dark:border-brand-gray hover:border-brand-blue'
                                    }`}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-brand-light-text dark:text-white truncate">
                                                {item.template}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleLoadSaved(item)}
                                                className="px-2 py-1 text-xs bg-brand-blue text-white rounded hover:bg-blue-700 transition"
                                            >
                                                Load
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSaved(item.id)}
                                                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="lg:col-span-2">
                <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-brand-light-text dark:text-white">
                            Generated Content
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={!generatedContent || isLoading}
                                className="text-xs bg-green-600 text-white font-bold py-1 px-3 rounded-md hover:bg-green-700 transition disabled:bg-brand-gray"
                            >
                                Save Content
                            </button>
                            <button
                                onClick={handleCopy}
                                disabled={!generatedContent || isLoading}
                                className="text-xs bg-brand-blue text-white font-bold py-1 px-3 rounded-md hover:bg-blue-700 transition disabled:bg-brand-gray"
                            >
                                Copy Text
                            </button>
                        </div>
                    </div>
                    <div className="w-full bg-brand-light-bg dark:bg-brand-ink border border-brand-light-border dark:border-brand-gray rounded-md p-4 min-h-[60vh] max-h-[80vh] overflow-y-auto">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                            </div>
                        ) : (
                            <pre className="text-sm text-brand-light-text dark:text-gray-300 whitespace-pre-wrap font-sans">
                                {generatedContent || 'Your AI-generated content will appear here...'}
                            </pre>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIContentPage;
