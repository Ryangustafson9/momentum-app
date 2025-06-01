
import React from 'react';
import { 
  Home, Users, Calendar, BarChart2, Settings, UserCheck, Zap, UserCog, Briefcase
} from 'lucide-react';

export const navLinks = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/check-in", label: "Check-in", icon: UserCheck },
  { to: "/members", label: "Members", icon: Users },
  { to: "/memberships", label: "Membership Plans", icon: Briefcase },
  { to: "/classes", label: "Classes", icon: Calendar },
  { to: "/schedule", label: "Schedule", icon: Zap },
  { to: "/reports", label: "Reports", icon: BarChart2 },
  { to: "/trainers", label: "Trainers", icon: UserCog },
];


