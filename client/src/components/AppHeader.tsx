import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Car, ArrowLeft } from "lucide-react";

interface AppHeaderProps {
  showBackButton?: boolean;
  backTo?: string;
  title?: string;
  subtitle?: string;
}

const AppHeader = ({ showBackButton = false, backTo = "/", title, subtitle }: AppHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="bg-card border-b border-border shadow-card">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              variant="outline"
              onClick={() => navigate(backTo)}
              className="w-10 h-10 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">TowingBuddy</h1>
              <p className="text-sm text-muted-foreground">Vehicle Management System</p>
            </div>
          </div>
        </div>

        {title && (
          <div className="text-right">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;