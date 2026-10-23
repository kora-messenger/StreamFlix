import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './src/navigation/Navigation';
import { ToastProvider } from './src/components/ui';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <ToastProvider>
        <Navigation />
      </ToastProvider>
    </SafeAreaProvider>
  );
}
