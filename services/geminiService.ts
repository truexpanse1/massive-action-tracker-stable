import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Quote, Book } from '../types';

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!geminiApiKey) {
    console.warn(`
    ********************************************************************************
    ** WARNING: VITE_GEMINI_API_KEY environment variable is not set!                **
    ** AI features may not work. Please set the VITE_GEMINI_API_KEY environment variable. **
    ********************************************************************************
    `);
}

const ai = new GoogleGenAI({ apiKey: geminiApiKey });


const parseJsonResponse = <T>(text: string, fallback: T): T => {
    try {
        const jsonString = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        return JSON.parse(jsonString) as T;
    } catch (e) {
        console.error("Failed to parse JSON response:", text, e);
        return fallback;
    }
};

export const generateResponse = async (prompt: string, isThinkingMode: boolean): Promise<string> => {
    try {
        const model = isThinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
        const config = isThinkingMode ? { thinkingConfig: { thinkingBudget: 8192 } } : {};
        const response = await ai.models.generateContent({ model, contents: prompt, config });
        return response.text;
    } catch (error) {
        console.error('Error generating response:', error);
        throw error;
    }
};

export const getDailyQuote = async (): Promise<{ text: string; author: string }> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Provide a single, powerful motivational quote for a sales professional.',
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, author: { type: Type.STRING } }, required: ['text', 'author'] },
            },
        });
        return parseJsonResponse(response.text, { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' });
    } catch (error) {
        console.error('Error fetching daily quote:', error);
        return { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' };
    }
};

export const getSalesChallenges = async (): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Generate 3 short, actionable, and effective prospecting activities for a sales professional today. Examples: "Research 5 new leads in the tech industry" or "Send a personalized follow-up video to a key prospect."',
            config: {
                responseMimeType: 'application/json',
                responseSchema: { type: Type.OBJECT, properties: { challenges: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['challenges'] },
            },
        });
        const parsed = parseJsonResponse<{ challenges: string[] }>(response.text, { challenges: [] });
        return parsed.challenges.slice(0, 3);
    } catch (error) {
        console.error('Error fetching sales challenges:', error);
        throw error;
    }
};

export const getProductsForIndustry = async (industry: string): Promise<string[]> => {
    if (!industry) return [];
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `List 5 to 7 common products or services a ${industry} would sell.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: { type: Type.OBJECT, properties: { products: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['products'] },
            },
        });
        const parsed = parseJsonResponse<{ products: string[] }>(response.text, { products: [] });
        return parsed.products;
    } catch (error) {
        console.error(`Error fetching products for ${industry}:`, error);
        throw error;
    }
};

/**
 * CORRECTED: Uses 'imagen-3.0-generate-002' and maps aspect ratio to pixel size.
 */
export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    // Map the frontend aspect ratio string to the required Imagen API format
    const dimensionsMap: Record<string, string> = {
        '1:1': '1024x1024',
        '16:9': '1792x1024',
        '9:16': '1024x1792',
        '4:3': '1344x1024',
        '3:4': '1024x1344',
    };
    
    const size = dimensionsMap[aspectRatio] || '1024x1024';
    
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-001', 
            prompt,
            config: { 
                numberOfImages: 1, 
                outputMimeType: 'image/jpeg', 
                aspectRatio: size, 
                style: "PHOTOREALISM"
            },
        });
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
};

/**
 * CORRECTED: Uses 'imagen-3.0-generate-002' endpoint and passes image data as sourceImage for editing.
 */
export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        // Extract the base64 data only from the full Data URL
        const base64DataOnly = base64ImageData.split(',')[1];

        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-001', 
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                sourceImage: {
                    imageBytes: base64DataOnly,
                    mimeType: mimeType,
                },
            },
        });

        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error('Error editing image:', error);
        throw error;
    }
};

/**
 * RETAINED: Uses gemini-2.5-flash for the vision-to-text task (suggestion).
 */
export const getEditSuggestion = async (base64ImageData: string, mimeType: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { 
                parts: [
                    { inlineData: { data: base64ImageData, mimeType } }, 
                    { text: 'Suggest a short, creative edit for this image. The suggestion should be a command, like "Make the sky a vibrant sunset" or "Add a small, red boat on the water". Provide only the command text, nothing else.' }
                ] 
            },
        });
        return response.text.trim();
    } catch (error) {
        console.error('Error getting edit suggestion:', error);
        return 'Enhance the lighting and colors.'; 
    }
};

export const generateBusinessContent = async (template: string, details: Record<string, string>): Promise<string> => {
    try {
        const prompt = `Generate a "${template}" based on these details: ${JSON.stringify(details, null, 2)}. The tone should be professional, clear, and persuasive. Format as clean text.`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
        return response.text;
    } catch (error) {
        console.error('Error generating business content:', error);
        throw error;
    }
};

export const getQuotesForPerson = async (person: string): Promise<Omit<Quote, 'id'>[]> => {
    if (!person) return [];
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Provide 5 famous quotes by ${person}.`,
            config: {
                responseMimeType: 'application/json',
                // --- THIS IS THE CORRECTED SCHEMA ---
                responseSchema: { 
                    type: Type.OBJECT, 
                    properties: { 
                        quotes: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    text: { type: Type.STRING }, 
                                    author: { type: Type.STRING } 
                                }, 
                                required: ['text', 'author'] 
                            } 
                        } 
                    }, 
                    required: ['quotes'] 
                },
                // ------------------------------------
            },
        });
        const parsed = parseJsonResponse<{ quotes: Omit<Quote, 'id'>[] }>(response.text, { quotes: [] });
        return parsed.quotes;
    } catch (error) {
        console.error(`Error fetching quotes for ${person}:`, error);
        throw error;
    }
};

export const getRecommendedBooks = async (): Promise<Book[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'List the top 5 most impactful books for sales professionals. Include title, author, a one-sentence description, and placeholder links for Amazon and iBooks.',
            config: {
                responseMimeType: 'application/json',
                responseSchema: { type: Type.OBJECT, properties: { books: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, author: { type: Type.STRING }, description: { type: Type.STRING }, amazonLink: { type: Type.STRING }, ibooksLink: { type: Type.STRING } }, required: ['title', 'author', 'description', 'amazonLink', 'ibooksLink'] } } }, required: ['books'] }
            }, // <-- The extra '}' has been removed here.
        });
        const parsed = parseJsonResponse<{ books: Book[] }>(response.text, { books: [] });
        return parsed.books;
    } catch (error) {
        console.error('Error fetching recommended books:', error);
        throw error;
    }
};

export const getBookReview = async (title: string, author: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Provide a concise, 2-3 sentence summary of the book "${title}" by ${author}, focusing on its key takeaway for a sales professional.`,
        });
        return response.text;
    } catch (error) {
        console.error('Error fetching book review:', error);
        throw error;
    }
};

export const searchBooksByAuthor = async (author: string): Promise<Book[]> => {
    if (!author) return [];
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `List up to 3 major books by ${author}. Include title, author, a one-sentence description, and placeholder links for Amazon and iBooks.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: { type: Type.OBJECT, properties: { books: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, author: { type: Type.STRING }, description: { type: Type.STRING }, amazonLink: { type: Type.STRING }, ibooksLink: { type: Type.STRING } }, required: ['title', 'author', 'description', 'amazonLink', 'ibooksLink'] } } }, required: ['books'] }
            }, // <-- The extra '}' has been removed here.
        });
        const parsed = parseJsonResponse<{ books: Book[] }>(response.text, { books: [] });
        return parsed.books;
    } catch (error) {
        console.error(`Error searching books for ${author}:`, error);
        throw error;
    }
};

export const getPerformanceEvaluation = async (metrics: { revenue: number; calls: number; appts: number; deals: number; timeframeDays: number; }): Promise<{ score: number; suggestions: string; }> => {
    const prompt = `Analyze sales metrics for ${metrics.timeframeDays} days: Revenue: ${metrics.revenue}, Calls: ${metrics.calls}, Appts: ${metrics.appts}, Deals: ${metrics.deals}. Provide an "Activity Score" (1-100) and 2-3 concise improvement suggestions.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, suggestions: { type: Type.STRING } }, required: ['score', 'suggestions'] },
            },
        });
        return parseJsonResponse(response.text, { score: 0, suggestions: 'Could not generate evaluation.' });
    } catch (error) {
        console.error('Error fetching performance evaluation:', error);
        throw error;
    }
};

export const getRevenueAnalysis = async (productData: { product: string; revenue: number; count: number }[], timeframe: string): Promise<{ questions: string[]; strategies: string[]; reading: { title: string; author: string, description: string }, quote: { text: string, author: string } }> => {
    const prompt = `Analyze product sales data for ${timeframe}: ${JSON.stringify(productData)}. Provide JSON with: 1. "questions" (2-3 insightful questions). 2. "strategies" (2 actionable marketing strategies). 3. "reading" (1 relevant book recommendation). 4. "quote" (1 relevant motivational quote).`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { questions: { type: Type.ARRAY, items: { type: Type.STRING } }, strategies: { type: Type.ARRAY, items: { type: Type.STRING } }, reading: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, author: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['title', 'author', 'description'] }, quote: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, author: { type: Type.STRING } }, required: ['text', 'author'] } }, required: ['questions', 'strategies', 'reading', 'quote'] }
            }
        });
        return parseJsonResponse(response.text, { questions: [], strategies: [], reading: {title: '', author: '', description: ''}, quote: {text: '', author: ''}});
    } catch (error) {
        console.error('Error fetching revenue analysis:', error);
        throw error;
    }
};
