
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Calendar, 
  Check, 
  X, 
  Filter, 
  Download, 
  Clock,
  Users,
  BarChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

// Get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// Mock data for attendance
const generateMockAttendance = () => {
  // Get members from localStorage or use empty array
  const members = JSON.parse(localStorage.getItem('gymMembers') || '[]');
  
  // Get classes from localStorage or use empty array
  const classes = JSON.parse(localStorage.getItem('gymClasses') || '[]');
  
  // Generate attendance records for the last 7 days
  const attendance = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    // For each day, generate some random attendance
    members.forEach(member => {
      // 60% chance of attendance
      if (Math.random() < 0.6) {
        attendance.push({
          id: `${dateString}-${member.id}`,
          memberId: member.id,
          memberName: member.name,
          date: dateString,
          timeIn: `${Math.floor(Math.random() * 4) + 8}:${Math.random() > 0.5 ? '30' : '00'} AM`,
          timeOut: `${Math.floor(Math.random() * 4) + 4}:${Math.random() > 0.5 ? '30' : '00'} PM`,
          classId: Math.random() < 0.5 ? classes[Math.floor(Math.random() * classes.length)]?.id : null,
          className: Math.random() < 0.5 ? classes[Math.floor(Math.random() * classes.length)]?.name : null,
        });
      }
    });
  }
  
  return attendance;
};

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [classFilter, setClassFilter] = useState('all');
  const [members, setMembers] = useState([]);
  const [classes, setClasses] = useState([]);
  const { toast } = useToast();

  // Load data from localStorage
  useEffect(() => {
    const savedAttendance = localStorage.getItem('gymAttendance');
    const savedMembers = localStorage.getItem('gymMembers');
    const savedClasses = localStorage.getItem('gymClasses');
    
    if (savedMembers) {
      setMembers(JSON.parse(savedMembers));
    }
    
    if (savedClasses) {
      setClasses(JSON.parse(savedClasses));
    }
    
    if (savedAttendance) {
      setAttendance(JSON.parse(savedAttendance));
    } else {
      const mockAttendance = generateMockAttendance();
      setAttendance(mockAttendance);
      localStorage.setItem('gymAttendance', JSON.stringify(mockAttendance));
    }
  }, []);

  // Save attendance to localStorage whenever it changes
  useEffect(() => {
    if (attendance.length > 0) {
      localStorage.setItem('gymAttendance', JSON.stringify(attendance));
    }
  }, [attendance]);

  // Filter attendance based on search, date, and class
  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = record.memberName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = record.date === selectedDate;
    const matchesClass = classFilter === 'all' || 
                        (classFilter === 'none' && !record.classId) || 
                        record.className === classFilter;
    
    return matchesSearch && matchesDate && matchesClass;
  });

  // Get unique classes for filter
  const uniqueClasses = ['all', 'none', ...new Set(attendance.filter(a => a.className).map(a => a.className))];

  // Mark attendance for a member
  const markAttendance = (memberId, isPresent) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    
    const existingRecord = attendance.find(
      a => a.memberId === memberId && a.date === selectedDate
    );
    
    if (existingRecord && !isPresent) {
      // Remove attendance record
      setAttendance(attendance.filter(a => a.id !== existingRecord.id));
      toast({
        title: "Attendance removed",
        description: `${member.name}'s attendance for ${selectedDate} has been removed.`,
      });
    } else if (!existingRecord && isPresent) {
      // Add new attendance record
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeIn = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
      
      const newRecord = {
        id: `${selectedDate}-${memberId}`,
        memberId,
        memberName: member.name,
        date: selectedDate,
        timeIn,
        timeOut: null,
        classId: null,
        className: null,
      };
      
      setAttendance([...attendance, newRecord]);
      toast({
        title: "Attendance marked",
        description: `${member.name} has been marked present for ${selectedDate}.`,
      });
    }
  };

  // Calculate attendance statistics
  const calculateStats = () => {
    const today = new Date();
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - 7);
    
    const todayStr = today.toISOString().split('T')[0];
    const lastWeekStartStr = lastWeekStart.toISOString().split('T')[0];
    
    const todayAttendance = attendance.filter(a => a.date === todayStr).length;
    const totalMembers = members.length;
    const attendanceRate = totalMembers > 0 ? Math.round((todayAttendance / totalMembers) * 100) : 0;
    
    // Get attendance by day for the last 7 days
    const attendanceByDay = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const count = attendance.filter(a => a.date === dateStr).length;
      attendanceByDay.push({
        day: dayName,
        count,
      });
    }
    
    // Reverse to show oldest to newest
    attendanceByDay.reverse();
    
    // Get attendance by class
    const attendanceByClass = [];
    classes.forEach(cls => {
      const count = attendance.filter(a => a.className === cls.name).length;
      if (count > 0) {
        attendanceByClass.push({
          name: cls.name,
          count,
        });
      }
    });
    
    // Sort by count descending
    attendanceByClass.sort((a, b) => b.count - a.count);
    
    return {
      todayAttendance,
      totalMembers,
      attendanceRate,
      attendanceByDay,
      attendanceByClass: attendanceByClass.slice(0, 5), // Top 5 classes
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Attendance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="date" className="sr-only">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-[160px]"
                />
              </div>
              
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueClasses.map((cls, index) => (
                    <SelectItem key={index} value={cls}>
                      {cls === 'all' ? 'All Classes' : cls === 'none' ? 'No Class' : cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-10 px-4 text-left font-medium">Member</th>
                    <th className="h-10 px-4 text-left font-medium">Time In</th>
                    <th className="h-10 px-4 text-left font-medium">Time Out</th>
                    <th className="h-10 px-4 text-left font-medium">Class</th>
                    <th className="h-10 px-4 text-center font-medium">Present</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => {
                    const attendanceRecord = attendance.find(
                      a => a.memberId === member.id && a.date === selectedDate
                    );
                    const isPresent = !!attendanceRecord;
                    
                    return (
                      <motion.tr
                        key={member.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <td className="p-4 align-middle font-medium">{member.name}</td>
                        <td className="p-4 align-middle">
                          {attendanceRecord?.timeIn || '-'}
                        </td>
                        <td className="p-4 align-middle">
                          {attendanceRecord?.timeOut || '-'}
                        </td>
                        <td className="p-4 align-middle">
                          {attendanceRecord?.className || '-'}
                        </td>
                        <td className="p-4 align-middle text-center">
                          <Checkbox
                            checked={isPresent}
                            onCheckedChange={(checked) => markAttendance(member.id, checked)}
                          />
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todayAttendance} / {stats.totalMembers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.attendanceRate}% of members
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Daily Attendance</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(stats.attendanceByDay.reduce((acc, day) => acc + day.count, 0) / 7)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Over the last 7 days
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Peak Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5:00 PM - 7:00 PM</div>
                <p className="text-xs text-muted-foreground">
                  Busiest time of the day
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Attendance</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.attendanceByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Classes</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={stats.attendanceByClass} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Attendance;


