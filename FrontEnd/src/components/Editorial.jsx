import { useState, useRef, useEffect } from 'react';
import { 
  Pause, 
  Play, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  SkipBack,
  SkipForward,
  Settings
} from 'lucide-react';

const Editorial = ({ secureUrl, thumbnailUrl, duration }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [buffered, setBuffered] = useState(0);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const skipTime = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  // Update current time and buffered during playback
  useEffect(() => {
    const video = videoRef.current;
    
    const handleTimeUpdate = () => {
      if (video) setCurrentTime(video.currentTime);
    };

    const handleProgress = () => {
      if (video && video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('progress', handleProgress);
      video.addEventListener('ended', handleEnded);
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('progress', handleProgress);
        video.removeEventListener('ended', handleEnded);
      };
    }
  }, [duration]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch(e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipTime(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipTime(10);
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, currentTime]);

  const progress = (currentTime / duration) * 100 || 0;

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-slate-900 group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setShowVolumeSlider(false);
      }}
    >
      {/* Video Element */}
      <div className="relative bg-black">
        <video
          ref={videoRef}
          src={secureUrl}
          poster={thumbnailUrl}
          onClick={togglePlayPause}
          className="w-full aspect-video cursor-pointer"
        />
        
        {/* Center Play Button Overlay */}
        {!isPlaying && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer animate-fade-in"
            onClick={togglePlayPause}
          >
            <div className="p-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full shadow-2xl shadow-blue-500/50 hover:scale-110 transition-transform duration-300">
              <Play size={48} className="text-white" fill="white" />
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isPlaying && buffered < 100 && (
          <div className="absolute top-4 right-4">
            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      {/* Video Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 transition-all duration-300 ${
          isHovering || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          {/* Buffered Progress */}
          <div className="relative h-1.5 bg-white/20 rounded-full overflow-hidden group/progress hover:h-2 transition-all cursor-pointer">
            {/* Buffered bar */}
            <div 
              className="absolute h-full bg-white/30 rounded-full transition-all"
              style={{ width: `${buffered}%` }}
            />
            {/* Progress bar */}
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={(e) => {
                if (videoRef.current) {
                  videoRef.current.currentTime = Number(e.target.value);
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className="absolute h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"></div>
            </div>
          </div>
          
          {/* Time Display */}
          <div className="flex justify-between text-xs text-white/80 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePlayPause}
              className="p-2 hover:bg-white/20 rounded-lg transition-all group/btn"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause size={24} className="text-white group-hover/btn:scale-110 transition-transform" />
              ) : (
                <Play size={24} className="text-white group-hover/btn:scale-110 transition-transform" />
              )}
            </button>

            {/* Skip Back */}
            <button
              onClick={() => skipTime(-10)}
              className="p-2 hover:bg-white/20 rounded-lg transition-all hidden sm:block"
              aria-label="Skip back 10 seconds"
            >
              <SkipBack size={20} className="text-white" />
            </button>

            {/* Skip Forward */}
            <button
              onClick={() => skipTime(10)}
              className="p-2 hover:bg-white/20 rounded-lg transition-all hidden sm:block"
              aria-label="Skip forward 10 seconds"
            >
              <SkipForward size={20} className="text-white" />
            </button>

            {/* Volume Controls */}
            <div 
              className="relative flex items-center gap-2"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={20} className="text-white" />
                ) : (
                  <Volume2 size={20} className="text-white" />
                )}
              </button>

              {/* Volume Slider */}
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 transition-all ${
                showVolumeSlider ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
              }`}>
                <div className="bg-slate-800/95 backdrop-blur-sm rounded-lg p-3 shadow-xl">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="h-20 w-1 appearance-none bg-white/20 rounded-full cursor-pointer"
                    style={{
                      background: `linear-gradient(to top, #3b82f6 ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)`
                    }}
                    orient="vertical"
                  />
                </div>
              </div>

              {/* Volume Percentage */}
              <span className="text-white text-sm hidden md:block">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Settings (Placeholder) */}
            <button
              className="p-2 hover:bg-white/20 rounded-lg transition-all hidden sm:block"
              aria-label="Settings"
            >
              <Settings size={20} className="text-white" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-lg transition-all"
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize size={20} className="text-white" />
              ) : (
                <Maximize size={20} className="text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="text-xs text-white/50 mt-2 text-center hidden sm:block">
          Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Space</kbd> to play/pause • 
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded ml-1">←</kbd>
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded ml-1">→</kbd> to skip • 
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded ml-1">F</kbd> for fullscreen
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        /* Custom vertical range input for volume */
        input[type="range"][orient="vertical"] {
          writing-mode: bt-lr;
          -webkit-appearance: slider-vertical;
          width: 8px;
          height: 80px;
        }

        input[type="range"][orient="vertical"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        input[type="range"][orient="vertical"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export default Editorial;