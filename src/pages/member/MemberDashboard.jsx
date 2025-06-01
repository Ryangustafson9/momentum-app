import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays, CheckSquare, UserCircle,
  Bell, BarChart3, Sparkles, CreditCard, DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const MemberDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [memberProfile, setMemberProfile] = useState(null);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({ present: 0, total: 0 });
  const [billingInfo, setBillingInfo] = useState({ nextPaymentDate: null, amountDue: 0 });
  const [greeting, setGreeting] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'member') {
      navigate('/login');
      return;
    }

    const fetchLiveData = async () => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (profileError) throw profileError;
        setMemberProfile(profile);

        const { data: attendance, error: attendanceError } = await supabase
          .from('attendance')
          .select('*')
          .eq('member_id', user.id);
        if (attendanceError) throw attendanceError;

        const { data: classes, error: classesError } = await supabase
          .from('classes')
          .select('*');
        if (classesError) throw classesError;

        const { data: membership, error: membershipError } = await supabase
          .from('memberships')
          .select('*')
          .eq('auth_user_id', user.id)
          .single();
        if (membershipError) throw membershipError;

        const { data: membershipType, error: membershipTypeError } = await supabase
          .from('membership_types')
          .select('price')
          .eq('id', membership.current_membership_type_id)
          .single();
        if (membershipTypeError) throw membershipTypeError;

        const present = attendance.filter(a => a.status === 'Present').length;
        setAttendanceSummary({ present, total: attendance.length });

        const attendedIds = attendance.map(a => a.class_id);
        const upcoming = classes
          .filter(c => !attendedIds.includes(c.id) && new Date(c.start_time) > new Date())
          .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
          .slice(0, 3);
        setUpcomingClasses(upcoming);

        const joinDate = new Date(membership.join_date || new Date());
        const nextPayment = new Date(joinDate.setMonth(joinDate.getMonth() + 1));
        setBillingInfo({
          nextPaymentDate: nextPayment.toLocaleDateString(),
          amountDue: membershipType?.price || 0,
        });

        const hour = new Date().getHours();
        setGreeting(hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening');
      } catch (err) {
        console.error('Failed to load member dashboard:', err);
        setError(err.message || 'Unknown error occurred.');
      }
    };

    fetchLiveData();
  }, [user, navigate]);

  const attendancePercent = attendanceSummary.total
    ? (attendanceSummary.present / attendanceSummary.total) * 100
    : 0;

  const firstName = user?.name?.split(' ')[0] || 'Member';

  const StatCard = ({ title, value, icon, color, action, description }) => (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {React.cloneElement(icon, { className: `h-5 w-5 ${color}` })}
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
      {action && (
        <CardContent className="pt-0">
          <Button variant="link" size="sm" className="px-0 pt-1" onClick={action.onClick}>{action.label}</Button>
        </CardContent>
      )}
    </Card>
  );

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  if (!memberProfile) {
    return <div className="flex justify-center items-center h-screen"><Sparkles className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">Loading your dashboard...</span></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{greeting}, {firstName}!</h1>
          <p className="text-muted-foreground">Welcome to your member portal.</p>
        </div>
        <Button onClick={() => navigate('/billing')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md">
          <DollarSign className="mr-2 h-4 w-4" /> Pay My Bill
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Membership" value={memberProfile.membership_type_id} icon={<UserCircle />} color="text-blue-500" description={`Status: ${memberProfile.status}`} action={{ label: "View Details", onClick: () => navigate('/profile') }} />
        <StatCard title="Classes Attended" value={`${attendanceSummary.present} / ${attendanceSummary.total}`} icon={<CheckSquare />} color="text-green-500" description="This cycle" />
        <StatCard title="Next Payment" value={`$${billingInfo.amountDue.toFixed(2)}`} icon={<CreditCard />} color="text-amber-500" description={billingInfo.nextPaymentDate ? `Due: ${billingInfo.nextPaymentDate}` : "N/A"} action={{ label: "Billing History", onClick: () => navigate('/billing') }} />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary" /> Upcoming Classes</CardTitle>
            <CardDescription>Your next few scheduled sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingClasses.length > 0 ? (
              <ul className="space-y-3">
                {upcomingClasses.map(cls => (
                  <li key={cls.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div>
                      <p className="font-semibold text-slate-800">{cls.name}</p>
                      <p className="text-sm text-slate-500">{new Date(cls.start_time).toLocaleString()}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/my-classes#${cls.id}`)}>View</Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-3">No upcoming classes. Time to book one!</p>
                <Button onClick={() => navigate('/my-classes')} className="bg-primary hover:bg-primary/90">
                    <CalendarDays className="mr-2 h-4 w-4" /> Book a Class
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary" /> Attendance Progress</CardTitle>
            <CardDescription>Your consistency tracker.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Overall Attendance</span>
              <span className="text-lg font-bold text-primary">{attendancePercent.toFixed(1)}%</span>
            </div>
            <Progress value={attendancePercent} className="w-full h-3" indicatorClassName={
              attendancePercent > 75 ? "bg-green-500" : attendancePercent > 50 ? "bg-yellow-500" : "bg-red-500"
            } />
            <p className="text-xs text-muted-foreground text-center">
              {attendancePercent >= 80 ? "Great consistency! Keep it up!" : attendancePercent >= 50 ? "Good effort! Aim for more." : "Let's boost that attendance!"}
            </p>
            <div className="text-center pt-2">
              <Button variant="outline" onClick={() => navigate('/my-classes')}>My Attendance History</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Bell className="mr-2 h-5 w-5 text-primary" /> Notifications & Updates</CardTitle>
          <CardDescription>Latest news and alerts from the gym.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
              <span className="font-semibold">Special Offer:</span> Bring a friend this week and get 10% off your next month!
            </li>
            <li className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
              <span className="font-semibold">Maintenance Alert:</span> The sauna will be closed on May 20th for an upgrade.
            </li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MemberDashboardPage;

