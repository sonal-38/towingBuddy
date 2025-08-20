import { Car, Mail, Phone, MapPin } from "lucide-react";

const AppFooter = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Car className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">TowingBuddy</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional vehicle towing management system for efficient operations and seamless owner experience.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Quick Access</h3>
            <div className="space-y-2">
              <a href="/admin/login" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Admin Portal
              </a>
              <a href="/user/login" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Vehicle Owner Login
              </a>
              <a href="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                +91 1800-123-456
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                support@towingbuddy.com
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                Mumbai, Maharashtra
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 TowingBuddy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;