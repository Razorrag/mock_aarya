'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function IntroVideo({ onVideoEnd }) {
  const videoRef = useRef(null);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [showEnterPrompt, setShowEnterPrompt] = useState(true);
  const [videoStarted, setVideoStarted] = useState(false);

  useEffect(() => {
    // Check if user has already seen the intro video in this session
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntroVideo');
    if (hasSeenIntro) {
      setIsVideoEnded(true);
      onVideoEnd?.();
      return;
    }
  }, [onVideoEnd]);

  // Show skip button after video starts playing
  useEffect(() => {
    if (videoStarted) {
      const skipTimer = setTimeout(() => {
        setShowSkip(true);
      }, 2000);
      return () => clearTimeout(skipTimer);
    }
  }, [videoStarted]);

  const handleVideoEnd = () => {
    setIsFadingOut(true);
    
    // Mark as seen in session storage
    sessionStorage.setItem('hasSeenIntroVideo', 'true');
    
    // Wait for fade out animation then complete
    setTimeout(() => {
      setIsVideoEnded(true);
      onVideoEnd?.();
    }, 500);
  };

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    handleVideoEnd();
  };

  const handleEnter = () => {
    setShowEnterPrompt(false);
    setVideoStarted(true);
    // Video will auto-play with audio since user has interacted
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1;
      videoRef.current.play().catch(err => {
        // If autoplay with audio fails, try muted
        console.log('Autoplay with audio failed, falling back to muted:', err);
        videoRef.current.muted = true;
        videoRef.current.play();
      });
    }
  };

  // If video ended or already seen, don't render
  if (isVideoEnded) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-black flex items-center justify-center transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Video Container */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          muted
          playsInline
          onEnded={handleVideoEnd}
          className="w-full h-full object-cover"
          src="/Create_a_video_202602141450_ub9p5.mp4"
        >
          Your browser does not support the video tag.
        </video>

        {/* Enter Prompt - Click to start video with audio */}
        {showEnterPrompt && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            {/* Brand Logo/Name */}
            <div className="mb-12 text-center">
              <h1 
                className="text-5xl md:text-7xl text-white font-light tracking-[0.3em] mb-4"
                style={{ fontFamily: 'var(--font-cinzel), serif' }}
              >
                AARYA
              </h1>
              <p 
                className="text-lg md:text-xl text-white/70 tracking-[0.2em] uppercase"
                style={{ fontFamily: 'var(--font-playfair), serif' }}
              >
                Clothing
              </p>
            </div>

            {/* Enter Button */}
            <button
              onClick={handleEnter}
              className="group flex flex-col items-center gap-4 cursor-pointer"
            >
              <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/30 transition-all duration-500 group-hover:bg-white/20 group-hover:scale-110 group-hover:border-white/50">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="white" 
                  viewBox="0 0 24 24" 
                  className="w-12 h-12 ml-1"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span 
                className="text-white text-lg tracking-[0.2em] uppercase transition-all duration-300 group-hover:text-white/90"
                style={{ fontFamily: 'var(--font-cinzel), serif' }}
              >
                Enter
              </span>
            </button>
          </div>
        )}

        {/* Skip Button - shown after video starts */}
        {showSkip && !showEnterPrompt && (
          <button
            onClick={handleSkip}
            className="absolute bottom-8 right-8 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-105"
            style={{
              fontFamily: 'var(--font-cinzel), serif',
            }}
          >
            Skip Intro
          </button>
        )}

        {/* Brand name - shown during video playback */}
        {!showEnterPrompt && (
          <div 
            className="absolute top-8 left-8 text-white/80 text-xl font-light tracking-widest"
            style={{ fontFamily: 'var(--font-cinzel), serif' }}
          >
            Aarya Clothing
          </div>
        )}
      </div>
    </div>
  );
}
