import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "@/components/AdminHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Car, User, MapPin, DollarSign, AlertTriangle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AddVehicle = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [ownerDetails, setOwnerDetails] = useState({
    name: "",
    phone: "",
    model: "",
  });
  const [towingInfo, setTowingInfo] = useState({
    towedFrom: "",
    towedTo: "",
    fine: "",
    reason: "",
  });

  const handleVehicleNumberChange = (value: string) => {
    setVehicleNumber(value);
    
    // Clear previous data when vehicle number changes
    if (value.length < 8) {
      setOwnerDetails({
        name: "",
        phone: "",
        model: "",
      });
      return;
    }
    
    // Simulate auto-fetch owner details with realistic data based on vehicle number
    if (value.length >= 8) {
      setTimeout(() => {
        // Simulate different responses based on vehicle number
        const vehicleData = getVehicleData(value);
        setOwnerDetails(vehicleData);
      }, 800);
    }
  };

  // Simulate database lookup for vehicle owner details
  const getVehicleData = (vehicleNumber: string) => {
    const mockDatabase = {
      "MH12AB1234": {
        name: "Rajesh Kumar",
        phone: "+91 9876543210",
        model: "Maruti Swift VDI",
      },
      "DL01BC5678": {
        name: "Priya Sharma", 
        phone: "+91 9123456789",
        model: "Hyundai i20 Sportz",
      },
      "KA03CD9012": {
        name: "Amit Patel",
        phone: "+91 8765432109", 
        model: "Honda City ZX",
      },
      "TN09EF3456": {
        name: "Lakshmi Reddy",
        phone: "+91 7890123456",
        model: "Toyota Innova Crysta",
      }
    };

    // Remove spaces and convert to uppercase for lookup
    const cleanNumber = vehicleNumber.replace(/\s+/g, '').toUpperCase();
    
    // Return data if found, otherwise return default
    return mockDatabase[cleanNumber] || {
      name: "Vehicle Owner",
      phone: "+91 9000000000", 
      model: "Unknown Model",
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate submission and SMS sending
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Towing Record Added",
        description: `SMS notification sent to ${ownerDetails.phone}`,
      });
      navigate("/admin/dashboard");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      
      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/dashboard")}
              className="w-10 h-10 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Add Towing Record</h2>
              <p className="text-muted-foreground">Register a new vehicle towing with owner notification</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Information */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" />
                  Vehicle Information
                </CardTitle>
                <CardDescription>Enter vehicle number to auto-fetch owner details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                  <Input
                    id="vehicleNumber"
                    placeholder="e.g., MH 12 AB 1234"
                    value={vehicleNumber}
                    onChange={(e) => handleVehicleNumberChange(e.target.value)}
                    className="h-12 text-lg"
                    required
                  />
                </div>

                {ownerDetails.name && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-success/5 rounded-lg border border-success/20">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Owner Name</Label>
                      <p className="font-medium">{ownerDetails.name}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Phone Number</Label>
                      <p className="font-medium">{ownerDetails.phone}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Vehicle Model</Label>
                      <p className="font-medium">{ownerDetails.model}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Towing Information */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-warning" />
                  Towing Information
                </CardTitle>
                <CardDescription>Fill in the towing details and violation information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="towedFrom">Towed From *</Label>
                    <Input
                      id="towedFrom"
                      placeholder="e.g., Airport Road, Near Terminal 2"
                      value={towingInfo.towedFrom}
                      onChange={(e) => setTowingInfo(prev => ({ ...prev, towedFrom: e.target.value }))}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="towedTo">Towed To *</Label>
                    <Select onValueChange={(value) => setTowingInfo(prev => ({ ...prev, towedTo: value }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select depot location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="city-central">City Central Depot</SelectItem>
                        <SelectItem value="north-depot">North Depot</SelectItem>
                        <SelectItem value="south-depot">South Depot</SelectItem>
                        <SelectItem value="east-depot">East Depot</SelectItem>
                        <SelectItem value="west-depot">West Depot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fine">Fine Amount (₹) *</Label>
                    <Input
                      id="fine"
                      type="number"
                      placeholder="2500"
                      value={towingInfo.fine}
                      onChange={(e) => setTowingInfo(prev => ({ ...prev, fine: e.target.value }))}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Violation Reason *</Label>
                    <Select onValueChange={(value) => setTowingInfo(prev => ({ ...prev, reason: value }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select violation type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-parking">No Parking Zone Violation</SelectItem>
                        <SelectItem value="overtime-parking">Overtime Parking</SelectItem>
                        <SelectItem value="blocking-traffic">Blocking Traffic</SelectItem>
                        <SelectItem value="bus-stop">Blocking Bus Stop</SelectItem>
                        <SelectItem value="fire-lane">Fire Lane Violation</SelectItem>
                        <SelectItem value="disabled-spot">Disabled Parking Violation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Section */}
            <Card className="shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20 mb-4">
                  <Send className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">SMS Notification</p>
                    <p className="text-sm text-muted-foreground">
                      Owner will be automatically notified via SMS with towing details and payment link
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-primary hover:shadow-glow transition-all duration-300"
                  disabled={isLoading || !vehicleNumber || !ownerDetails.name || !towingInfo.towedFrom || !towingInfo.towedTo || !towingInfo.fine || !towingInfo.reason}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      Adding Record & Sending SMS...
                    </div>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Add Towing Record & Send SMS
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddVehicle;