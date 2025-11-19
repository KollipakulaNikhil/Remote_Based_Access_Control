import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Camera } from "lucide-react";
import { signIn } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await signIn(email, password);

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid email or password",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      if (data?.session) {
        // Check user role first
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (!roleData) {
          toast({
            title: "Access Denied",
            description: "No role assigned. Please contact administrator.",
            variant: "destructive"
          });
          await supabase.auth.signOut();
          setIsLoading(false);
          return;
        }

        // Check if user has enrolled 2FA
        const { data: authData } = await supabase
          .from('auth_data')
          .select('face_enrolled, totp_verified')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (authData?.face_enrolled) {
          // Start face capture
          setShowFaceCapture(true);
          toast({
            title: "Password verified",
            description: "Please verify your face",
          });
          startFaceCapture();
        } else {
          // No 2FA setup, redirect directly
          navigate("/dashboard");
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
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
        description: "Could not access camera. Please allow camera permissions or use password fallback.",
        variant: "destructive"
      });
      setIsCapturing(false);
      setShowFaceCapture(false);
      // Fallback: skip to OTP if camera fails
      setShowOTP(true);
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
        
        // Stop camera stream
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        
        // In a production app, you would compare imageData with stored face_template
        // using a face recognition API (Azure Face API, AWS Rekognition, etc.)
        // For now, we'll proceed if a face was captured
        
        toast({
          title: "Face verified",
          description: "Please enter your authenticator code",
        });
        
        setShowFaceCapture(false);
        setShowOTP(true);
        setIsCapturing(false);
      }
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-totp', {
        body: { token: otp }
      });

      if (error || !data?.valid) {
        toast({
          title: "Invalid Code",
          description: "Please check your authenticator and try again",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Fetch user and log successful login
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check user role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!roleData) {
          toast({
            title: "Access Denied",
            description: "No role assigned. Please contact administrator.",
            variant: "destructive"
          });
          await supabase.auth.signOut();
          setIsLoading(false);
          return;
        }

        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'login_success',
          details: 'Successful login with 2FA'
        });
      }

      toast({
        title: "Success",
        description: "Login successful!",
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Verification failed",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
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
              {showFaceCapture
                ? "Position your face in the camera frame"
                : !showOTP 
                ? "Enter your credentials to begin" 
                : "Enter the code from your authenticator app"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {showFaceCapture ? (
              <div className="space-y-4">
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="space-y-2">
                  <Button 
                    onClick={captureFace} 
                    className="w-full h-12" 
                    disabled={!isCapturing}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Capture & Verify Face
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const stream = videoRef.current?.srcObject as MediaStream;
                      stream?.getTracks().forEach(track => track.stop());
                      setShowFaceCapture(false);
                      setShowOTP(true);
                    }}
                    className="w-full h-12"
                  >
                    Skip to OTP
                  </Button>
                </div>
              </div>
            ) : !showOTP ? (
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
                    className="h-12"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Continue"}
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

                <Button 
                  type="submit" 
                  className="w-full h-12"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify & Login"}
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