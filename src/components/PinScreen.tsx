import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface PinScreenProps {
  onSuccess: () => void;
}

const CORRECT_PIN = "2126";

export const PinScreen = ({ onSuccess }: PinScreenProps) => {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin === CORRECT_PIN) {
      toast.success("Access granted! Welcome to AR Camera", {
        description: "Starting camera system...",
      });
      setTimeout(onSuccess, 1000);
    } else {
      setIsShaking(true);
      setPin("");
      toast.error("Access denied", {
        description: "Incorrect security PIN. Please try again.",
      });
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 gap-4 h-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="border border-primary/20" />
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
            <Shield className="w-10 h-10 text-primary animate-pulse-glow" />
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Security Access</h1>
          <p className="text-muted-foreground">Enter your PIN to continue</p>
        </div>

        {/* PIN Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={`relative ${isShaking ? 'animate-bounce' : ''}`}>
            <Input
              type={showPin ? "text" : "password"}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter security PIN"
              className="h-14 text-lg text-center tracking-widest bg-card/50 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
              maxLength={6}
              autoFocus
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              onClick={() => setShowPin(!showPin)}
            >
              {showPin ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </Button>
          </div>

          <Button
            type="submit"
            variant="glow"
            size="lg"
            className="w-full h-14 text-lg"
            disabled={pin.length === 0}
          >
            Access System
          </Button>
        </form>
      </div>
    </div>
  );
};