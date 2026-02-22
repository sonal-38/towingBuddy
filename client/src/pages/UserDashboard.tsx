import { useState, useEffect } from "react";
import UserHeader from "@/components/UserHeader";
import PayPalPayment from "@/components/PayPalPayment";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TowingLocationMap from '@/components/TowingLocationMap';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, MapPin, CreditCard, Clock, History, Search, Navigation, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface TowingRecord {
  _id: string;
  plateNumber: string;
  towedFrom: string;
  towedTo: string;
  fine: number;
  reason: string;
  createdAt: string;
  paymentStatus?: string;
  paymentId?: string;
  paidAt?: string;
  owner?: {
    name: string;
    phone: string;
    model: string;
  };
  // optional coordinates saved by admin when creating the record
  towedFromCoords?: { lat: number; lon: number };
  towedToCoords?: { lat: number; lon: number };
}

interface VehicleInfo {
  number: string;
  model: string;
  owner: string;
  phone: string;
}

const UserDashboard = () => {
  const [towingRecords, setTowingRecords] = useState<TowingRecord[]>([]);
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Get towing records from sessionStorage (set during OTP verification)
    const storedVehicles = sessionStorage.getItem('towing_vehicles');
    if (storedVehicles) {
      try {
        const vehicles = JSON.parse(storedVehicles);
        setTowingRecords(vehicles);
        
        // Extract vehicle info from the first record
        if (vehicles.length > 0) {
          const firstRecord = vehicles[0];
          setVehicleInfo({
            number: firstRecord.plateNumber,
            model: firstRecord.owner?.model || 'Unknown Model',
            owner: firstRecord.owner?.name || 'Unknown Owner',
            phone: firstRecord.owner?.phone || 'Unknown Phone'
          });
        }
      } catch (err) {
        console.error('Error parsing stored vehicles:', err);
        toast({
          title: 'Error',
          description: 'Failed to load vehicle data',
          variant: 'destructive'
        });
      }
    }
    setLoading(false);
  }, [toast]);

  // Get the most recent towing record as "current"
  const currentTowing = towingRecords.length > 0 ? {
    status: "towed",
    towedFrom: towingRecords[0].towedFrom,
    towedTo: towingRecords[0].towedTo,
    fine: towingRecords[0].fine,
    reason: towingRecords[0].reason,
    towedAt: new Date(towingRecords[0].createdAt).toLocaleString(),
    fineStatus: towingRecords[0].paymentStatus || "unpaid",
    paymentId: towingRecords[0].paymentId,
    paidAt: towingRecords[0].paidAt,
  } : null;

  // Use all records as history
  const towingHistory = towingRecords.map((record, index) => ({
    id: record._id,
    date: new Date(record.createdAt).toLocaleDateString(),
    towedFrom: record.towedFrom,
    towedTo: record.towedTo,
    fine: record.fine,
    status: record.paymentStatus || "unpaid",
    reason: record.reason,
    paidAt: record.paidAt ? new Date(record.paidAt).toLocaleDateString() : null,
  }));

  const getStatusBadge = (status: string) => {
    if (status === "paid") {
      return <Badge className="bg-success text-success-foreground">Paid</Badge>;
    }
    return <Badge className="bg-warning text-warning-foreground">Unpaid</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading vehicle data...</p>
        </div>
      </div>
    );
  }

  if (!vehicleInfo || towingRecords.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <UserHeader />
        <main className="p-6">
          <div className="max-w-6xl mx-auto">
            <Card className="shadow-card">
              <CardContent className="p-8 text-center">
                <Car className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Vehicle Data Found</h3>
                <p className="text-muted-foreground mb-4">
                  Please login with your vehicle number to view towing records.
                </p>
                <Button onClick={() => window.location.href = '/user/login'}>
                  Go to Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UserHeader />
      
      <main className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-bold text-foreground">My Vehicle</h2>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground">
                    Home
                  </Button>
                </div>
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="current">Current Status</TabsTrigger>
              <TabsTrigger value="location">Search Location</TabsTrigger>
              <TabsTrigger value="payment">Pay Fine</TabsTrigger>
              <TabsTrigger value="history">Past History</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-4">
              {/* Current Towing Status */}
              {currentTowing ? (
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
              ) : (
                <Card className="shadow-card">
                  <CardContent className="p-8 text-center">
                    <Car className="w-16 h-16 mx-auto text-success mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Active Towing</h3>
                    <p className="text-muted-foreground">
                      Your vehicle is not currently towed. Check the history tab for past records.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="location" className="space-y-4">
              {/* Vehicle Location (render map with live tracking + directions) */}
              {currentTowing ? (
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>Location Details</CardTitle>
                    <CardDescription>Live location + towed-to depot shown on Google Maps and OpenStreetMap</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Show towed-to depot location on OpenStreetMap */}
                      <TowingLocationMap
                        towedFromAddress={currentTowing.towedFrom}
                        towedToAddress={currentTowing.towedTo}
                        towedFromCoords={towingRecords[0]?.towedFromCoords || undefined}
                        towedToCoords={towingRecords[0]?.towedToCoords || undefined}
                        vehicleNumber={vehicleInfo?.number}
                      />
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Towed From</label>
                          <p className="text-sm">{currentTowing.towedFrom}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Towed To</label>
                          <p className="text-sm">{currentTowing.towedTo}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-card">
                  <CardContent className="p-8 text-center">
                    <Car className="w-16 h-16 mx-auto text-success mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Active Towing</h3>
                    <p className="text-muted-foreground">
                      Your vehicle is not currently towed. Check the history tab for past records.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="payment" className="space-y-4">
              {/* PayPal Payment */}
              {currentTowing ? (
                <PayPalPayment
                  amount={currentTowing.fine}
                  vehicleNumber={vehicleInfo?.number || ''}
                  towingId={towingRecords[0]?._id || ''}
                  onPaymentSuccess={(paymentId) => {
                    console.log('Payment successful:', paymentId);
                    // Here you would update the payment status in your backend
                    toast({
                      title: 'Payment Successful!',
                      description: 'Your fine has been paid. Vehicle will be released soon.',
                    });
                  }}
                  onPaymentError={(error) => {
                    console.error('Payment error:', error);
                  }}
                />
              ) : (
                <Card className="shadow-card">
                  <CardContent className="p-8 text-center">
                    <CreditCard className="w-16 h-16 mx-auto text-success mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Outstanding Fines</h3>
                    <p className="text-muted-foreground">
                      Your vehicle has no pending fines to pay.
                    </p>
                  </CardContent>
                </Card>
              )}
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

export default UserDashboard;