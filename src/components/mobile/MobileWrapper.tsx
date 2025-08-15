import { useEffect, ReactNode } from 'react';
import { useMobile } from '@/hooks/useMobile';
import { Loader2 } from 'lucide-react';

interface MobileWrapperProps {
  children: ReactNode;
}

export function MobileWrapper({ children }: MobileWrapperProps) {
  const { isNative, isAndroid } = useMobile();

  useEffect(() => {
    // Add mobile-specific styles
    if (isNative) {
      document.body.classList.add('mobile-app');
      if (isAndroid) {
        document.body.classList.add('android-app');
      }
      
      // Add safe area CSS variables
      document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
      document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
      document.documentElement.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
      document.documentElement.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
    }
  }, [isNative, isAndroid]);

  return (
    <div className={`mobile-app-container ${isNative ? 'native-app' : 'web-app'}`}>
      {children}
    </div>
  );
}

export function MobileLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-eeu-green/10 to-eeu-orange/10 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-eeu-green rounded-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">EEU Complaint Management</h3>
          <p className="text-sm text-gray-600">Loading application...</p>
        </div>
      </div>
    </div>
  );
}