import React, { useState, useRef } from 'react';
import { generateImage, editImage, getEditSuggestion } from '../services/geminiService';
import PromptingTipsCard from '../components/PromptingTipsCard';
import {
  socialMediaPresets,
  industryTemplates,
  marketingPieceTemplates,
  styleOptions,
  colorThemes,
} from '../lib/imageTemplates';

const AIImagesPageEnhanced: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Template system states
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedMarketingPiece, setSelectedMarketingPiece] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedColorTheme, setSelectedColorTheme] = useState<string>('');
  const [useTemplateMode, setUseTemplateMode] = useState(true);

  // Edit states
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTemplateSelect = (templatePrompt: string, templateAspectRatio: string) => {
    let enhancedPrompt = templatePrompt;

    // Add style modifier
    if (selectedStyle) {
      const style = styleOptions.find((s) => s.value === selectedStyle);
      if (style) {
        enhancedPrompt += `, ${style.value} style`;
      }
    }

    // Add color theme
    if (selectedColorTheme) {
      const theme = colorThemes.find((t) => t.value === selectedColorTheme);
      if (theme) {
        enhancedPrompt += `, ${theme.label.toLowerCase()} color palette`;
      }
    }

    setPrompt(enhancedPrompt);
    setAspectRatio(templateAspectRatio);
  };

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please enter a prompt or select a template.');
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
        setEditPrompt('');

        try {
          const base64Data = dataUrl.split(',')[1];
          const mimeType = dataUrl.match(/:(.*?);/)?.[1] || 'image/jpeg';
          const suggestion = await getEditSuggestion(base64Data, mimeType);
          setEditPrompt(suggestion);
        } catch (err) {
          console.error('Could not get edit suggestion:', err);
          setEditPrompt('Enhance the lighting and colors.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-light-text dark:text-white">
            🎨 Premium Marketing Asset Generator
          </h2>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Mode:</span>
            <button
              onClick={() => setUseTemplateMode(true)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                useTemplateMode
                  ? 'bg-brand-blue text-white'
                  : 'bg-gray-200 dark:bg-brand-gray text-gray-700 dark:text-gray-300'
              }`}
            >
              📋 Templates
            </button>
            <button
              onClick={() => setUseTemplateMode(false)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                !useTemplateMode
                  ? 'bg-brand-blue text-white'
                  : 'bg-gray-200 dark:bg-brand-gray text-gray-700 dark:text-gray-300'
              }`}
            >
              ✍️ Custom
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN - Controls */}
        <div className="lg:col-span-1 space-y-6">
          {useTemplateMode ? (
            /* TEMPLATE MODE */
            <div className="space-y-6">
              {/* Industry Templates */}
              <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
                <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-3">
                  🏢 Industry Templates
                </h3>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white mb-3"
                >
                  <option value="">Select Industry...</option>
                  {Object.keys(industryTemplates).map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>

                {selectedIndustry && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {industryTemplates[selectedIndustry as keyof typeof industryTemplates].map(
                      (template, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleTemplateSelect(template.prompt, template.aspectRatio)}
                          className="w-full text-left bg-brand-light-bg dark:bg-brand-gray/50 hover:bg-gray-200 dark:hover:bg-brand-gray p-3 rounded-md transition text-sm"
                        >
                          <div className="font-medium text-brand-light-text dark:text-white">
                            {template.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {template.aspectRatio} • {template.category}
                          </div>
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Marketing Pieces */}
              <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
                <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-3">
                  📢 Marketing Pieces
                </h3>
                <select
                  value={selectedMarketingPiece}
                  onChange={(e) => setSelectedMarketingPiece(e.target.value)}
                  className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white mb-3"
                >
                  <option value="">Select Marketing Piece...</option>
                  {Object.keys(marketingPieceTemplates).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                {selectedMarketingPiece && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {marketingPieceTemplates[
                      selectedMarketingPiece as keyof typeof marketingPieceTemplates
                    ].map((template, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTemplateSelect(template.prompt, template.aspectRatio)}
                        className="w-full text-left bg-brand-light-bg dark:bg-brand-gray/50 hover:bg-gray-200 dark:hover:bg-brand-gray p-3 rounded-md transition text-sm"
                      >
                        <div className="font-medium text-brand-light-text dark:text-white">
                          {template.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {template.aspectRatio} • {template.category}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Style & Color */}
              <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
                <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-3">
                  🎨 Style & Color
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">
                      Visual Style
                    </label>
                    <select
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value)}
                      className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white"
                    >
                      <option value="">Default</option>
                      {styleOptions.map((style) => (
                        <option key={style.value} value={style.value}>
                          {style.label} - {style.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">
                      Color Theme
                    </label>
                    <select
                      value={selectedColorTheme}
                      onChange={(e) => setSelectedColorTheme(e.target.value)}
                      className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white"
                    >
                      <option value="">Default</option>
                      {colorThemes.map((theme) => (
                        <option key={theme.value} value={theme.value}>
                          {theme.label} - {theme.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* CUSTOM MODE */
            <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray space-y-4">
              <h3 className="text-lg font-bold text-brand-light-text dark:text-white">
                Custom Image Generation
              </h3>
              <div>
                <label htmlFor="prompt" className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">
                  Prompt
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white"
                  placeholder="Describe the image you want to create..."
                ></textarea>
              </div>
            </div>
          )}

          {/* Output Size */}
          <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
            <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-3">
              📱 Output Size
            </h3>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white"
            >
              <optgroup label="Social Media Presets">
                {socialMediaPresets.map((preset) => (
                  <option key={preset.label} value={preset.value}>
                    {preset.label} - {preset.size}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Standard Sizes">
                <option value="1:1">Square (1:1)</option>
                <option value="16:9">Widescreen (16:9)</option>
                <option value="9:16">Portrait (9:16)</option>
                <option value="4:3">Landscape (4:3)</option>
                <option value="3:4">Tall (3:4)</option>
              </optgroup>
            </select>
          </div>

          {/* Current Prompt Preview */}
          {prompt && (
            <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
              <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                Current Prompt:
              </h3>
              <p className="text-xs text-brand-light-text dark:text-white break-words">{prompt}</p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt}
            className="w-full bg-brand-red text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition disabled:bg-brand-gray disabled:cursor-not-allowed"
          >
            {isLoading ? '🎨 Generating...' : '✨ Generate Image'}
          </button>
          {error && <p className="text-sm text-red-500">{error}</p>}

          <PromptingTipsCard />
        </div>

        {/* RIGHT COLUMN - Output & Edit */}
        <div className="lg:col-span-2 space-y-6">
          {/* Generated Image */}
          <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray min-h-[400px] flex flex-col items-center justify-center">
            <div className="flex justify-between items-center w-full mb-4">
              <h2 className="text-xl font-bold text-brand-light-text dark:text-white">
                Your Generated Image
              </h2>
              {generatedImage && (
                <button
                  onClick={() => handleDownload(generatedImage, 'marketing-asset.png')}
                  className="bg-brand-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  ⬇️ Download
                </button>
              )}
            </div>
            {isLoading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Creating your marketing asset...</p>
              </div>
            ) : generatedImage ? (
              <img
                src={generatedImage}
                alt={prompt}
                className="max-w-full max-h-[500px] rounded-lg shadow-lg"
              />
            ) : (
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Your generated image will appear here.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Select a template or enter a custom prompt to get started
                </p>
              </div>
            )}
          </div>

          {/* Image Editor */}
          <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-brand-light-text dark:text-white">
                Edit an Image
              </h2>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs bg-gray-200 dark:bg-brand-gray text-gray-700 dark:text-gray-300 font-bold py-1 px-3 rounded-md hover:bg-gray-300 dark:hover:bg-brand-gray/50 transition"
              >
                📤 Upload Image
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="space-y-3">
                <label
                  htmlFor="edit-prompt"
                  className="block text-sm font-bold text-gray-600 dark:text-gray-300"
                >
                  Edit Prompt
                </label>
                <textarea
                  id="edit-prompt"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  rows={3}
                  className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white"
                  placeholder="e.g., make the background more vibrant"
                ></textarea>
                <button
                  onClick={handleEdit}
                  disabled={isEditing || !imageToEdit}
                  className="w-full bg-brand-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-brand-gray"
                >
                  {isEditing ? 'Editing...' : '🎨 Apply Edit'}
                </button>
                {editError && <p className="text-sm text-red-500">{editError}</p>}
              </div>
              <div className="flex flex-col items-center justify-center min-h-[150px] bg-brand-light-bg dark:bg-brand-ink rounded-lg p-2">
                {imageToEdit && !editedImage && (
                  <img
                    src={imageToEdit}
                    alt="Image to edit"
                    className="max-w-full max-h-[200px] rounded-lg mb-2"
                  />
                )}
                {isEditing ? (
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                ) : editedImage ? (
                  <div className="space-y-2">
                    <img
                      src={editedImage}
                      alt={editPrompt}
                      className="max-w-full max-h-[200px] rounded-lg"
                    />
                    <button
                      onClick={() => handleDownload(editedImage, 'edited-asset.png')}
                      className="w-full bg-brand-lime text-brand-ink font-bold py-1 px-3 rounded-md hover:bg-green-400 transition text-xs"
                    >
                      ⬇️ Download Edited
                    </button>
                  </div>
                ) : !imageToEdit ? (
                  <p className="text-gray-500 text-center text-sm">
                    Upload or generate an image to start editing.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIImagesPageEnhanced;
