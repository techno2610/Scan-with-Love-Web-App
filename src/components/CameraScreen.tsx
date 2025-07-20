import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Camera,
  RotateCcw,
  Play,
  Square,
  Scan,
  AlertCircle,
  CheckCircle2,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

interface CameraScreenProps {
  onDetection: (videoUrl: string) => void;
  onLogout: () => void;
}

export const CameraScreen = ({ onDetection, onLogout }: CameraScreenProps) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [currentCamera, setCurrentCamera] = useState<"user" | "environment">(
    "environment"
  );
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [targetTemplate, setTargetTemplate] = useState<cv.Mat | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
const videoPlayerRef = useRef<HTMLVideoElement>(null);


  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<HTMLCanvasElement>(null);
  const detectingRef = useRef(false);

useEffect(() => {
  if (cv && cv.Mat) {
    loadTargetTemplate();
  } else {
    console.warn("OpenCV.js is not loaded yet.");
  }
}, []);


  useEffect(() => {
    initializeCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [currentCamera]);

  const loadTargetTemplate = () => {
  const img = new Image();
  img.src = '/DetectionImage2.jpeg';

  img.onload = () => {
    try {
      const originalMat = cv.imread(img);
      cv.cvtColor(originalMat, originalMat, cv.COLOR_RGBA2GRAY);

      // Resize the template if too large
      const maxWidth = 320;
      const maxHeight = 240;
      const resizedMat = new cv.Mat();

      if (originalMat.cols > maxWidth || originalMat.rows > maxHeight) {
        const scale = Math.min(maxWidth / originalMat.cols, maxHeight / originalMat.rows);
        const newSize = new cv.Size(originalMat.cols * scale, originalMat.rows * scale);
        cv.resize(originalMat, resizedMat, newSize, 0, 0, cv.INTER_AREA);
        setTargetTemplate(resizedMat);
        originalMat.delete();
        console.log("✅ Target template resized and loaded.");
      } else {
        setTargetTemplate(originalMat);
        console.log("✅ Target template loaded.");
      }
    } catch (e) {
      console.error("Error processing template image", e);
    }
  };

  img.onerror = (e) => {
    console.error("Failed to load DetectionImage2.jpeg", e);
  };
};




  const loadTargetImage = () => {
    const imgElement = document.getElementById("target-image") as HTMLImageElement;

    if (!imgElement) {
      console.error("Target image element not found");
      return;
    }

    const mat = cv.imread(imgElement);
    cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY);

    setTargetTemplate(mat);
    console.log("✅ Target template loaded.");
  };

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentCamera,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      setHasPermission(true);

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      toast.success("Camera initialized", {
        description: "High-quality camera feed active",
      });
    } catch (error) {
      console.error("Camera error:", error);
      setHasPermission(false);
      toast.error("Camera access denied", {
        description: "Please allow camera permissions to continue",
      });
    }
  };

  const toggleCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    const newCamera = currentCamera === "user" ? "environment" : "user";
    setCurrentCamera(newCamera);

    toast.info(
      `Switching to ${newCamera === "user" ? "front" : "back"} camera...`
    );
  };

  const startDetection = () => {
    if (!targetTemplate || !videoRef.current) {
      toast.error("Template image not ready");
      return;
    }

    setIsDetecting(true);
    detectingRef.current = true;

    toast.info("Detection started", {
      description: "Point camera at target image...",
    });

    const detectFrame = () => {
      if (!detectingRef.current || !targetTemplate || !videoRef.current) return;

      try {
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        let src = cv.imread(canvas);
        cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);

        if (targetTemplate.cols > src.cols || targetTemplate.rows > src.rows) {
          console.warn("❗ Target template is larger than camera frame");
          src.delete();
          requestAnimationFrame(detectFrame);
          return;
        }

        let result = new cv.Mat();
        const resultCols = src.cols - targetTemplate.cols + 1;
        const resultRows = src.rows - targetTemplate.rows + 1;
        result.create(resultRows, resultCols, cv.CV_32FC1);

        cv.matchTemplate(src, targetTemplate, result, cv.TM_CCOEFF_NORMED);

        const minMax = cv.minMaxLoc(result);
        const maxVal = minMax.maxVal;

        console.log("Match confidence:", maxVal);

        if (maxVal >= 0.7 && !isPlayingVideo) {
  console.log("🎯 Target detected!");

  // Stop detection
  detectingRef.current = false;
  setIsDetecting(false);
  setIsPlayingVideo(true);

  // Play video
  setTimeout(() => {
    const videoPlayer = videoPlayerRef.current;
    if (videoPlayer) {
      videoPlayer.play();
    }
  }, 300); // Small delay to allow rendering
}


        src.delete();
        result.delete();
      } catch (err) {
        console.error("❌ Detection error:", err);
      }

      requestAnimationFrame(detectFrame);
    };

    requestAnimationFrame(detectFrame);
  };

  const handleVideoEnded = () => {
  setIsPlayingVideo(false);
  setShowOverlay(false);

  // Resume detection
  startDetection();
};

const handleCloseVideo = () => {
  if (videoPlayerRef.current) {
    videoPlayerRef.current.pause();
    videoPlayerRef.current.currentTime = 0;
  }
  setIsPlayingVideo(false); // Hide video and show camera
};



  const stopDetection = () => {
    setIsDetecting(false);
    detectingRef.current = false;
    setShowOverlay(false);
    toast.info("Detection stopped");
  };

  if (hasPermission === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Camera className="w-16 h-16 text-primary mx-auto animate-pulse" />
          <p className="text-lg">Initializing camera...</p>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center space-y-6 max-w-md mx-auto px-6">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold">Camera Access Required</h2>
          <p className="text-muted-foreground">
            This app needs camera access to detect target images and display AR
            content.
          </p>
          <Button onClick={initializeCamera} variant="glow" size="lg">
            Enable Camera
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background">
      <canvas ref={frameRef} style={{ display: "none" }} />

      <img
        id="target-image"
        src="/DetectionImage2.jpeg"
        alt="template"
        style={{ display: "none" }}
      />

      <div className="relative w-full h-full">
        {/* ✅ Camera Feed */}
  <video
    ref={videoRef}
    autoPlay
    playsInline
    muted
    className="absolute inset-0 w-full h-full object-cover z-0"
  />

  {/* 🟤 Black Background when Video is Playing */}
  {isPlayingVideo && (
    <div className="absolute inset-0 bg-black z-10" />
  )}

  {/* ❌ Close Button */}
{isPlayingVideo && (
  <button
    onClick={handleCloseVideo}
    className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 text-black shadow-md transition-all duration-200 ease-in-out"
    aria-label="Close Video"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
)}



        {isPlayingVideo && (
  <video
  ref={videoPlayerRef}
  src="/DetectionVideo.mp4"
  autoPlay
  controls={false}
  onEnded={handleVideoEnded}
  className="absolute z-20 max-w-full max-h-full"
  style={{
    top: "50%",
    left: "50%",
    position: "absolute",
    transform: "translate(-50%, -50%)",
  }}
/>

)}


        {showOverlay && (
          <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
            <div className="bg-white px-6 py-3 rounded shadow-lg text-success">
              Target detected!
            </div>
          </div>
        )}

        {isDetecting && (
          <div className="absolute inset-0 bg-black/20">
            <div className="absolute inset-4 border-2 border-primary rounded-lg flex items-center justify-center">
              <div className="w-64 h-64 border-4 border-success border-dashed rounded-lg animate-pulse">
                <div className="w-full h-full flex items-center justify-center">
                  <Scan className="w-12 h-12 text-success animate-spin" />
                </div>
              </div>
            </div>

            <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
              <div className="glass px-6 py-3 rounded-full">
                <div className="flex items-center space-x-2 text-success">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="font-medium">Scanning for target...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-6 left-6 right-6">
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={onLogout} className="glass">
              <LogOut className="w-4 h-4 mr-2" />
            </Button>

            <div className="glass px-4 py-2 rounded-full">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-success">
                  Camera Active
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              {devices.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleCamera}
                  className="md:hidden"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              )}

              <div className="flex-1 flex justify-center">
                {!isDetecting ? (
                  <Button
                    variant="glow"
                    size="xl"
                    onClick={startDetection}
                    className="px-12"
                  >
                    <Play className="w-6 h-6 mr-2" />
                    Start Detection
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    size="xl"
                    onClick={stopDetection}
                    className="px-12"
                  >
                    <Square className="w-6 h-6 mr-2" />
                    Stop Detection
                  </Button>
                )}
              </div>

              {devices.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleCamera}
                  className="md:hidden"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              )}
            </div>

            {devices.length > 1 && (
              <div className="hidden md:flex justify-center mt-4">
                <Button variant="outline" onClick={toggleCamera} className="px-6">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Switch to {currentCamera === "user" ? "Back" : "Front"} Camera
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
