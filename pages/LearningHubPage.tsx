import React, { useState } from 'react';
import { Share2, ExternalLink } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  author: string;
  youtubeId: string;
  commentary: string;
  dateAdded: string;
}

const LearningHubPage: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const videos: Video[] = [
    {
      id: '1',
      title: 'The Art of Exceptional Living',
      author: 'Jim Rohn',
      youtubeId: 'L7BHMXcoibc',
      commentary: "Jim Rohn's philosophy on daily disciplines transformed how I approach business. This talk reminds us that massive success isn't built in a day—it's the compound effect of small, consistent actions. If you're serious about growth, this is required viewing.",
      dateAdded: 'December 17, 2025'
    },
    {
      id: '2',
      title: '10 Things You Must Work On Every Day',
      author: 'Jim Rohn',
      youtubeId: 'ZPou6asM4II',
      commentary: "True success isn't achieved through one massive leap but through consistent, small improvements. Jim breaks down the daily habits that separate high achievers from everyone else. This is the foundation of what MAT helps you track every single day.",
      dateAdded: 'December 17, 2025'
    },
    {
      id: '3',
      title: '20 Minutes of Life-Changing Advice',
      author: 'Tony Robbins',
      youtubeId: '8hUTeZpVdGw',
      commentary: "Tony delivers a powerful reminder that creating an extraordinary life starts with focus, discipline, and action. His energy is contagious, and his strategies are immediately actionable. Watch this when you need a mindset shift.",
      dateAdded: 'December 17, 2025'
    },
    {
      id: '4',
      title: 'The Only 13 Minutes You Need To Master Discipline',
      author: 'Jocko Willink',
      youtubeId: 'WlRmAC37vLQ',
      commentary: "Jocko's no-nonsense approach to discipline cuts through all the excuses. This 13-minute talk is brutal, direct, and exactly what you need to hear when motivation fades. Discipline equals freedom—and this video proves it.",
      dateAdded: 'December 17, 2025'
    },
    {
      id: '5',
      title: 'Think And Grow Rich - Full Audiobook',
      author: 'Napoleon Hill',
      youtubeId: 'ttehHU9NdaA',
      commentary: "Napoleon Hill's timeless masterpiece on the principles of success. The 13 steps to riches aren't just about money—they're about mastering your mindset and taking control of your destiny. A must-listen for any serious entrepreneur.",
      dateAdded: 'December 17, 2025'
    },
    {
      id: '6',
      title: 'Success Secrets Of High Achievers',
      author: 'Brian Tracy',
      youtubeId: 'XucPNce3t0Y',
      commentary: "Brian Tracy reveals the strategies that high achievers use to consistently outperform everyone else. His practical, step-by-step approach makes success feel achievable. This is the blueprint for turning goals into reality.",
      dateAdded: 'December 17, 2025'
    }
  ];

  const shareVideo = (video: Video) => {
    const url = `${window.location.origin}/learning#${video.id}`;
    const text = `Check out this powerful video: "${video.title}" by ${video.author} - curated by MAT Wisdom`;
    
    if (navigator.share) {
      navigator.share({
        title: `MAT Wisdom: ${video.title}`,
        text: text,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-red via-red-600 to-brand-red text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            🎯 MAT WISDOM
          </h1>
          <p className="text-2xl md:text-3xl font-bold mb-6">
            Curated Business Wisdom & Success Strategies
          </p>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg md:text-xl text-red-100 mb-4">
              "I'm constantly learning from the best minds in business. Here's what's transforming my approach to success right now."
            </p>
            <p className="text-lg font-semibold">
              — Don, Founder of TrueXpanse & Creator of the Massive Action Tracker
            </p>
          </div>
        </div>
      </div>

      {/* Introduction Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
            Why MAT Wisdom?
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            Success leaves clues. The greatest minds in business—Jim Rohn, Tony Robbins, Jocko Willink, Napoleon Hill, and Brian Tracy—have shared their wisdom freely. My job is to curate the best of the best and share what's actually working.
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            Each video below includes my personal take on why it matters and how it applies to real business growth. This isn't just a playlist—it's a curated learning library designed to help you take massive action.
          </p>
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-brand-red p-6 rounded-lg">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              💡 Want to apply these lessons? The <span className="text-brand-red">Massive Action Tracker</span> helps you turn wisdom into daily habits and track your progress toward your goals.
            </p>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {videos.map((video) => (
            <div
              key={video.id}
              id={video.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              {/* Video Embed */}
              <div className="relative pb-[56.25%] bg-black">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${video.youtubeId}`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Video Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                      {video.title}
                    </h3>
                    <p className="text-lg text-brand-red font-bold">
                      {video.author}
                    </p>
                  </div>
                  <button
                    onClick={() => shareVideo(video)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Share this video"
                  >
                    <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {/* Don's Commentary */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg mb-4">
                  <p className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2">
                    💭 Don's Take:
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {video.commentary}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Added: {video.dateAdded}</span>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-brand-red transition-colors"
                  >
                    Watch on YouTube
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-brand-blue via-blue-600 to-blue-800 rounded-2xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-black mb-4">
            Ready to Apply These Lessons?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Knowledge without action is just entertainment. The Massive Action Tracker helps you turn these powerful insights into daily habits and measurable results.
          </p>
          <a
            href="/"
            className="inline-block bg-brand-red hover:bg-red-700 text-white font-black text-xl px-12 py-5 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            Start Tracking Your Progress →
          </a>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            All videos are embedded from their original sources and remain the property of their respective creators.
          </p>
          <p>
            We do not host or claim ownership of any video content. Commentary and curation by Don @ TrueXpanse.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LearningHubPage;
