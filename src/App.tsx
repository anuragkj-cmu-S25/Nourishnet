import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './utils/auth/AuthContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { RegisterScreen } from './components/auth/RegisterScreen';
import { Toaster } from './components/ui/sonner';
import { initData } from './utils/api';

// Staff screens
import { StaffApp } from './components/staff/StaffApp';

// Volunteer screens
import { VolunteerApp } from './components/volunteer/VolunteerApp';

function AuthenticatedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthFlow />;
  }

  // Route based on user role
  if (user.role === 'staff') {
    return <StaffApp />;
  } else {
    return <VolunteerApp />;
  }
}

function AuthFlow() {
  const [screen, setScreen] = useState<'login' | 'register'>('login');

  if (screen === 'register') {
    return <RegisterScreen onSwitchToLogin={() => setScreen('login')} />;
  }

  return <LoginScreen onSwitchToRegister={() => setScreen('register')} />;
}

export default function App() {
  const [dataInitialized, setDataInitialized] = useState(false);

  // Initialize sample data on first load
  useEffect(() => {
    const initialize = async () => {
      if (!dataInitialized) {
        try {
          await initData();
          setDataInitialized(true);
        } catch (error) {
          console.log('Data initialization (might already exist):', error);
          setDataInitialized(true);
        }
      }
    };
    initialize();
  }, [dataInitialized]);

  return (
    <AuthProvider>
      <Toaster />
      <AuthenticatedApp />
    </AuthProvider>
  );
}
