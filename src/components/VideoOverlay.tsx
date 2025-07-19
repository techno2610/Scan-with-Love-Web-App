import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";

interface VideoOverlayProps {
  videoUrl: string;
  onComplete: () => void;
}

export const VideoOverlay = ({ videoUrl, onComplete }: VideoOverlayProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsLoading(false);
      toast.success("Video loaded", {
        description: "Playing AR overlay content",
      });
    };

    const handleEnded = () => {
      toast.info("Video finished", {
        description: "Returning to camera view...",
      });
      setTimeout(onComplete, 1000);
    };

    const handleError = () => {
      toast.error("Video error", {
        description: "Failed to load video content",
      });
      onComplete();
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [onComplete]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleClose = () => {
    toast.info("Video stopped", {
      description: "Returning to camera view...",
    });
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-white text-lg">Loading AR Content...</p>
          </div>
        </div>
      )}

      {/* Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay
        playsInline
        className="w-full h-full object-contain"
        muted={isMuted}
      />

      {/* Controls overlay */}
      <div className="absolute top-0 left-0 right-0 p-6">
        <div className="flex justify-between items-start">
          {/* Close button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleClose}
            className="bg-black/50 border-white/20 text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Mute toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMute}
            className="bg-black/50 border-white/20 text-white hover:bg-white/20"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Status indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
          <div className="flex items-center space-x-2 text-white">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
            <span className="text-sm font-medium">AR Overlay Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};