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
import { supabase } from '../src/services/supabaseClient';
import { createGHLService } from '../src/services/ghlService';

interface AIImagesPageEnhancedProps {
  companyId: string;
  userId: string;
}

const AIImagesPageEnhanced: React.FC<AIImagesPageEnhancedProps> = ({ companyId, userId }) => {
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
  const [customDescription, setCustomDescription] = useState<string>('');

  // Edit states
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GHL Media save states
  const [isSavingToGHL, setIsSavingToGHL] = useState(false);
  const [ghlSaveSuccess, setGhlSaveSuccess] = useState<string | null>(null);
  const [ghlSaveError, setGhlSaveError] = useState<string | null>(null);

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
    link.click();
  };

  const handleSaveToGHL = async (imageUrl: string, filename: string) => {
    setIsSavingToGHL(true);
    setGhlSaveSuccess(null);
    setGhlSaveError(null);

    try {
      // Get GHL integration
      const { data: integration, error: integrationError } = await supabase
        .from('ghl_integrations')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .single();

      if (integrationError || !integration) {
        throw new Error('GHL integration not found or inactive. Please configure in Settings.');
      }

      // Create GHL service
      const ghlService = createGHLService(integration.ghl_api_key, integration.ghl_location_id);

      // Upload image to GHL Media
      const result = await ghlService.uploadMediaFromUrl(imageUrl, filename, 'mat-ai-images');

      setGhlSaveSuccess(`Saved to GHL Media! File ID: ${result.fileId}`);
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => setGhlSaveSuccess(null), 5000);
    } catch (error: any) {
      console.error('Error saving to GHL:', error);
      setGhlSaveError(error.message || 'Failed to save to GHL Media');
    } finally {
      setIsSavingToGHL(false);
    }
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

              {/* Custom Description */}
              <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
                <h3 className="text-lg font-bold text-brand-light-text dark:text-white mb-3">
                  ✏️ Custom Description
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Don't see your industry or want something specific? Describe what you need!
                </p>
                <textarea
                  value={customDescription}
                  onChange={(e) => {
                    setCustomDescription(e.target.value);
                    setPrompt(e.target.value);
                  }}
                  rows={4}
                  className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white"
                  placeholder="Example: Luxury yacht broker showcasing premium boats at sunset marina, professional and elegant..."
                ></textarea>
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
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(generatedImage, 'marketing-asset.png')}
                    className="bg-brand-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    ⬇️ Download
                  </button>
                  <button
                    onClick={() => handleSaveToGHL(generatedImage, `mat-image-${Date.now()}.png`)}
                    disabled={isSavingToGHL}
                    className="bg-brand-lime text-brand-ink font-bold py-2 px-4 rounded-lg hover:bg-green-400 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingToGHL ? '⏳ Saving...' : '📤 Save to GHL'}
                  </button>
                </div>
              )}
            </div>
            {ghlSaveSuccess && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-500 rounded-lg text-green-700 dark:text-green-300 text-sm">
                ✅ {ghlSaveSuccess}
              </div>
            )}
            {ghlSaveError && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-500 rounded-lg text-red-700 dark:text-red-300 text-sm">
                ❌ {ghlSaveError}
              </div>
            )}
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(editedImage, 'edited-asset.png')}
                        className="flex-1 bg-brand-blue text-white font-bold py-1 px-3 rounded-md hover:bg-blue-700 transition text-xs"
                      >
                        ⬇️ Download
                      </button>
                      <button
                        onClick={() => handleSaveToGHL(editedImage, `mat-edited-${Date.now()}.png`)}
                        disabled={isSavingToGHL}
                        className="flex-1 bg-brand-lime text-brand-ink font-bold py-1 px-3 rounded-md hover:bg-green-400 transition text-xs disabled:opacity-50"
                      >
                        {isSavingToGHL ? '⏳' : '📤 GHL'}
                      </button>
                    </div>
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
