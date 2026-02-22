import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import LocationSearchInput from "@/components/LocationSearchInput";
import LocationPreviewMap from "@/components/LocationPreviewMap";
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

  // Optional coordinate inputs (admin can provide lat/lon to avoid runtime geocoding)
  const [towingCoords, setTowingCoords] = useState({
    towedFromLat: '',
    towedFromLon: '',
    towedToLat: '',
    towedToLon: '',
  });

  const lookupOwner = async (rawVehicleNumber: string) => {
    const env = (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env;
    const apiBase = env?.VITE_API_URL || 'http://localhost:5000';
    const clean = rawVehicleNumber.replace(/\s+/g, '').toUpperCase();
    if (!clean) return null;

    try {
      const res = await fetch(`${apiBase}/api/owners/lookup?vehicleNumber=${encodeURIComponent(clean)}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json?.owner || null;
    } catch (err) {
      console.error('Owner lookup failed', err);
      return null;
    }
  };

  const handleVehicleNumberChange = (value: string) => {
    setVehicleNumber(value);
    // Clear previous data when vehicle number changes
    if (value.replace(/\s+/g, '').length < 6) {
      setOwnerDetails({ name: '', phone: '', model: '' });
    }
  };

  const handleVehicleNumberLookup = async () => {
    if (!vehicleNumber || vehicleNumber.replace(/\s+/g, '').length < 6) return;
    const owner = await lookupOwner(vehicleNumber);
    if (owner) {
      setOwnerDetails({ name: owner.ownerName || owner.name || '', phone: owner.phone || '', model: owner.model || '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Read Vite env safely
      const env = (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env;
      const apiBase = env?.VITE_API_URL || 'http://localhost:5000';

      // prepare payload matching backend expected fields; include owner info if available
      type VehiclePayload = {
        vehicleNumber: string;
        towedFrom: string;
        towedTo: string;
        fine: number;
        reason: string;
        owner?: { name?: string; phone?: string; model?: string };
      };

      type Coord = { lat: number; lon: number };

      const payload: VehiclePayload & Partial<{ towedFromCoords: Coord; towedToCoords: Coord }> = {
        vehicleNumber: vehicleNumber,
        towedFrom: towingInfo.towedFrom,
        towedTo: towingInfo.towedTo,
        fine: Number(towingInfo.fine) || 0,
        reason: towingInfo.reason,
      };
      if (ownerDetails.name) {
        payload.owner = {
          name: ownerDetails.name,
          phone: ownerDetails.phone,
          model: ownerDetails.model,
        };
      }
      // include coordinates if provided and parseable
      const fromLat = towingCoords.towedFromLat ? Number(towingCoords.towedFromLat) : NaN;
      const fromLon = towingCoords.towedFromLon ? Number(towingCoords.towedFromLon) : NaN;
      const toLat = towingCoords.towedToLat ? Number(towingCoords.towedToLat) : NaN;
      const toLon = towingCoords.towedToLon ? Number(towingCoords.towedToLon) : NaN;
  if (!Number.isNaN(fromLat) && !Number.isNaN(fromLon)) (payload as unknown as Record<string, unknown>)['towedFromCoords'] = { lat: fromLat, lon: fromLon };
  if (!Number.isNaN(toLat) && !Number.isNaN(toLon)) (payload as unknown as Record<string, unknown>)['towedToCoords'] = { lat: toLat, lon: toLon };

      const res = await fetch(`${apiBase}/api/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to add vehicle');

      setIsLoading(false);
      toast({
        title: 'Towing Record Added',
        description: `Record added for ${vehicleNumber}`,
      });
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Error',
        description: message || 'Could not add towing record',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        showBackButton={true} 
        backTo="/admin/dashboard"
        title="Add Towing Record"
        subtitle="Register new vehicle towing"
      />
      
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
                    onBlur={() => handleVehicleNumberLookup()}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        await handleVehicleNumberLookup();
                      }
                    }}
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
                <CardDescription>Search locations using OpenStreetMap - coordinates are auto-filled</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <LocationSearchInput
                      label="Towed From"
                      value={towingInfo.towedFrom}
                      onLocationSelect={(data) => {
                        setTowingInfo(prev => ({ ...prev, towedFrom: data.address }));
                        setTowingCoords(prev => ({
                          ...prev,
                          towedFromLat: data.lat.toString(),
                          towedFromLon: data.lon.toString(),
                        }));
                      }}
                      placeholder="Search for pickup location..."
                      required={true}
                      id="towedFrom"
                    />
                    {towingCoords.towedFromLat && towingCoords.towedFromLon && (
                      <div className="mt-2 px-3 py-2 bg-success/10 border border-success/20 rounded-md">
                        <p className="text-xs font-medium text-success flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          Coordinates: {Number(towingCoords.towedFromLat).toFixed(6)}, {Number(towingCoords.towedFromLon).toFixed(6)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <LocationSearchInput
                      label="Towed To"
                      value={towingInfo.towedTo}
                      onLocationSelect={(data) => {
                        setTowingInfo(prev => ({ ...prev, towedTo: data.address }));
                        setTowingCoords(prev => ({
                          ...prev,
                          towedToLat: data.lat.toString(),
                          towedToLon: data.lon.toString(),
                        }));
                      }}
                      placeholder="Search for depot location..."
                      required={true}
                      id="towedTo"
                    />
                    {towingCoords.towedToLat && towingCoords.towedToLon && (
                      <div className="mt-2 px-3 py-2 bg-success/10 border border-success/20 rounded-md">
                        <p className="text-xs font-medium text-success flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          Coordinates: {Number(towingCoords.towedToLat).toFixed(6)}, {Number(towingCoords.towedToLon).toFixed(6)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Map Preview */}
                {(towingCoords.towedFromLat || towingCoords.towedToLat) && (
                  <div className="pt-4">
                    <LocationPreviewMap
                      fromLat={towingCoords.towedFromLat ? parseFloat(towingCoords.towedFromLat) : undefined}
                      fromLon={towingCoords.towedFromLon ? parseFloat(towingCoords.towedFromLon) : undefined}
                      toLat={towingCoords.towedToLat ? parseFloat(towingCoords.towedToLat) : undefined}
                      toLon={towingCoords.towedToLon ? parseFloat(towingCoords.towedToLon) : undefined}
                      fromLabel="Towed From"
                      toLabel="Towed To (Depot)"
                    />
                  </div>
                )}

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