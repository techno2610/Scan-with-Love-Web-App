import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

interface WelcomeScreenProps {
  onComplete: () => void;
}

export const WelcomeScreen = ({ onComplete }: WelcomeScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade out animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-all duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background animate-pulse" />
      
      {/* Scanner line effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="scanner-line w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center space-y-6 animate-fade-in">
        <div className="flex items-center justify-center space-x-3">
          <span className="text-4xl md:text-6xl font-bold text-gradient">
            Built with Love
          </span>
          <Heart className="w-8 h-8 md:w-12 md:h-12 text-destructive animate-heartbeat" />
        </div>
        
        <div className="text-xl md:text-2xl text-muted-foreground font-medium">
          by <span className="text-primary font-bold">Gaurav Gidye</span>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center space-x-2 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};