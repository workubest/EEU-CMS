import { useEffect, ReactNode } from 'react';
import { useMobile } from '@/hooks/useMobile';
import { motion } from 'framer-motion';
import { Loader2, Zap } from 'lucide-react';

interface ModernMobileWrapperProps {
  children: ReactNode;
}

export function ModernMobileWrapper({ children }: ModernMobileWrapperProps) {
  const { isNative, isAndroid } = useMobile();

  useEffect(() => {
    // Add modern mobile-specific styles
    if (isNative) {
      document.body.classList.add('modern-mobile-app');
      if (isAndroid) {
        document.body.classList.add('android-material');
      }
      
      // Add CSS custom properties for modern theming
      document.documentElement.style.setProperty('--mobile-primary', '#6366F1');
      document.documentElement.style.setProperty('--mobile-secondary', '#EC4899');
      document.documentElement.style.setProperty('--mobile-accent', '#10B981');
      document.documentElement.style.setProperty('--mobile-bg', '#F8FAFC');
      document.documentElement.style.setProperty('--mobile-surface', '#FFFFFF');
      document.documentElement.style.setProperty('--mobile-glass', 'rgba(255, 255, 255, 0.1)');
      document.documentElement.style.setProperty('--mobile-shadow', '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)');
      
      // Safe area handling
      document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
      document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
      document.documentElement.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
      document.documentElement.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
    }
  }, [isNative, isAndroid]);

  if (!isNative) {
    return <>{children}</>;
  }

  return (
    <motion.div 
      className="modern-mobile-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

export function ModernMobileLoader() {
  return (
    <motion.div 
      className="modern-mobile-loader"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="loader-container">
        <motion.div 
          className="loader-icon"
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 1, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <Zap className="h-8 w-8 text-white" />
        </motion.div>
        <motion.div 
          className="loader-text"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-white mb-2">EEU Complaints</h3>
          <p className="text-white/80 text-sm">Loading your experience...</p>
        </motion.div>
        <motion.div 
          className="loader-progress"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      </div>
      
      {/* Background animation */}
      <div className="loader-background">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="floating-orb"
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 3,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              left: `${20 + i * 10}%`,
              top: `${30 + (i % 2) * 40}%`
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}