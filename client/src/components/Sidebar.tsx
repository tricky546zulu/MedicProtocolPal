import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  PillBottle, 
  FileText, 
  Calculator, 
  Star, 
  Settings, 
  User, 
  LogOut, 
  X 
} from "lucide-react";

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const { user, signOut } = useAuth();

  const navItems = [
    { icon: PillBottle, label: "Medications", href: "#", active: true },
    { icon: FileText, label: "Protocols", href: "#", active: false },
    { icon: Calculator, label: "Dosage Calculator", href: "#", active: false },
    { icon: Star, label: "Favorites", href: "#", active: false },
    { icon: Settings, label: "Settings", href: "#", active: false },
  ];

  const handleSignOut = () => {
    signOut();
    onMobileClose();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white shadow-sm border-r border-gray-200 hidden lg:block">
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  item.active
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden">
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMobileClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      item.active
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={onMobileClose}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </a>
                );
              })}
              
              <hr className="my-4" />
              
              <div className="flex items-center px-3 py-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-gray-700">{user?.name}</span>
              </div>
              
              <Button
                variant="ghost"
                className="w-full justify-start px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                onClick={handleSignOut}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </Button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
