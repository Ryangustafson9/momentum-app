import React from 'react';
import { Users, CalendarDays, CheckCircle, AlertTriangle, Clock, MessageSquare, BellDot, Activity, BarChart2 } from 'lucide-react';

export const ALL_AVAILABLE_CARDS_CONFIG = [
	{
		id: 'totalMembers',
		title: 'Total Members',
		dataType: 'stat',
		dataKey: 'totalMembers',
		trendKey: 'totalMembersTrend',
		defaultVisible: true,
		description: 'All registered members',
	},
	{
		id: 'activeClasses',
		title: 'Active Classes',
		dataType: 'stat',
		dataKey: 'activeClasses',
		trendKey: 'upcomingClassesTrend',
		defaultVisible: true,
		description: 'Currently scheduled classes',
	},
	{
		id: 'checkInsToday',
		title: 'Check-ins Today',
		dataType: 'stat',
		dataKey: 'checkInsToday',
		defaultVisible: true,
		description: 'Members checked in today',
	},
	{
		id: 'recentActivity',
		title: 'Recent Activity',
		dataType: 'widget',
		defaultVisible: true,
	},
	{
		id: 'quickStats',
		title: 'Quick Stats',
		dataType: 'widget',
		defaultVisible: true,
	},
];


