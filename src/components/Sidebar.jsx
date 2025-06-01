import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  ClipboardCheck, 
  UserCog, 
  Settings, 
  LogOut, 
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/members', label: 'Members', icon: Users },
  { path: '/classes', label: 'Classes', icon: Calendar },
  { path: '/attendance', label: 'Attendance', icon: ClipboardCheck },
  { path: '/trainers', label: 'Trainers', icon: UserCog },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ onLogout, mobile = false, closeSidebar }) => {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-bold">FT</span>
          </div>
          <h1 className="ml-2 text-xl font-bold text-gray-900">FitTrack</h1>
        </motion.div>
        {mobile && (
          <Button variant="ghost" size="icon" onClick={closeSidebar}>
            <X className="h-6 w-6" />
          </Button>
        )}
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`${
                router.pathname === item.path
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200`}
            >
              <item.icon
                className={`${
                  router.pathname === item.path ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                } mr-3 h-5 w-5 flex-shrink-0`}
              />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          onClick={onLogout}
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400" />
          Log out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;


