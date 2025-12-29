import React, { useState, useMemo, useEffect } from 'react';
import ContentTemplatesCard from '../components/ContentTemplatesCard';
import { generateBusinessContent } from '../services/geminiService';

interface SavedContent {
    id: string;
    template: string;
    content: string;
    title: string;
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
    const [showSavedContent, setShowSavedContent] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');

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

        // Extract first line as title (up to 60 chars)
        const firstLine = generatedContent.split('\n')[0].substring(0, 60);
        const title = firstLine || selectedTemplate;

        const newSaved: SavedContent = {
            id: Date.now().toString(),
            template: selectedTemplate,
            content: generatedContent,
            title: title,
            createdAt: new Date().toISOString(),
        };

        const updated = [newSaved, ...savedContent];
        setSavedContent(updated);
        localStorage.setItem('aiContentSaved', JSON.stringify(updated));
        alert('Content saved successfully!');
    };

    const handleLoadSaved = (saved: SavedContent) => {
        setGeneratedContent(saved.content);
        setShowSavedContent(false);
    };

    const handleDeleteSaved = (id: string) => {
        if (!confirm('Are you sure you want to delete this saved content?')) return;
        
        const updated = savedContent.filter(item => item.id !== id);
        setSavedContent(updated);
        localStorage.setItem('aiContentSaved', JSON.stringify(updated));
    };

    const toggleExpanded = (id: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedItems(newExpanded);
    };

    // Filter saved content by search query
    const filteredContent = useMemo(() => {
        if (!searchQuery.trim()) return savedContent;
        const query = searchQuery.toLowerCase();
        return savedContent.filter(item => 
            item.title.toLowerCase().includes(query) ||
            item.template.toLowerCase().includes(query) ||
            item.content.toLowerCase().includes(query)
        );
    }, [savedContent, searchQuery]);

    // Group by date
    const groupedContent = useMemo(() => {
        const groups: Record<string, SavedContent[]> = {};
        filteredContent.forEach(item => {
            const date = new Date(item.createdAt).toLocaleDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(item);
        });
        return groups;
    }, [filteredContent]);

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

                {/* View Saved Content Button */}
                <button
                    onClick={() => setShowSavedContent(!showSavedContent)}
                    className="w-full bg-brand-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                    <span>📁</span>
                    <span>{showSavedContent ? 'Hide' : 'View'} Saved Content ({savedContent.length})</span>
                </button>
            </div>

            <div className="lg:col-span-2">
                {showSavedContent ? (
                    /* Saved Content View */
                    <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-brand-light-text dark:text-white">
                                Saved Content Library
                            </h2>
                            <button
                                onClick={() => setShowSavedContent(false)}
                                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                ✕ Close
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-4">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search saved content..."
                                className="w-full bg-brand-light-bg dark:bg-brand-ink border border-brand-light-border dark:border-brand-gray rounded-md text-brand-light-text dark:text-white text-sm p-3 focus:outline-none focus:border-brand-blue"
                            />
                        </div>

                        {/* Saved Content List */}
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                            {Object.keys(groupedContent).length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    No saved content found.
                                </p>
                            ) : (
                                Object.entries(groupedContent).map(([date, items]) => (
                                    <div key={date} className="space-y-2">
                                        <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 sticky top-0 bg-brand-light-card dark:bg-brand-navy py-2">
                                            📅 {date}
                                        </h3>
                                        {items.map(item => {
                                            const isExpanded = expandedItems.has(item.id);
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="bg-brand-light-bg dark:bg-brand-ink border border-brand-light-border dark:border-brand-gray rounded-lg overflow-hidden"
                                                >
                                                    {/* Header - Always Visible */}
                                                    <div className="p-3 flex items-center justify-between gap-2">
                                                        <button
                                                            onClick={() => toggleExpanded(item.id)}
                                                            className="flex-1 text-left flex items-center gap-2 hover:text-brand-blue transition"
                                                        >
                                                            <span className="text-lg">{isExpanded ? '▼' : '▶'}</span>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-brand-light-text dark:text-white truncate">
                                                                    {item.title}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {item.template} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </button>
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => handleLoadSaved(item)}
                                                                className="px-3 py-1 text-xs bg-brand-blue text-white rounded hover:bg-blue-700 transition"
                                                            >
                                                                Load
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteSaved(item.id)}
                                                                className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Expanded Content - Scrollable */}
                                                    {isExpanded && (
                                                        <div className="border-t border-brand-light-border dark:border-brand-gray p-3 bg-white dark:bg-gray-900">
                                                            <div className="max-h-64 overflow-y-auto">
                                                                <pre className="text-xs text-brand-light-text dark:text-gray-300 whitespace-pre-wrap font-sans">
                                                                    {item.content}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    /* Generated Content View */
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
                                    💾 Save
                                </button>
                                <button
                                    onClick={handleCopy}
                                    disabled={!generatedContent || isLoading}
                                    className="text-xs bg-brand-blue text-white font-bold py-1 px-3 rounded-md hover:bg-blue-700 transition disabled:bg-brand-gray"
                                >
                                    📋 Copy
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
                )}
            </div>
        </div>
    );
};

export default AIContentPage;
