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
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const API_BASE = import.meta.env.VITE_API_URL || '';

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First lookup owner to get phone
      const lookup = await fetch(`${API_BASE}/api/owners/lookup?vehicleNumber=${encodeURIComponent(vehicleNumber)}`);
      const lookupData = await lookup.json();
      if (!lookup.ok) throw new Error(lookupData.error || 'Owner not found');

      const ownerPhone: string = lookupData.owner?.phone;
      if (!ownerPhone) throw new Error('Owner phone not available');

      // Mask phone for UI: keep last 4 digits
      const last4 = ownerPhone.slice(-4);
      const masked = ownerPhone.length > 4 ? `+${ownerPhone.replace(/[^0-9]/g, '').slice(0, -4).replace(/./g, 'X')}${last4}` : ownerPhone;

      // Request OTP (backend will still lookup owner but this provides immediate feedback)
      const res = await fetch(`${API_BASE}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request OTP');

      setOtpSent(true);
      toast({ title: 'OTP Sent', description: `Verification code sent to ${masked}` });
    } catch (err) {
      console.error('request-otp error', err);
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Error', description: msg || 'Could not send OTP', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleNumber, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'OTP verification failed');

      toast({ title: 'Login Successful', description: 'Welcome to TowingBuddy' });

      // Optionally store vehicles in sessionStorage for dashboard
      if (data.vehicles) sessionStorage.setItem('towing_vehicles', JSON.stringify(data.vehicles));

      navigate('/user/dashboard');
    } catch (err) {
      console.error('verify-otp error', err);
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Error', description: msg || 'OTP verification failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
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
                <Label htmlFor="vehicleNumber" className="text-sm font-medium">Vehicle Number</Label>
                <div className="relative">
                  <Car className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="vehicleNumber"
                    type="text"
                    placeholder="MH12AB1234"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
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