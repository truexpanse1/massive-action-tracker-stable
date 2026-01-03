import React, { useState, useEffect } from 'react';
import ContentTemplatesCard from '../components/ContentTemplatesCard';
import { generateBusinessContent } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import { SavedAIContent } from '../types';

interface SavedContentDisplay extends SavedAIContent {
    isExpanded?: boolean;
}

const templateFields: Record<string, { label: string; name: string; placeholder: string }[]> = {
    'Prospect Research Assistant': [
        { label: 'Target Industry', name: 'industry', placeholder: 'Insurance agencies, Real estate brokers, etc.' },
        { label: 'Geographic Area', name: 'location', placeholder: 'Phoenix AZ, Dallas TX metro, etc.' },
        { label: 'Company Size (optional)', name: 'size', placeholder: '5-20 employees, $1M-$5M revenue, etc.' },
    ],
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

const templatesRequiringDescription = [
    'Prospect Research Assistant',
    'Mastermind Group Invitation',
    'Company Newsletter',
    'Lesson Outline',
    'Checklist',
];

const getDescriptionHelperText = (template: string): string => {
    switch (template) {
        case 'Prospect Research Assistant':
            return 'Describe any additional criteria (e.g., specific niches, company characteristics, decision-maker titles). The AI will generate search strategies for Google Maps, Chamber of Commerce sites, and other sources, plus output format instructions for your Lead Converter.';
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
    const [selectedTemplate, setSelectedTemplate] = useState('Prospect Research Assistant');
    const [formDetails, setFormDetails] = useState<Record<string, string>>({});
    const [description, setDescription] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Saved content state
    const [savedContent, setSavedContent] = useState<SavedContentDisplay[]>([]);
    const [showSavedContent, setShowSavedContent] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [datesWithContent, setDatesWithContent] = useState<Set<string>>(new Set());
    const [isLoadingSaved, setIsLoadingSaved] = useState(false);

    // Load saved content from Supabase
    useEffect(() => {
        loadSavedContent();
    }, []);

    const loadSavedContent = async () => {
        setIsLoadingSaved(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('saved_ai_content')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setSavedContent(data.map(item => ({ ...item, isExpanded: false })));
                
                // Build set of dates with content
                const dates = new Set(data.map(item => item.content_date));
                setDatesWithContent(dates);
            }
        } catch (err) {
            console.error('Error loading saved content:', err);
        } finally {
            setIsLoadingSaved(false);
        }
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const content = await generateBusinessContent(selectedTemplate, { ...formDetails, description });
            setGeneratedContent(content);
        } catch (err) {
            setError('Failed to generate content. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveContent = async () => {
        if (!generatedContent) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Please log in to save content');
                return;
            }

            const { data: userData } = await supabase
                .from('users')
                .select('company_id')
                .eq('id', user.id)
                .single();

            if (!userData?.company_id) {
                alert('Company ID not found');
                return;
            }

            const title = generatedContent.substring(0, 60) + (generatedContent.length > 60 ? '...' : '');
            
            const { error } = await supabase
                .from('saved_ai_content')
                .insert({
                    user_id: user.id,
                    company_id: userData.company_id,
                    content_date: new Date().toISOString().split('T')[0],
                    template_type: selectedTemplate,
                    title: title,
                    content_text: generatedContent,
                    tags: [selectedTemplate]
                });

            if (error) throw error;

            alert('Content saved successfully!');
            await loadSavedContent();
        } catch (err) {
            console.error('Error saving content:', err);
            alert('Failed to save content');
        }
    };

    const handleDeleteContent = async (id: string) => {
        if (!confirm('Delete this saved content?')) return;

        try {
            const { error } = await supabase
                .from('saved_ai_content')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await loadSavedContent();
        } catch (err) {
            console.error('Error deleting content:', err);
            alert('Failed to delete content');
        }
    };

    const toggleExpand = (id: string) => {
        setSavedContent(prev =>
            prev.map(item =>
                item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
            )
        );
    };

    const filteredContent = savedContent.filter(item => {
        const matchesSearch = searchQuery === '' || 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.template_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.content_text.toLowerCase().includes(searchQuery.toLowerCase());
        
        const selectedDateStr = selectedDate.toISOString().split('T')[0];
        const matchesDate = item.content_date === selectedDateStr;
        
        return matchesSearch && matchesDate;
    });

    // Calendar rendering
    const renderCalendar = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="h-8"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasContent = datesWithContent.has(dateStr);
            const isSelected = selectedDate.getDate() === day;

            days.push(
                <button
                    key={day}
                    onClick={() => setSelectedDate(new Date(year, month, day))}
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm relative
                        ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}
                        ${hasContent ? 'font-bold' : ''}`}
                >
                    {day}
                    {hasContent && (
                        <span className="absolute bottom-0 w-1 h-1 bg-blue-500 rounded-full"></span>
                    )}
                </button>
            );
        }

        return (
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() => setSelectedDate(new Date(year, month - 1, 1))}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        ←
                    </button>
                    <div className="font-semibold">
                        {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <button
                        onClick={() => setSelectedDate(new Date(year, month + 1, 1))}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        →
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                    <div>S</div>
                    <div>M</div>
                    <div>T</div>
                    <div>W</div>
                    <div>T</div>
                    <div>F</div>
                    <div>S</div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {days}
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex gap-6">
                {/* Left Sidebar */}
                <div className="w-64 flex-shrink-0 space-y-4">
                    <ContentTemplatesCard
                        selectedTemplate={selectedTemplate}
                        onSelectTemplate={setSelectedTemplate}
                    />
                    
                    <button
                        onClick={() => setShowSavedContent(!showSavedContent)}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                    >
                        {showSavedContent ? 'Generate New' : `Saved Content (${savedContent.length})`}
                    </button>

                    {showSavedContent && (
                        <>
                            {renderCalendar()}
                            
                            <div className="bg-white p-4 rounded-lg shadow">
                                <input
                                    type="text"
                                    placeholder="Search content..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    {!showSavedContent ? (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-2xl font-bold mb-4">CONTENT TEMPLATES</h2>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Select a Template</label>
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    {Object.keys(templateFields).map(template => (
                                        <option key={template} value={template}>{template}</option>
                                    ))}
                                    {templatesRequiringDescription.map(template => (
                                        <option key={template} value={template}>{template}</option>
                                    ))}
                                </select>
                            </div>

                            {templateFields[selectedTemplate] ? (
                                <div className="space-y-4">
                                    {templateFields[selectedTemplate].map(field => (
                                        <div key={field.name}>
                                            <label className="block text-sm font-medium mb-2">{field.label}</label>
                                            <input
                                                type="text"
                                                placeholder={field.placeholder}
                                                value={formDetails[field.name] || ''}
                                                onChange={(e) => setFormDetails({ ...formDetails, [field.name]: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Description of what to create</label>
                                    <p className="text-sm text-gray-600 mb-2">{getDescriptionHelperText(selectedTemplate)}</p>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32"
                                    />
                                </div>
                            )}

                            <button
                                onClick={handleGenerate}
                                disabled={isLoading}
                                className="w-full mt-4 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 disabled:bg-gray-400"
                            >
                                {isLoading ? 'Generating...' : 'Generate Content'}
                            </button>

                            {error && <div className="mt-4 text-red-500">{error}</div>}

                            {generatedContent && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold">Generated Content:</h3>
                                        <div className="space-x-2">
                                            <button
                                                onClick={() => navigator.clipboard.writeText(generatedContent)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                Copy
                                            </button>
                                            <button
                                                onClick={handleSaveContent}
                                                className="text-green-500 hover:text-green-700"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                    <div className="whitespace-pre-wrap">{generatedContent}</div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-2xl font-bold mb-4">
                                Saved Content for {selectedDate.toLocaleDateString()}
                            </h2>
                            
                            {isLoadingSaved ? (
                                <div>Loading...</div>
                            ) : filteredContent.length === 0 ? (
                                <div className="text-gray-500">No saved content for this date</div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredContent.map(item => (
                                        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <button
                                                        onClick={() => toggleExpand(item.id)}
                                                        className="flex items-center gap-2 text-left w-full"
                                                    >
                                                        <span>{item.isExpanded ? '▼' : '▶'}</span>
                                                        <div>
                                                            <div className="font-semibold">{item.title}</div>
                                                            <div className="text-sm text-gray-500">
                                                                {item.template_type} • {new Date(item.created_at).toLocaleTimeString()}
                                                            </div>
                                                        </div>
                                                    </button>
                                                    {item.isExpanded && (
                                                        <div className="mt-3 pl-6 max-h-64 overflow-y-auto whitespace-pre-wrap text-sm">
                                                            {item.content_text}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => navigator.clipboard.writeText(item.content_text)}
                                                        className="text-blue-500 hover:text-blue-700 text-sm"
                                                    >
                                                        Copy
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteContent(item.id)}
                                                        className="text-red-500 hover:text-red-700 text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIContentPage;
