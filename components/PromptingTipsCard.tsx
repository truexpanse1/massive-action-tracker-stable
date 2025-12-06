import React from 'react';

const PromptingTipsCard: React.FC = () => {
    const tips = [
        { title: "Be Specific", description: "Instead of 'a dog', try 'a golden retriever puppy playing in a field of daisies at sunset'." },
        { title: "Use Adjectives", description: "Words like 'vibrant', 'surreal', 'photorealistic', 'minimalist' can dramatically change the style." },
        { title: "Mention Artists or Styles", description: "Try adding 'in the style of Van Gogh' or 'as a watercolor painting'." },
        { title: "Set the Scene", description: "Describe the environment, lighting, and camera angle (e.g., 'cinematic lighting', 'wide-angle shot')." },
    ];

    return (
        <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
            <h3 className="text-lg font-bold mb-4 bg-brand-gray/80 text-white p-2 rounded text-center">PROMPT ENGINEERING 101</h3>
            <ul className="space-y-3">
                {tips.map((tip, index) => (
                    <li key={index} className="flex items-start space-x-3">
                        <span className="text-brand-red font-bold text-lg mt-[-2px]">•</span>
                        <div>
                            <p className="font-semibold text-sm text-brand-light-text dark:text-white">{tip.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{tip.description}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PromptingTipsCard;