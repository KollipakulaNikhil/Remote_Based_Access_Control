import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Scan, CheckCircle2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center space-y-8">
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-elevated">
              <Shield className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            Enterprise Security
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
            Advanced two-factor authentication with face recognition and Microsoft Authenticator
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button 
            size="lg"
            onClick={() => navigate("/login")}
            className="h-12 px-8 text-base"
          >
            <Lock className="mr-2 h-5 w-5" />
            Sign In
          </Button>
          <Button 
            size="lg"
            variant="outline"
            onClick={() => navigate("/signup")}
            className="h-12 px-8 text-base"
          >
            Get Started
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 max-w-4xl w-full">
          <div className="bg-card border border-border rounded-lg p-6 shadow-card hover:shadow-elevated transition-all">
            <Scan className="h-10 w-10 text-primary mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Face Recognition</h3>
            <p className="text-sm text-muted-foreground">
              Advanced biometric authentication with liveness detection
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6 shadow-card hover:shadow-elevated transition-all">
            <Lock className="h-10 w-10 text-primary mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-foreground mb-2">TOTP Verification</h3>
            <p className="text-sm text-muted-foreground">
              Secure time-based one-time passwords via Microsoft Authenticator
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6 shadow-card hover:shadow-elevated transition-all">
            <CheckCircle2 className="h-10 w-10 text-success mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Enterprise Ready</h3>
            <p className="text-sm text-muted-foreground">
              Bank-grade security protocols with complete audit logging
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
