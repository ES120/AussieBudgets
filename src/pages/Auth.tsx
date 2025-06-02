
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/auth/AuthForm';

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <img 
            src="/lovable-uploads/ed689a13-8ad3-42d6-b521-40710028fdcb.png" 
            alt="Aussie Budget" 
            className="mx-auto h-16 w-auto"
          />
        </div>
        <AuthForm 
          mode={mode} 
          onToggle={() => setMode(mode === 'signin' ? 'signup' : 'signin')} 
        />
      </div>
    </div>
  );
}
