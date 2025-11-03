import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Camera, QrCode, CheckCircle2 } from "lucide-react";
import { signUp, generateTOTPSecret } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [faceData, setFaceData] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create user account
    const { data, error } = await signUp({ email, password, fullName: name });
    
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
      return;
    }

    if (data?.user) {
      // Create profile
      await supabase.from('profiles').insert({
        user_id: data.user.id,
        email,
        full_name: name
      });
      
      setStep(2);
    }
  };

  const startFaceCapture = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please allow camera permissions.",
        variant: "destructive"
      });
      setIsCapturing(false);
    }
  };

  const captureFace = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        const imageData = canvasRef.current.toDataURL('image/jpeg');
        setFaceData(imageData);
        
        // Stop camera stream
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        
        // Generate TOTP secret
        const { data, error } = await generateTOTPSecret();
        
        if (error || !data) {
          toast({
            title: "Error",
            description: "Failed to generate authenticator secret",
            variant: "destructive"
          });
          return;
        }
        
        setQrCodeUrl(data.qrCodeUrl);
        setTotpSecret(data.secret);
        
        // Save auth data
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('auth_data').insert({
            user_id: user.id,
            totp_secret: data.secret,
            face_template: imageData,
            face_enrolled: true,
            totp_verified: false
          });
        }
        
        setStep(3);
      }
    }
  };

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length === 6) {
      // Verify TOTP
      const { data, error } = await supabase.functions.invoke('verify-totp', {
        body: { token: otp }
      });
      
      if (error || !data?.valid) {
        toast({
          title: "Invalid Code",
          description: "Please check your authenticator app and try again",
          variant: "destructive"
        });
        return;
      }
      
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
                    minLength={6}
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
                <div className="bg-secondary rounded-lg p-6 text-center space-y-4">
                  {!isCapturing ? (
                    <>
                      <Camera className="h-16 w-16 mx-auto text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Capture your face</p>
                        <p className="text-sm text-muted-foreground">
                          We'll use this for biometric authentication
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="relative">
                      <video 
                        ref={videoRef} 
                        className="w-full rounded-lg"
                        playsInline
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  )}
                </div>
                {!isCapturing ? (
                  <Button onClick={startFaceCapture} className="w-full h-11">
                    <Camera className="mr-2 h-4 w-4" />
                    Start Camera
                  </Button>
                ) : (
                  <Button onClick={captureFace} className="w-full h-11">
                    Capture Face
                  </Button>
                )}
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleStep3} className="space-y-4">
                <div className="bg-secondary rounded-lg p-6 text-center space-y-4">
                  {qrCodeUrl && (
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code" 
                      className="w-64 h-64 mx-auto bg-white p-2 rounded-lg"
                    />
                  )}
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">Scan with Microsoft Authenticator</p>
                    <p className="text-sm text-muted-foreground">
                      Open your authenticator app and scan this QR code
                    </p>
                    <p className="text-xs text-muted-foreground font-mono bg-background p-2 rounded break-all">
                      {totpSecret}
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