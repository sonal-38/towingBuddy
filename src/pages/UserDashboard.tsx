import UserHeader from "@/components/UserHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, MapPin, CreditCard, Clock, History, Search, Navigation } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UserDashboard = () => {
  const vehicleInfo = {
    number: "MH 12 AB 1234",
    model: "Maruti Swift",
    owner: "Rajesh Kumar",
    phone: "+91 9876543210",
  };

  const currentTowing = {
    status: "towed",
    towedFrom: "Airport Road, Near Terminal 2",
    towedTo: "City Central Depot",
    fine: 2500,
    reason: "No Parking Zone Violation",
    towedAt: "Today, 2:30 PM",
    fineStatus: "unpaid",
  };

  const towingHistory = [
    {
      id: 1,
      date: "15 Jan 2024",
      towedFrom: "Mall Parking",
      towedTo: "Central Depot",
      fine: 1500,
      status: "paid",
      reason: "Overtime Parking",
      paidAt: "16 Jan 2024",
    },
    {
      id: 2,
      date: "28 Dec 2023",
      towedFrom: "Bus Stop",
      towedTo: "North Depot",
      fine: 3000,
      status: "paid",
      reason: "Blocking Public Transport",
      paidAt: "29 Dec 2023",
    },
  ];

  const getStatusBadge = (status: string) => {
    if (status === "paid") {
      return <Badge className="bg-success text-success-foreground">Paid</Badge>;
    }
    return <Badge className="bg-warning text-warning-foreground">Unpaid</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <UserHeader />
      
      <main className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground">My Vehicle</h2>
              <p className="text-muted-foreground">Track your vehicle status and manage fines</p>
            </div>
          </div>

          {/* Vehicle Info Card */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                  <Car className="w-6 h-6 text-success" />
                </div>
                <div>
                  <CardTitle className="text-xl">{vehicleInfo.number}</CardTitle>
                  <CardDescription>{vehicleInfo.model} • {vehicleInfo.owner}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Tabs defaultValue="current" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="current">Current Status</TabsTrigger>
              <TabsTrigger value="location">Search Location</TabsTrigger>
              <TabsTrigger value="history">Past History</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-4">
              {/* Current Towing Status */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    Current Towing Status
                  </CardTitle>
                  <CardDescription>Your vehicle is currently towed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Towed From</label>
                        <p className="text-sm">{currentTowing.towedFrom}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Towed To</label>
                        <p className="text-sm">{currentTowing.towedTo}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Reason</label>
                        <p className="text-sm">{currentTowing.reason}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Fine Amount</label>
                        <p className="text-xl font-bold">₹{currentTowing.fine.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <div className="mt-1">
                          {getStatusBadge(currentTowing.fineStatus)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Towed At</label>
                        <p className="text-sm">{currentTowing.towedAt}</p>
                      </div>
                    </div>
                  </div>
                  
                  {currentTowing.fineStatus === "unpaid" && (
                    <div className="pt-4 border-t">
                      <Button className="w-full md:w-auto bg-gradient-success hover:shadow-glow transition-all duration-300">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Fine - ₹{currentTowing.fine.toLocaleString()}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="location" className="space-y-4">
              {/* Vehicle Location Search */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Vehicle Location
                  </CardTitle>
                  <CardDescription>Find where your vehicle is currently located</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-6 text-center">
                    <Navigation className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">Interactive Map Coming Soon</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      View real-time location of your towed vehicle on an interactive map
                    </p>
                    <div className="bg-card rounded-lg p-4">
                      <p className="text-sm font-medium">Current Location:</p>
                      <p className="text-sm text-muted-foreground">{currentTowing.towedTo}</p>
                      <p className="text-sm text-muted-foreground">Gate No. 3, Parking Bay A-12</p>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300">
                    <Search className="w-4 h-4 mr-2" />
                    Get Directions to Depot
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {/* Towing History */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-muted-foreground" />
                    Towing History
                  </CardTitle>
                  <CardDescription>View your past towing records and payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {towingHistory.map((record) => (
                      <div key={record.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium">{record.date}</p>
                            <p className="text-sm text-muted-foreground">{record.reason}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{record.fine.toLocaleString()}</p>
                            {getStatusBadge(record.status)}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <p><span className="text-muted-foreground">From:</span> {record.towedFrom}</p>
                          <p><span className="text-muted-foreground">To:</span> {record.towedTo}</p>
                          {record.status === "paid" && (
                            <p><span className="text-muted-foreground">Paid on:</span> {record.paidAt}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

import { AlertTriangle } from "lucide-react";

export default UserDashboard;