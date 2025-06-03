
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, BarChart2, Users, DollarSign, CalendarCheck2, UserCog, Clock, ClipboardCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

const ReportCard = ({ title, description, icon, actionText, onAction, navigateTo }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (navigateTo) {
      navigate(navigateTo);
    } else if (onAction) {
      onAction();
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-2">
          {React.cloneElement(icon, { className: "h-8 w-8 text-primary" })}
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-end">
        <Button onClick={handleClick} className="w-full mt-auto bg-primary hover:bg-primary/90">
          {actionText || "View Report"}
        </Button>
      </CardContent>
    </Card>
  );
};


const ReportsPage = () => {
  const handleViewReport = (reportName) => {
    alert(`Viewing ${reportName} report... (Placeholder for detailed view)`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports Center</h1>
        <p className="text-muted-foreground">Access detailed reports for gym operations and performance.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ReportCard 
              title="Member Directory" 
              description="View and manage all member profiles and data."
              icon={<Users />}
              actionText="View Members"
              onAction={() => handleViewReport("Member Directory (Full list would be here)")}
            />
            <ReportCard 
              title="Attendance Logs" 
              description="Track class attendance, no-shows, and trends."
              icon={<ClipboardCheck />}
              actionText="View Attendance Data"
              onAction={() => handleViewReport("Attendance Logs (Detailed records would be here)")}
            />
            <ReportCard 
              title="Check-In History" 
              description="Detailed logs of all member check-ins over selected periods."
              icon={<CalendarCheck2 />}
              onAction={() => handleViewReport("Check-In History")}
            />
            <ReportCard 
              title="Financial Summary" 
              description="Overview of revenue, expenses, and profitability."
              icon={<DollarSign />}
              onAction={() => handleViewReport("Financial Summary")}
            />
            <ReportCard 
              title="Class Popularity" 
              description="Analyze attendance and booking rates for each class."
              icon={<BarChart2 />}
              onAction={() => handleViewReport("Class Popularity")}
            />
             <ReportCard 
              title="Peak Hours Analysis" 
              description="Identify busiest times to optimize staffing and resources."
              icon={<Clock />}
              onAction={() => handleViewReport("Peak Hours Analysis")}
            />
          </div>
        </TabsContent>

        <TabsContent value="membership">
          <Card>
            <CardHeader><CardTitle>Membership Reports</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p>Detailed membership reports will be available here, including:</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                <li>Active vs. Inactive Members</li>
                <li>Membership Type Distribution</li>
                <li>Member Retention Rates</li>
                <li>Demographics (if data collected)</li>
                <li>New Sign-ups Over Time</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="financial">
          <Card>
            <CardHeader><CardTitle>Financial Reports</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p>Comprehensive financial reports will be available here, including:</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                <li>Revenue by Membership Type</li>
                <li>Payment History & Overdue Payments</li>
                <li>Expense Tracking (if implemented)</li>
                <li>Profit and Loss Statements</li>
                <li>Sales Tax Reports</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity">
          <Card>
            <CardHeader><CardTitle>Activity & Engagement Reports</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p>Detailed activity reports will be available here, including:</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                <li>Overall Gym Attendance Trends</li>
                <li>Class-Specific Attendance Records</li>
                <li>Individual Member Attendance History</li>
                <li>No-Show Rates & Analysis</li>
                <li>Trainer Performance & Class Ratings</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default ReportsPage;


