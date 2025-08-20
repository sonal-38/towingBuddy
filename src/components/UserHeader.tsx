import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Car, LogOut, Bell, User } from "lucide-react";

const UserHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/user/login");
  };

  return (
    <header className="bg-card border-b border-border shadow-card">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-success rounded-xl flex items-center justify-center">
            <Car className="w-5 h-5 text-success-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">TowingBuddy</h1>
            <p className="text-sm text-muted-foreground">Vehicle Owner Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <User className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;