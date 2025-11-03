import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Camera, QrCode, CheckCircle2 } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleStep2 = () => {
    // Simulate face capture
    setTimeout(() => setStep(3), 1500);
  };

  const handleStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      setStep(4);
      setTimeout(() => navigate("/login"), 2000);
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
          <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground">Set up your secure authentication</p>
        </div>

        <Card className="border-border shadow-elevated">
          <CardHeader>
            <CardTitle>
              {step === 1 && "Account Information"}
              {step === 2 && "Face Enrollment"}
              {step === 3 && "Authenticator Setup"}
              {step === 4 && "Setup Complete"}
            </CardTitle>
            <CardDescription>
              Step {step} of 4
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <form onSubmit={handleStep1} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
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
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="w-full h-11">
                  Continue
                </Button>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-secondary rounded-lg p-8 text-center space-y-4">
                  <Camera className="h-16 w-16 mx-auto text-primary animate-pulse" />
                  <div>
                    <p className="font-medium text-foreground">Position your face</p>
                    <p className="text-sm text-muted-foreground">
                      Look directly at the camera
                    </p>
                  </div>
                </div>
                <Button onClick={handleStep2} className="w-full h-11">
                  Capture Face
                </Button>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleStep3} className="space-y-4">
                <div className="bg-secondary rounded-lg p-6 text-center space-y-4">
                  <QrCode className="h-24 w-24 mx-auto text-foreground" />
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">Scan with Microsoft Authenticator</p>
                    <p className="text-sm text-muted-foreground">
                      Open your authenticator app and scan this QR code
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-medium">
                    Enter verification code
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    className="h-11 text-center text-xl tracking-widest font-mono"
                  />
                </div>
                <Button type="submit" className="w-full h-11">
                  Complete Setup
                </Button>
              </form>
            )}

            {step === 4 && (
              <div className="text-center space-y-4 py-6">
                <CheckCircle2 className="h-16 w-16 mx-auto text-success" />
                <div>
                  <p className="text-lg font-semibold text-foreground">All set!</p>
                  <p className="text-sm text-muted-foreground">
                    Redirecting to login...
                  </p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="text-center pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Already have an account? Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;