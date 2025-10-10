import { User, Shield as ShieldIcon, ChevronDown, Shield, Car, Users, BarChart3, MapPin, CreditCard } from "lucide-react";
// Home page header styled to match the screenshot, with right-aligned user/admin dropdowns
const HomeHeader = () => {
  const navigate = useNavigate();
  return (
    <header className="w-full px-8 py-3 flex items-center justify-between bg-white shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow">
          <Car className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-extrabold text-blue-700 tracking-tight">TowingBuddy</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative group flex items-center gap-1 cursor-pointer select-none text-gray-700 hover:text-blue-700">
          <User className="w-5 h-5 mr-1" />
          <span>User</span>
          <ChevronDown className="w-4 h-4 ml-1" />
          <div className="absolute right-0 mt-8 min-w-[140px] bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-30">
            <button onClick={() => navigate('/user/login')} className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700">Login</button>
          </div>
        </div>
        <div className="relative group flex items-center gap-1 cursor-pointer select-none text-gray-700 hover:text-blue-700">
          <ShieldIcon className="w-5 h-5 mr-1" />
          <span>Admin</span>
          <ChevronDown className="w-4 h-4 ml-1" />
          <div className="absolute right-0 mt-8 min-w-[140px] bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-30">
            <button onClick={() => navigate('/admin/login')} className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700">Login</button>
          </div>
        </div>
      </div>
    </header>
  );
};
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppFooter from "@/components/AppFooter";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Admin Management",
      description: "Comprehensive towing operations control panel",
      items: ["Add towing records", "Dashboard analytics", "Fine management", "Owner notifications"]
    },
    {
      icon: Car,
      title: "Vehicle Tracking",
      description: "Real-time vehicle location and status",
      items: ["Live location tracking", "Depot management", "Route optimization", "Status updates"]
    },
    {
      icon: Users,
      title: "Owner Portal",
      description: "Easy access for vehicle owners",
      items: ["Fine payment system", "Towing history", "SMS notifications", "Support system"]
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Data-driven insights and reporting",
      items: ["Violation patterns", "Revenue tracking", "Performance metrics", "Trend analysis"]
    }
  ];

  return (
    <>
      <div className="homepage-gradient flex flex-col min-h-screen">
        <HomeHeader />
        <div className="absolute inset-0 bg-black/5"></div>
        {/* Hero Section */}
        <section className="homepage-hero relative z-10 container mx-auto px-4 py-16 flex flex-col items-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-4">
            Welcome to <span className="text-blue-700">TowingBuddy</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 text-center max-w-2xl mb-10">
            Your trusted partner for vehicle towing management. Track, manage, and pay for your vehicle services with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-4">
            <Button
              onClick={() => navigate("/admin/login")}
              size="lg"
              className="bg-primary text-white font-semibold shadow-lg hover:scale-105 hover:shadow-glow transition-all duration-300 h-14 px-8 text-lg"
            >
              <Shield className="w-5 h-5 mr-2" />
              Admin Login
            </Button>
            <Button
              onClick={() => navigate("/user/login")}
              size="lg"
              variant="outline"
              className="border-primary text-primary font-semibold bg-white/80 hover:bg-primary hover:text-white hover:shadow-glow transition-all duration-300 h-14 px-8 text-lg"
            >
              <Car className="w-5 h-5 mr-2" />
              User Login
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="homepage-card shadow-elegant bg-white/90 border border-primary/10 backdrop-blur-lg hover:bg-primary/10 transition">
                <CardHeader className="text-center">
                  <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 shadow-glow">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-muted-foreground flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div id="about" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="homepage-card shadow-elegant bg-success/10 border-success/20 hover:bg-success/20 transition">
            <CardContent className="pt-6 text-center">
              <MapPin className="w-8 h-8 text-success mx-auto mb-4" />
              <div className="text-2xl font-bold text-success mb-2">Real-time</div>
              <p className="text-sm text-muted-foreground">Vehicle location tracking</p>
            </CardContent>
          </Card>
          
          <Card className="homepage-card shadow-elegant bg-warning/10 border-warning/20 hover:bg-warning/20 transition">
            <CardContent className="pt-6 text-center">
              <CreditCard className="w-8 h-8 text-warning mx-auto mb-4" />
              <div className="text-2xl font-bold text-warning mb-2">Instant</div>
              <p className="text-sm text-muted-foreground">Fine payment system</p>
            </CardContent>
          </Card>
          
          <Card className="homepage-card shadow-elegant bg-primary/10 border-primary/20 hover:bg-primary/20 transition">
            <CardContent className="pt-6 text-center">
              <BarChart3 className="w-8 h-8 text-primary mx-auto mb-4" />
              <div className="text-2xl font-bold text-primary mb-2">Smart</div>
              <p className="text-sm text-muted-foreground">Analytics & reporting</p>
            </CardContent>
          </Card>
        </div>
        <AppFooter />
      </div>
    </>
  );
};

export default Index;
