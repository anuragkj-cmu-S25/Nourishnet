import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useAuth } from '../../utils/auth/AuthContext';
import { Package } from 'lucide-react';

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
}

export function RegisterScreen({ onSwitchToLogin }: RegisterScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'staff' | 'volunteer'>('volunteer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await signUp(email, password, fullName, role);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
    // If successful, auth context will handle navigation
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-green-50 overflow-y-auto">
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 my-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-gray-900 mb-2">Join NourishNet</h1>
            <p className="text-gray-600">Create your account</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-1"
              />
            </div>

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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label className="mb-3 block">I am a:</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as 'staff' | 'volunteer')}>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="volunteer" id="volunteer" />
                  <Label htmlFor="volunteer" className="flex-1 cursor-pointer">
                    <div>
                      <div className="text-gray-900">Volunteer</div>
                      <div className="text-gray-500">Help with sourcing and tasks</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="staff" id="staff" />
                  <Label htmlFor="staff" className="flex-1 cursor-pointer">
                    <div>
                      <div className="text-gray-900">Staff Member</div>
                      <div className="text-gray-500">Manage inventory and coordinate</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:text-blue-700"
              >
                Sign in here
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
