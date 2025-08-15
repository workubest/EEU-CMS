import { useLocation, useNavigate } from 'react-router-dom';
import { useMobile } from '@/hooks/useMobile';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  FileText, 
  Bell, 
  User, 
  ArrowLeft,
  Menu
} from 'lucide-react';
import { useState } from 'react';

export function MobileBottomNavigation() {
  const { isNative } = useMobile();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isNative) return null;

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/complaints', icon: FileText, label: 'Complaints' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/settings', icon: User, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Button
              key={path}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center space-y-1 px-3 py-2 ${
                isActive 
                  ? 'text-eeu-green bg-eeu-green/10' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => navigate(path)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export function MobileTopNavigation() {
  const { isNative, vibrate } = useMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  if (!isNative) return null;

  const canGoBack = location.pathname !== '/dashboard';
  
  const handleBack = () => {
    vibrate();
    navigate(-1);
  };

  const toggleMenu = () => {
    vibrate();
    setShowMenu(!showMenu);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 safe-area-pt">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            {canGoBack && (
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={handleBack}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-lg font-semibold text-gray-800">
              EEU Complaints
            </h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={toggleMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Add top padding to body content */}
      <div className="h-16" />
      
      {/* Mobile menu overlay */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowMenu(false)}>
          <div className="absolute top-16 right-4 bg-white rounded-lg shadow-xl p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                setShowMenu(false);
                navigate('/customer-portal');
              }}
            >
              Customer Portal
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                setShowMenu(false);
                navigate('/quick-report');
              }}
            >
              Quick Report
            </Button>
          </div>
        </div>
      )}
    </>
  );
}