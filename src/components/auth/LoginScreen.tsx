import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../utils/auth/AuthContext';
import Logo1 from '../../imports/Logo';

interface LoginScreenProps {
  onSwitchToRegister: () => void;
}

export function LoginScreen({ onSwitchToRegister }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
    // If successful, auth context will handle navigation
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#F2FFB5] to-[#FFFDF6]">
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
              <Logo1 />
            </div>
            <h1 className="text-gray-900 mb-2">Welcome to NourishNet</h1>
            <p className="text-gray-600">Sign in to continue</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#A0C87B] hover:bg-[#8DB668] text-white"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-[#A0C87B] hover:text-[#8DB668]"
              >
                Register here
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}