import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Shield, Phone, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";

const UserLogin = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate OTP sending
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${phone}`,
      });
    }, 1000);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate OTP verification
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Login Successful",
        description: "Welcome to TowingBuddy",
      });
      navigate("/user/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-success flex flex-col">
      <AppHeader />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/5"></div>
      
      <Card className="w-full max-w-md relative z-10 shadow-elegant">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-success rounded-2xl flex items-center justify-center shadow-glow">
            <Car className="w-8 h-8 text-success-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Vehicle Owner</CardTitle>
            <CardDescription className="text-base">
              {otpSent ? "Enter verification code" : "Login with your phone number"}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-success hover:shadow-glow transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-success-foreground/30 border-t-success-foreground rounded-full animate-spin"></div>
                    Sending OTP...
                  </div>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium">Verification Code</Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-10 h-12 text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-success hover:shadow-glow transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-success-foreground/30 border-t-success-foreground rounded-full animate-spin"></div>
                    Verifying...
                  </div>
                ) : (
                  "Verify & Login"
                )}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOtpSent(false)}
                className="w-full text-sm text-muted-foreground hover:text-success"
              >
                Change Phone Number
              </Button>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin/login")}
              className="text-sm text-muted-foreground hover:text-success"
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin? Login Here
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
      <AppFooter />
    </div>
  );
};

export default UserLogin;