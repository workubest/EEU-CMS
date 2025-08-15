import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Toast } from '@capacitor/toast';

export interface MobileInfo {
  isNative: boolean;
  platform: string;
  isAndroid: boolean;
  isIOS: boolean;
}

export const useMobile = () => {
  const [mobileInfo, setMobileInfo] = useState<MobileInfo>({
    isNative: false,
    platform: 'web',
    isAndroid: false,
    isIOS: false
  });

  useEffect(() => {
    const setupMobile = async () => {
      const isNative = Capacitor.isNativePlatform();
      const platform = Capacitor.getPlatform();
      
      setMobileInfo({
        isNative,
        platform,
        isAndroid: platform === 'android',
        isIOS: platform === 'ios'
      });

      if (isNative) {
        // Hide splash screen after app is ready
        await SplashScreen.hide();
        
        // Configure status bar with modern styling
        await StatusBar.setStyle({ style: Style.Default });
        await StatusBar.setBackgroundColor({ color: '#667eea' });
        
        // Configure keyboard
        Keyboard.addListener('keyboardWillShow', (info) => {
          document.body.classList.add('keyboard-open');
        });
        
        Keyboard.addListener('keyboardWillHide', () => {
          document.body.classList.remove('keyboard-open');
        });

        // Handle app state changes
        App.addListener('appStateChange', ({ isActive }) => {
          console.log('App state changed. Is active?', isActive);
        });

        // Handle back button on Android
        if (platform === 'android') {
          App.addListener('backButton', ({ canGoBack }) => {
            if (!canGoBack) {
              App.exitApp();
            } else {
              window.history.back();
            }
          });
        }
      }
    };

    setupMobile();
  }, []);

  const showToast = async (message: string) => {
    if (mobileInfo.isNative) {
      await Toast.show({
        text: message,
        duration: 'short',
        position: 'bottom'
      });
    }
  };

  const vibrate = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (mobileInfo.isNative) {
      await Haptics.impact({ style });
    }
  };

  const setStatusBarColor = async (color: string) => {
    if (mobileInfo.isNative) {
      await StatusBar.setBackgroundColor({ color });
    }
  };

  return {
    ...mobileInfo,
    showToast,
    vibrate,
    setStatusBarColor
  };
};