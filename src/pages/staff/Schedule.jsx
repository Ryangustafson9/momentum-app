
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, PlusCircle, Users, Edit2, Trash2, Filter, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast.js';
import { Calendar } from '@/components/ui/calendar.jsx';
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const initialScheduleEvents = [
  { id: 1, title: 'Morning Yoga', start: new Date(2025, 4, 19, 7, 0), end: new Date(2025, 4, 19, 8, 0), trainer: 'Alice', classId: 1, color: 'bg-blue-500' },
  { id: 2, title: 'HIIT Blast', start: new Date(2025, 4, 20, 9, 0), end: new Date(2025, 4, 20, 9, 45), trainer: 'Bob', classId: 2, color: 'bg-green-500' },
  { id: 3, title: 'Strength Training', start: new Date(2025, 4, 19, 18, 0), end: new Date(2025, 4, 19, 19, 15), trainer: 'Carol', classId: 3, color: 'bg-red-500' },
  { id: 4, title: 'Zumba Dance', start: new Date(2025, 4, 24, 11, 0), end: new Date(2025, 4, 24, 12, 0), trainer: 'Diana', classId: 4, color: 'bg-purple-500' },
  { id: 5, title: 'Spin Class', start: new Date(2025, 4, 21, 17, 30), end: new Date(2025, 4, 21, 18, 30), trainer: 'Edward', classId: 5, color: 'bg-yellow-500' },
];


const SchedulePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); 
  const [events, setEvents] = useState([]);
  const [weekDates, setWeekDates] = useState([]);
  const calendarContainerRef = useRef(null);

  useEffect(() => {
    const storedEvents = JSON.parse(localStorage.getItem('scheduleEvents'));
    setEvents(storedEvents || initialScheduleEvents.map(event => ({...event, start: new Date(event.start), end: new Date(event.end) })));
  }, []);
  
  useEffect(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
    const end = addDays(start, 6);
    setWeekDates(eachDayOfInterval({ start, end }));
  }, [selectedDate]);

  const getEventsForDate = (date) => {
    return events.filter(event => isSameDay(event.start, date))
                 .sort((a,b) => a.start.getTime() - b.start.getTime());
  };
  
  const TimeSlot = ({ time }) => (
    <div className="h-16 border-b border-r border-gray-200 flex items-center justify-center text-xs text-gray-500 sticky left-0 bg-white z-10">
      {time}
    </div>
  );

  const EventCard = ({ event, dayIndex }) => {
    const startHour = event.start.getHours();
    const startMinute = event.start.getMinutes();
    const endHour = event.end.getHours();
    const endMinute = event.end.getMinutes();

    const topPosition = ((startHour - 6) * 4 + (startMinute / 15)) * 1 + 'rem'; // 1rem per 15 min slot, 4 slots per hour
    const height = (((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / 15) * 1 + 'rem';
    
    return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute p-2 rounded-md text-white text-xs shadow-md ${event.color} cursor-pointer hover:opacity-90 overflow-hidden`}
      style={{ 
        top: topPosition,
        height: height,
        left: `${(dayIndex + 1) * (100/8)}%`, // Position within the day column
        width: `${(100/8) - 1}%`, // Width of the event card, with a small gap
        zIndex: 20,
      }}
      onClick={() => toast({ title: event.title, description: `With ${event.trainer} at ${format(event.start, 'p')}`})}
    >
      <p className="font-semibold truncate">{event.title}</p>
      <p className="text-xxs">{format(event.start, 'p')} - {format(event.end, 'p')}</p>
      <p className="text-xxs truncate">Trainer: {event.trainer}</p>
    </motion.div>
  )};

  const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM (22:00)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 h-full flex flex-col"
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Class Schedule</h1>
          <p className="text-muted-foreground">View, manage, and create class schedules.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => navigate('/trainers')}><UserCog className="mr-2 h-4 w-4" /> Manage Trainers</Button>
          <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
          <Button className="bg-primary hover:bg-primary/90">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Event
          </Button>
        </div>
      </div>

      <Card className="shadow-xl flex-grow flex flex-col">
        <CardHeader className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <CardTitle>{format(selectedDate, 'MMMM yyyy')}</CardTitle>
            <CardDescription>Use the calendar to navigate or select a view mode.</CardDescription>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <Button variant={viewMode === 'day' ? 'default' : 'outline'} onClick={() => setViewMode('day')}>Day</Button>
            <Button variant={viewMode === 'week' ? 'default' : 'outline'} onClick={() => setViewMode('week')}>Week</Button>
            <Button variant={viewMode === 'month' ? 'default' : 'outline'} onClick={() => setViewMode('month')}>Month</Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col lg:flex-row gap-4 flex-grow">
          <div className="lg:w-1/4 xl:w-1/5">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border shadow-sm w-full"
            />
          </div>
          <div className="lg:w-3/4 xl:w-4/5 overflow-auto flex-grow" ref={calendarContainerRef}>
            {viewMode === 'week' && (
              <div className="relative min-w-[1000px] h-[calc(17*4rem)]"> {/* 17 hours * 4rem per hour */}
                {/* Day Headers */}
                <div className="grid grid-cols-8 sticky top-0 bg-white z-20">
                    <div className="font-semibold text-sm p-2 border-b border-gray-300 sticky left-0 bg-white z-10">Time</div>
                    {weekDates.map(date => (
                    <div key={`header-${date.toString()}`} className="font-semibold text-sm p-2 border-b border-l border-gray-300 text-center">
                        {format(date, 'EEE dd')}
                    </div>
                    ))}
                </div>
                {/* Time Slots Grid & Event Rendering Area */}
                <div className="grid grid-cols-8">
                    {/* Time Column */}
                    <div className="col-span-1">
                        {hours.map(hour => (
                            <React.Fragment key={`timeslot-col-${hour}`}>
                                <TimeSlot time={`${hour % 12 === 0 ? 12 : hour % 12} ${hour < 12 || hour === 24 ? 'AM' : 'PM'}`} />
                                <div className="h-16 border-b border-r border-gray-200 sticky left-0 bg-white z-10"></div> {/* For :15 */}
                                <div className="h-16 border-b border-r border-gray-200 sticky left-0 bg-white z-10"></div> {/* For :30 */}
                                <div className="h-16 border-b border-r border-gray-200 sticky left-0 bg-white z-10"></div> {/* For :45 */}
                            </React.Fragment>
                        ))}
                    </div>
                    {/* Day Columns for events */}
                    {weekDates.map((date, dayIndex) => (
                        <div key={`day-col-${date.toString()}`} className="col-span-1 border-l border-gray-200 relative">
                             {hours.map(hour => (
                                <React.Fragment key={`day-${dayIndex}-hour-${hour}`}>
                                    <div className="h-16 border-b border-gray-200"></div>
                                    <div className="h-16 border-b border-gray-200"></div>
                                    <div className="h-16 border-b border-gray-200"></div>
                                    <div className="h-16 border-b border-gray-200"></div>
                                </React.Fragment>
                            ))}
                            {getEventsForDate(date).map(event => (
                                <EventCard key={event.id} event={event} dayIndex={dayIndex} />
                            ))}
                        </div>
                    ))}
                </div>
              </div>
            )}
            {viewMode === 'day' && (
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-center mb-2">{format(selectedDate, 'EEEE, MMMM do')}</h3>
                {getEventsForDate(selectedDate).length > 0 ? getEventsForDate(selectedDate).map(event => (
                  <Card key={event.id} className={`${event.color} text-white p-3`}>
                    <CardTitle className="text-base">{event.title}</CardTitle>
                    <CardDescription className="text-white/80 text-xs">
                      {format(event.start, 'p')} - {format(event.end, 'p')} with {event.trainer}
                    </CardDescription>
                  </Card>
                )) : <p className="text-muted-foreground text-center py-4">No events scheduled for this day.</p>}
              </div>
            )}
            {viewMode === 'month' && (
              <p className="text-muted-foreground text-center py-4">Month view is not yet implemented. Please use Day or Week view.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SchedulePage;


