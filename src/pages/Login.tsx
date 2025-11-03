import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Camera, Lock } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isFaceScanning, setIsFaceScanning] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsFaceScanning(true);
      // Simulate face scan
      setTimeout(() => {
        setIsFaceScanning(false);
        setShowOTP(true);
      }, 2000);
    }
  };

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/30">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Secure Access</h1>
          <p className="text-muted-foreground">Two-factor authentication required</p>
        </div>

        <Card className="border-border shadow-elevated">
          <CardHeader>
            <CardTitle>Company Login</CardTitle>
            <CardDescription>
              {!showOTP 
                ? "Enter your email to begin authentication" 
                : "Enter the code from your authenticator app"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showOTP ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                {isFaceScanning && (
                  <div className="bg-secondary rounded-lg p-6 text-center space-y-3">
                    <Camera className="h-12 w-12 mx-auto text-primary animate-pulse" />
                    <p className="text-sm text-muted-foreground">
                      Scanning face biometrics...
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12"
                  disabled={isFaceScanning}
                >
                  {isFaceScanning ? "Scanning..." : "Continue"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOTPSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Authentication Code
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    className="h-12 text-center text-2xl tracking-widest font-mono"
                  />
                </div>

                <Button type="submit" className="w-full h-12">
                  Verify & Login
                </Button>
              </form>
            )}

            <div className="text-center space-y-2 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/signup")}
                className="text-muted-foreground hover:text-foreground"
              >
                Don't have an account? Sign up
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Secured by biometric authentication and TOTP
        </p>
      </div>
    </div>
  );
};

export default Login;