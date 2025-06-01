
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Shield, Edit3, Save, CreditCard, CalendarCheck, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast.js';
import { useNavigate } from 'react-router-dom';

const MemberProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [memberData, setMemberData] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser || loggedInUser.role !== 'member') {
      navigate('/login');
      return;
    }

    const members = JSON.parse(localStorage.getItem('members')) || [];
    const currentMemberDetails = members.find(m => m.id === loggedInUser.id);
    
    if (currentMemberDetails) {
      setMemberData(currentMemberDetails);
      setProfileForm({
        name: currentMemberDetails.name,
        email: currentMemberDetails.email,
        phone: currentMemberDetails.phone || '',
      });
    } else {
      toast({ title: "Error", description: "Could not load member details.", variant: "destructive" });
      navigate('/');
    }
  }, [navigate, toast]);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = () => {
    let members = JSON.parse(localStorage.getItem('members')) || [];
    members = members.map(m => 
      m.id === memberData.id ? { ...m, ...profileForm } : m
    );
    localStorage.setItem('members', JSON.stringify(members));
    setMemberData(prev => ({...prev, ...profileForm}));
    setIsEditingProfile(false);
    toast({ title: "Profile Updated", description: "Your personal information has been saved." });
  };
  
  const handleSavePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Password Mismatch", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
        toast({ title: "Weak Password", description: "New password should be at least 6 characters.", variant: "destructive" });
        return;
    }
    // In a real app, you'd verify currentPassword and then update.
    setIsEditingPassword(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    toast({ title: "Password Updated", description: "Your password has been changed successfully." });
  };

  if (!memberData) {
    return <div className="text-center p-10">Loading profile...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-3xl mx-auto"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information, membership, and security settings.</p>
      </div>

      {/* Personal Information Card */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="flex items-center"><User className="mr-2 h-5 w-5 text-primary" /> Personal Information</CardTitle>
            <CardDescription>View and update your contact details.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(!isEditingProfile)}>
            <Edit3 className="mr-1 h-4 w-4" /> {isEditingProfile ? 'Cancel' : 'Edit'}
          </Button>
        </CardHeader>
        <CardContent>
          {!isEditingProfile ? (
            <div className="space-y-3 text-sm">
              <p><strong>Name:</strong> {memberData.name}</p>
              <p><strong>Email:</strong> {memberData.email}</p>
              <p><strong>Phone:</strong> {memberData.phone || 'Not provided'}</p>
            </div>
          ) : (
            <form className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={profileForm.name} onChange={handleProfileChange} />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" value={profileForm.email} onChange={handleProfileChange} />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" value={profileForm.phone} onChange={handleProfileChange} />
              </div>
            </form>
          )}
        </CardContent>
        {isEditingProfile && (
          <CardFooter>
            <Button onClick={handleSaveProfile} className="ml-auto"><Save className="mr-2 h-4 w-4" /> Save Profile</Button>
          </CardFooter>
        )}
      </Card>

      {/* Membership Details Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><CalendarCheck className="mr-2 h-5 w-5 text-primary" /> Membership Details</CardTitle>
          <CardDescription>Your current plan and status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
            <p><strong>Membership Type:</strong> <span className="font-semibold text-primary">{memberData.membershipType}</span></p>
            <p><strong>Status:</strong> <span className={`font-semibold ${memberData.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{memberData.status}</span></p>
            <p><strong>Join Date:</strong> {new Date(memberData.joinDate).toLocaleDateString()}</p>
            {memberData.membershipType !== 'Staff' && memberData.status === 'Active' && (
                 <p className="text-xs text-muted-foreground pt-2 border-t">Next renewal: approx. {new Date(new Date(memberData.joinDate).setMonth(new Date(memberData.joinDate).getMonth() + 1)).toLocaleDateString()}</p>
            )}
        </CardContent>
        <CardFooter>
             <Button variant="outline" className="ml-auto">Manage Subscription</Button>
        </CardFooter>
      </Card>
      
      {/* Security Settings Card */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="flex items-center"><Shield className="mr-2 h-5 w-5 text-primary" /> Security Settings</CardTitle>
            <CardDescription>Change your password.</CardDescription>
          </div>
           <Button variant="outline" size="sm" onClick={() => setIsEditingPassword(!isEditingPassword)}>
            <Edit3 className="mr-1 h-4 w-4" /> {isEditingPassword ? 'Cancel' : 'Change Password'}
          </Button>
        </CardHeader>
        {isEditingPassword && (
          <>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={handlePasswordChange} />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" name="newPassword" type="password" value={passwordForm.newPassword} onChange={handlePasswordChange} />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={handlePasswordChange} />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePassword} className="ml-auto"><Save className="mr-2 h-4 w-4" /> Save Password</Button>
            </CardFooter>
          </>
        )}
      </Card>

      {/* Billing Information (Placeholder) */}
      <Card className="shadow-lg opacity-70">
        <CardHeader>
          <CardTitle className="flex items-center"><CreditCard className="mr-2 h-5 w-5 text-gray-400" /> Billing Information</CardTitle>
          <CardDescription>Manage your payment methods (Feature coming soon).</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">This section will allow you to update payment details and view billing history.</p>
        </CardContent>
      </Card>
      
      {memberData.status !== 'Active' && (
         <Card className="shadow-lg border-yellow-400 bg-yellow-50">
            <CardHeader>
                <CardTitle className="flex items-center text-yellow-700"><AlertTriangle className="mr-2 h-5 w-5"/> Account Status Alert</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-yellow-600">Your account status is currently <span className="font-bold">{memberData.status}</span>. Please contact support if you believe this is an error or to reactivate your account.</p>
            </CardContent>
        </Card>
      )}

    </motion.div>
  );
};

export default MemberProfilePage;


