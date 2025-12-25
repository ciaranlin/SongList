import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff } from "lucide-react";

interface PasswordGateProps {
  onUnlock: () => void;
  correctPassword: string;
}

export function PasswordGate({ onUnlock, correctPassword }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === correctPassword) {
      onUnlock();
    } else {
      setError(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(169, 186, 196, 0.95)", backdropFilter: "blur(20px)" }}
    >
      <div 
        className={`vtuber-glass rounded-3xl p-8 w-full max-w-md mx-4 transition-transform ${
          isShaking ? "animate-shake" : ""
        }`}
        style={{
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
          animation: isShaking ? "shake 0.5s ease-in-out" : undefined,
        }}
      >
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
        `}</style>
        
        <div className="flex flex-col items-center mb-6">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: "rgba(255,255,255,0.3)" }}
          >
            <Lock className="w-8 h-8 text-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">管理员验证</h2>
          <p className="text-sm text-muted-foreground mt-1">请输入密码继续</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className={`h-12 rounded-xl pr-12 ${error ? "border-destructive" : ""}`}
              style={{ 
                background: "rgba(255,255,255,0.5)",
                borderColor: error ? "hsl(var(--destructive))" : undefined,
              }}
              autoFocus
              data-testid="input-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              data-testid="button-toggle-password"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center" data-testid="text-error">
              密码错误
            </p>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl"
            data-testid="button-unlock"
          >
            进入
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-4">
          默认密码: vtuber123
        </p>
      </div>
    </div>
  );
}
