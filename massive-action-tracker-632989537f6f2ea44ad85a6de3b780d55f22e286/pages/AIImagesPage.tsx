

import React, { useState, useRef } from 'react';
import { generateImage, editImage, getEditSuggestion } from '../services/geminiService';
import PromptingTipsCard from '../components/PromptingTipsCard';

const AIImagesPage: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [imageToEdit, setImageToEdit] = useState<string | null>(null);
    const [editPrompt, setEditPrompt] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [editError, setEditError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleGenerate = async () => {
        if (!prompt) {
            setError('Please enter a prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        setEditedImage(null);
        try {
            const imageUrl = await generateImage(prompt, aspectRatio);
            setGeneratedImage(imageUrl);
            setImageToEdit(imageUrl);
        } catch (err) {
            console.error(err);
            setError('Failed to generate image. Please check the console for details.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!editPrompt || !imageToEdit) {
            setEditError('Please enter an edit prompt and ensure an image is loaded.');
            return;
        }
        setIsEditing(true);
        setEditError(null);
        setEditedImage(null);
        try {
            const base64Data = imageToEdit.split(',')[1];
            const mimeType = imageToEdit.match(/:(.*?);/)?.[1] || 'image/jpeg';
            
            const newImageUrl = await editImage(base64Data, mimeType, editPrompt);
            setEditedImage(newImageUrl);
        } catch (err) {
            console.error(err);
            setEditError('Failed to edit image. Please check the console for details.');
        } finally {
            setIsEditing(false);
        }
    };
    
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const dataUrl = e.target?.result as string;
                setImageToEdit(dataUrl);
                setGeneratedImage(null);
                setEditedImage(null);
                setEditPrompt(''); // Clear previous prompt while generating new one

                try {
                    const base64Data = dataUrl.split(',')[1];
                    const mimeType = dataUrl.match(/:(.*?);/)?.[1] || 'image/jpeg';
                    const suggestion = await getEditSuggestion(base64Data, mimeType);
                    setEditPrompt(suggestion);
                } catch (err) {
                    console.error("Could not get edit suggestion:", err);
                    setEditPrompt('Enhance the lighting and colors.'); // Fallback prompt
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
                <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray space-y-4">
                    <h2 className="text-xl font-bold text-brand-light-text dark:text-white">Image Generation</h2>
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Prompt</label>
                        <textarea id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white dark:text-white" placeholder="A photorealistic image of a futuristic sales robot closing a deal..."></textarea>
                    </div>
                    <div>
                        <label htmlFor="aspectRatio" className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Aspect Ratio</label>
                        <select id="aspectRatio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white">
                            <option value="1:1">Square (1:1)</option>
                            <option value="16:9">Widescreen (16:9)</option>
                            <option value="9:16">Portrait (9:16)</option>
                            <option value="4:3">Landscape (4:3)</option>
                            <option value="3:4">Tall (3:4)</option>
                        </select>
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-brand-red text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition disabled:bg-brand-gray">{isLoading ? 'Generating...' : 'Generate Image'}</button>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
                <PromptingTipsCard />
            </div>

            <div className="lg:col-span-2 space-y-8">
                <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray min-h-[400px] flex flex-col items-center justify-center">
                    <h2 className="text-xl font-bold text-brand-light-text dark:text-white mb-4">Your Generated Image</h2>
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
                    ) : generatedImage ? (
                        <img src={generatedImage} alt={prompt} className="max-w-full max-h-[400px] rounded-lg" />
                    ) : (
                        <p className="text-gray-500">Your generated image will appear here.</p>
                    )}
                </div>

                <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-brand-light-text dark:text-white">Edit an Image</h2>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className="text-xs bg-gray-200 dark:bg-brand-gray text-gray-700 dark:text-gray-300 font-bold py-1 px-3 rounded-md hover:bg-gray-300 dark:hover:bg-brand-gray/50 transition">
                            Upload Image
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div className="space-y-3">
                            <label htmlFor="edit-prompt" className="block text-sm font-bold text-gray-600 dark:text-gray-300">Edit Prompt</label>
                            <textarea id="edit-prompt" value={editPrompt} onChange={e => setEditPrompt(e.target.value)} rows={3} className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white dark:text-white" placeholder="e.g., make the robot wear a hat"></textarea>
                            <button onClick={handleEdit} disabled={isEditing || !imageToEdit} className="w-full bg-brand-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-brand-gray">{isEditing ? 'Editing...' : 'Apply Edit'}</button>
                            {editError && <p className="text-sm text-red-500">{editError}</p>}
                        </div>
                        <div className="flex flex-col items-center justify-center min-h-[150px] bg-brand-light-bg dark:bg-brand-ink rounded-lg p-2">
                             {imageToEdit && !editedImage && <img src={imageToEdit} alt="Image to edit" className="max-w-full max-h-[200px] rounded-lg mb-2" />}
                             {isEditing ? (
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                            ) : editedImage ? (
                                <img src={editedImage} alt={editPrompt} className="max-w-full max-h-[200px] rounded-lg" />
                            ) : !imageToEdit ? (
                                <p className="text-gray-500 text-center text-sm">Upload or generate an image to start editing.</p>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIImagesPage;