import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Shield, User, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // Be defensive: servers sometimes return empty or non-JSON bodies on errors.
      const text = await res.text();
      let data: unknown = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        // not JSON — surface raw text as error message
        data = { error: text || res.statusText };
      }

      // safely extract `error` property if present
      const maybeError = ((): string | undefined => {
        if (typeof data === 'object' && data !== null && 'error' in data) {
          const d = data as { error?: unknown };
          if (typeof d.error === 'string') return d.error;
        }
        return undefined;
      })();

      if (!res.ok) {
        toast({ title: 'Login failed', description: maybeError || 'Invalid credentials', variant: 'destructive' });
        return;
      }

      toast({ title: 'Login Successful', description: 'Welcome to TowingBuddy Admin Panel' });
      // TODO: store token/session if you add JWTs later
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('admin login error', err);
      toast({ title: 'Login error', description: 'Unable to reach server', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col">
      <AppHeader />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/5"></div>
      
      <Card className="w-full max-w-md relative z-10 shadow-elegant">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-glow">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
            <CardDescription className="text-base">
              Sign in to manage TowingBuddy system
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@towingbuddy.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-primary hover:shadow-glow transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  Signing In...
                </div>
              ) : (
                "Sign In to Admin Panel"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/user/login")}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              <Car className="w-4 h-4 mr-2" />
              Vehicle Owner? Login Here
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
      <AppFooter />
    </div>
  );
};

export default AdminLogin;