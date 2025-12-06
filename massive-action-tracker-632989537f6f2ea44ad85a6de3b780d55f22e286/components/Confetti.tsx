
import React from 'react';

const Confetti: React.FC = () => {
    // Increased number of pieces for a bigger celebration
    const confettiPieces = Array.from({ length: 150 }).map((_, index) => {
        const style = {
            left: `${Math.random() * 100}%`,
            // Stagger the start of the animation
            animationDelay: `${Math.random() * 0.5}s`,
            // Vary the duration for a more natural effect
            animationDuration: `${3 + Math.random() * 2}s`,
            // Add more vibrant colors
            backgroundColor: ['#E53E3E', '#34D399', '#2F81F7', '#FBBF24', '#A855F7', '#EC4899'][Math.floor(Math.random() * 6)],
            // Randomize width and height
            width: `${6 + Math.random() * 4}px`,
            height: `${12 + Math.random() * 8}px`,
        };
        return <div key={index} className="confetti-piece" style={style}></div>;
    });

    return <div className="confetti" aria-hidden="true">{confettiPieces}</div>;
};

export default Confetti;