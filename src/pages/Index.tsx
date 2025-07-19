import { useState } from "react";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { PinScreen } from "@/components/PinScreen";
import { CameraScreen } from "@/components/CameraScreen";
import { VideoOverlay } from "@/components/VideoOverlay";

type AppState = 'welcome' | 'pin' | 'camera' | 'video';

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>('welcome');
  const [currentVideo, setCurrentVideo] = useState<string>('');

  const handleWelcomeComplete = () => {
    setCurrentState('pin');
  };

  const handlePinSuccess = () => {
    setCurrentState('camera');
  };

  const handleDetection = (videoUrl: string) => {
    setCurrentVideo(videoUrl);
    setCurrentState('video');
  };

  const handleVideoComplete = () => {
    setCurrentState('camera');
    setCurrentVideo('');
  };

  const handleLogout = () => {
    setCurrentState('pin');
  };

  return (
    <div className="w-full h-screen overflow-hidden">
      {currentState === 'welcome' && (
        <WelcomeScreen onComplete={handleWelcomeComplete} />
      )}
      
      {currentState === 'pin' && (
        <PinScreen onSuccess={handlePinSuccess} />
      )}
      
      {currentState === 'camera' && (
        <CameraScreen onDetection={handleDetection} onLogout={handleLogout} />
      )}
      
      {currentState === 'video' && currentVideo && (
        <VideoOverlay videoUrl={currentVideo} onComplete={handleVideoComplete} />
      )}
    </div>
  );
};

export default Index;
