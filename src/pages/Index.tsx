import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Car, Users, BarChart3, MapPin, CreditCard } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-primary">
      <div className="absolute inset-0 bg-black/5"></div>
      
      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="mx-auto w-20 h-20 bg-primary-foreground rounded-3xl flex items-center justify-center shadow-glow mb-8">
            <Car className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-primary-foreground mb-6">
            TowingBuddy
          </h1>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Professional vehicle towing management system for efficient operations and seamless owner experience
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/admin/login")}
              size="lg"
              className="bg-primary-foreground text-primary hover:shadow-glow transition-all duration-300 h-14 px-8"
            >
              <Shield className="w-5 h-5 mr-2" />
              Admin Login
            </Button>
            <Button
              onClick={() => navigate("/user/login")}
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary h-14 px-8"
            >
              <Car className="w-5 h-5 mr-2" />
              Vehicle Owner Login
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="shadow-elegant bg-card/95 backdrop-blur">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-elegant bg-success/10 border-success/20">
            <CardContent className="pt-6 text-center">
              <MapPin className="w-8 h-8 text-success mx-auto mb-4" />
              <div className="text-2xl font-bold text-success mb-2">Real-time</div>
              <p className="text-sm text-muted-foreground">Vehicle location tracking</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-elegant bg-warning/10 border-warning/20">
            <CardContent className="pt-6 text-center">
              <CreditCard className="w-8 h-8 text-warning mx-auto mb-4" />
              <div className="text-2xl font-bold text-warning mb-2">Instant</div>
              <p className="text-sm text-muted-foreground">Fine payment system</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-elegant bg-primary/10 border-primary/20">
            <CardContent className="pt-6 text-center">
              <BarChart3 className="w-8 h-8 text-primary mx-auto mb-4" />
              <div className="text-2xl font-bold text-primary mb-2">Smart</div>
              <p className="text-sm text-muted-foreground">Analytics & reporting</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
