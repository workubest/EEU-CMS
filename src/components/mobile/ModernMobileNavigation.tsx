import { useLocation, useNavigate } from 'react-router-dom';
import { useMobile } from '@/hooks/useMobile';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  FileText, 
  Bell, 
  User, 
  ArrowLeft,
  Menu,
  Plus,
  Search,
  MoreHorizontal,
  X
} from 'lucide-react';
import { useState } from 'react';

export function ModernMobileBottomNavigation() {
  const { isNative, vibrate } = useMobile();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isNative) return null;

  const navItems = [
    { 
      path: '/dashboard', 
      icon: Home, 
      label: 'Home',
      color: '#6366F1'
    },
    { 
      path: '/complaints', 
      icon: FileText, 
      label: 'Cases',
      color: '#EC4899'
    },
    { 
      path: '/dashboard/complaints/new', 
      icon: Plus, 
      label: 'Report',
      color: '#10B981',
      isAction: true
    },
    { 
      path: '/notifications', 
      icon: Bell, 
      label: 'Alerts',
      color: '#F59E0B'
    },
    { 
      path: '/settings', 
      icon: User, 
      label: 'Profile',
      color: '#8B5CF6'
    },
  ];

  const handleNavClick = async (path: string) => {
    await vibrate();
    navigate(path);
  };

  return (
    <motion.div 
      className="modern-bottom-nav"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Glassmorphism background */}
      <div className="nav-background" />
      
      <div className="nav-content">
        {navItems.map(({ path, icon: Icon, label, color, isAction }) => {
          const isActive = location.pathname === path || 
                          (path === '/dashboard' && location.pathname.startsWith('/dashboard'));
          
          return (
            <motion.div
              key={path}
              className={`nav-item ${isAction ? 'action-item' : ''}`}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className={`nav-button ${isActive ? 'active' : ''} ${isAction ? 'action-button' : ''}`}
                onClick={() => handleNavClick(path)}
                style={{ '--nav-color': color } as any}
              >
                <motion.div 
                  className="nav-icon-container"
                  animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                >
                  <Icon className={`nav-icon ${isActive ? 'active-icon' : ''}`} />
                  {isAction && (
                    <motion.div 
                      className="action-glow"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </motion.div>
                <span className={`nav-label ${isActive ? 'active-label' : ''}`}>
                  {label}
                </span>
                {isActive && (
                  <motion.div
                    className="nav-indicator"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function ModernMobileTopNavigation() {
  const { isNative, vibrate } = useMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  if (!isNative) return null;

  const canGoBack = location.pathname !== '/dashboard';
  
  const handleBack = async () => {
    await vibrate();
    navigate(-1);
  };

  const toggleMenu = async () => {
    await vibrate();
    setShowMenu(!showMenu);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/complaints/new')) return 'New Complaint';
    if (path.includes('/complaints')) return 'My Cases';
    if (path.includes('/notifications')) return 'Notifications';
    if (path.includes('/settings')) return 'Settings';
    if (path.includes('/dashboard')) return 'Dashboard';
    return 'EEU Complaints';
  };

  return (
    <>
      <motion.div 
        className="modern-top-nav"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Glassmorphism background */}
        <div className="nav-background" />
        
        <div className="nav-content">
          <div className="nav-left">
            <AnimatePresence mode="wait">
              {canGoBack ? (
                <motion.div
                  key="back"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="back-button"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="logo"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="app-logo"
                >
                  <div className="logo-icon">
                    <span className="logo-text">EEU</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div 
            className="nav-center"
            key={location.pathname}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="page-title">{getPageTitle()}</h1>
          </motion.div>

          <div className="nav-right">
            <Button
              variant="ghost"
              size="sm"
              className="search-button"
              onClick={() => console.log('Search')}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="menu-button"
              onClick={toggleMenu}
            >
              <motion.div
                animate={{ rotate: showMenu ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {showMenu ? <X className="h-5 w-5" /> : <MoreHorizontal className="h-5 w-5" />}
              </motion.div>
            </Button>
          </div>
        </div>
      </motion.div>
      
      {/* Add top padding to body content */}
      <div className="modern-top-spacer" />
      
      {/* Modern menu overlay */}
      <AnimatePresence>
        {showMenu && (
          <motion.div 
            className="modern-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMenu(false)}
          >
            <motion.div 
              className="modern-menu-panel"
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="menu-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="menu-items">
                <Button
                  variant="ghost"
                  className="menu-item"
                  onClick={() => {
                    setShowMenu(false);
                    navigate('/customer-portal');
                  }}
                >
                  <div className="menu-item-icon customer">👥</div>
                  <div className="menu-item-content">
                    <span className="menu-item-title">Customer Portal</span>
                    <span className="menu-item-subtitle">Public access</span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="menu-item"
                  onClick={() => {
                    setShowMenu(false);
                    navigate('/quick-report');
                  }}
                >
                  <div className="menu-item-icon report">⚡</div>
                  <div className="menu-item-content">
                    <span className="menu-item-title">Quick Report</span>
                    <span className="menu-item-subtitle">Fast submission</span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="menu-item"
                  onClick={() => {
                    setShowMenu(false);
                    navigate('/dashboard/analytics');
                  }}
                >
                  <div className="menu-item-icon analytics">📊</div>
                  <div className="menu-item-content">
                    <span className="menu-item-title">Analytics</span>
                    <span className="menu-item-subtitle">View reports</span>
                  </div>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}