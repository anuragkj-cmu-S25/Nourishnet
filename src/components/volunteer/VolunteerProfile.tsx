import { useState } from 'react';
import { User, LogOut, Save } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../utils/auth/AuthContext';
import { profileAPI } from '../../utils/api';

export function VolunteerProfile() {
  const { user, session, signOut, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Generate consistent random stats based on user ID
  const itemsSourced = user ? 42 + (user.id.charCodeAt(0) % 100) : 67;
  const hoursVolunteered = user ? 18 + (user.id.charCodeAt(1) % 50) : 35;

  const handleSave = async () => {
    if (!session?.access_token) return;

    setSaving(true);
    try {
      await profileAPI.update({ full_name: fullName }, session.access_token);
      await refreshProfile();
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFDF6]">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <h1 className="text-gray-900">Profile</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Profile Info Card */}
        <Card className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-[#F2FFB5] rounded-full flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-[#A0C87B]" />
            </div>
            <h2 className="text-gray-900">{user?.full_name}</h2>
            <p className="text-gray-600 mt-1">Volunteer</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>

            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-[#A0C87B] hover:bg-[#8DB668] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  onClick={() => {
                    setFullName(user?.full_name || '');
                    setIsEditing(false);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="w-full"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </Card>

        {/* Stats Card */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">My Contributions</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Items Sourced</span>
              <span className="text-gray-900">{itemsSourced}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hours Volunteered</span>
              <span className="text-gray-900">{hoursVolunteered}</span>
            </div>
          </div>
        </Card>

        {/* Logout Button */}
        <Button
          onClick={() => setShowLogoutConfirm(true)}
          variant="outline"
          className="w-full border-[#A0C87B] text-[#A0C87B] hover:bg-[#F2FFB5]"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Sign Out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out? You will be redirected to the login page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowLogoutConfirm(false);
                signOut();
              }}
              className="flex-1 bg-[#A0C87B] hover:bg-[#8DB668] text-white"
            >
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}