import AdminHeader from "@/components/AdminHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Users, DollarSign, AlertTriangle, Plus, Edit, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

type RawVehicle = {
  _id?: string;
  plateNumber?: string;
  vehicleNumber?: string;
  owner?: { name?: string; ownerName?: string; phone?: string; model?: string };
  ownerName?: string;
  towedFrom?: string;
  towedTo?: string;
  fine?: number;
  status?: string;
  createdAt?: string;
  date?: string;
};

type VehicleRecord = {
  id: string | number;
  vehicleNumber: string;
  ownerName: string;
  towedFrom: string;
  towedTo: string;
  fine: number;
  status: string;
  date: string;
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Total Towed Vehicles",
      value: "127",
      description: "Active towing records",
      icon: Car,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Paid Fines",
      value: "₹89,450",
      description: "This month",
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Unpaid Fines",
      value: "₹45,200",
      description: "Pending collection",
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Total Owners",
      value: "89",
      description: "Registered users",
      icon: Users,
      color: "text-accent-foreground",
      bgColor: "bg-accent",
    },
  ];

  const [recentTowings, setRecentTowings] = useState<VehicleRecord[]>([]);
  const [loadingTowings, setLoadingTowings] = useState<boolean>(true);

  const formatPlate = (plate?: string) => {
    if (!plate) return '';
    const cleaned = plate.replace(/\s+/g, '').toUpperCase();
    // try simple India-like formatting: XXNNXXNNNN -> XX NN XX NNNN
    const m = cleaned.match(/^([A-Z]{2})(\d{1,2})([A-Z]{1,2})(\d{1,4})$/);
    if (m) return `${m[1]} ${m[2]} ${m[3]} ${m[4]}`;
    return plate;
  };

  useEffect(() => {
    let mounted = true;
    const fetchRecent = async () => {
      try {
        const env = (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env;
        const apiBase = env?.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/api/vehicles?limit=10&page=1`);
        if (!res.ok) {
          console.error('Failed to fetch vehicles', res.statusText);
          setRecentTowings([]);
          setLoadingTowings(false);
          return;
        }
        const json = await res.json();
        // backend returns { vehicles: [...], total, page, limit }
        const vehicles = Array.isArray(json?.vehicles) ? json.vehicles : [];
        if (!mounted) return;
        setRecentTowings(vehicles.map((v: RawVehicle, idx: number): VehicleRecord => ({
          id: v._id || idx,
          vehicleNumber: formatPlate(v.plateNumber || v.vehicleNumber || ''),
          ownerName: v.owner?.name || v.ownerName || v.owner?.ownerName || '-',
          towedFrom: v.towedFrom || '',
          towedTo: v.towedTo || '',
          fine: v.fine || 0,
          status: v.status || 'unpaid',
          date: v.createdAt ? new Date(v.createdAt).toLocaleString() : (v.date || ''),
        })));
      } catch (err) {
        console.error('Error fetching recent towings', err);
        if (mounted) setRecentTowings([]);
      } finally {
        if (mounted) setLoadingTowings(false);
      }
    };

    fetchRecent();
    return () => { mounted = false; };
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === "paid") {
      return <Badge className="bg-success text-success-foreground">Paid</Badge>;
    }
    return <Badge className="bg-warning text-warning-foreground">Unpaid</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
              <p className="text-muted-foreground">Monitor and manage vehicle towing operations</p>
            </div>
            <Button 
              onClick={() => navigate("/admin/add-vehicle")}
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Towing Record
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="shadow-card hover:shadow-elegant transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Towings Table */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recent Towing Records</CardTitle>
              <CardDescription>Latest vehicle towing activities and fine status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Vehicle</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Owner</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">From → To</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fine</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingTowings ? (
                      <tr>
                        <td colSpan={7} className="py-6 px-4 text-center text-muted-foreground">Loading recent towings…</td>
                      </tr>
                    ) : recentTowings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 px-4 text-center text-muted-foreground">No recent towing records</td>
                      </tr>
                    ) : (
                      recentTowings.map((record) => (
                        <tr key={record.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium">{record.vehicleNumber}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{record.ownerName}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              {record.towedFrom} → {record.towedTo}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">₹{Number(record.fine).toLocaleString()}</div>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(record.status)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-muted-foreground">{record.date}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;