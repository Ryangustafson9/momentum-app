
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  Calendar as CalendarIcon, 
  Clock, 
  Users,
  MoreHorizontal,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import EmptyState from '@/components/EmptyState.jsx';

const initialClasses = [
  { 
    id: 1, 
    name: 'Yoga Flow', 
    instructor: 'Emma Wilson', 
    schedule: 'Monday, Wednesday, Friday', 
    time: '08:00 - 09:00', 
    capacity: 20,
    enrolled: 15,
    location: 'Studio A',
    description: 'A gentle flow yoga class suitable for all levels.'
  },
  { 
    id: 2, 
    name: 'HIIT Workout', 
    instructor: 'James Rodriguez', 
    schedule: 'Tuesday, Thursday', 
    time: '18:00 - 19:00', 
    capacity: 15,
    enrolled: 12,
    location: 'Main Floor',
    description: 'High-intensity interval training to boost metabolism and burn calories.'
  },
  { 
    id: 3, 
    name: 'Spin Class', 
    instructor: 'Alex Chen', 
    schedule: 'Monday, Wednesday, Friday', 
    time: '17:30 - 18:30', 
    capacity: 12,
    enrolled: 10,
    location: 'Spin Room',
    description: 'Indoor cycling class with energetic music and varying intensity.'
  },
];

const ClassFormDialog = ({ isOpen, onOpenChange, classData, onSubmit, title, submitButtonText }) => {
  const [formData, setFormData] = useState({
    name: '',
    instructor: '',
    schedule: '',
    time: '',
    capacity: 15,
    enrolled: 0,
    location: '',
    description: ''
  });

  useEffect(() => {
    if (classData) {
      setFormData(classData);
    } else {
      setFormData({
        name: '', instructor: '', schedule: '', time: '', capacity: 15, enrolled: 0, location: '', description: ''
      });
    }
  }, [classData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Class Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor</Label>
                <Input id="instructor" name="instructor" value={formData.instructor} onChange={handleChange} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule (Days)</Label>
                <Input id="schedule" name="schedule" placeholder="e.g. Monday, Wednesday" value={formData.schedule} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" name="time" placeholder="e.g. 09:00 - 10:00" value={formData.time} onChange={handleChange} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" value={formData.location} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" name="capacity" type="number" value={formData.capacity} onChange={handleChange} />
              </div>
            </div>
            {classData && (
                 <div className="space-y-2">
                    <Label htmlFor="enrolled">Current Enrollment</Label>
                    <Input id="enrolled" name="enrolled" type="number" value={formData.enrolled} onChange={handleChange} />
                </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" value={formData.description} onChange={handleChange} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{submitButtonText}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


const ClassListItem = ({ cls, onEdit, onDelete }) => (
  <motion.tr
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="border-b transition-colors hover:bg-muted/50"
  >
    <td className="p-4 align-middle font-medium">{cls.name}</td>
    <td className="p-4 align-middle">{cls.instructor}</td>
    <td className="p-4 align-middle">{cls.schedule}</td>
    <td className="p-4 align-middle">{cls.time}</td>
    <td className="p-4 align-middle">{cls.location}</td>
    <td className="p-4 align-middle">
      <div className="flex items-center">
        <span className="mr-2">{cls.enrolled}/{cls.capacity}</span>
        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary" 
            style={{ width: `${(cls.enrolled / cls.capacity) * 100}%` }}
          ></div>
        </div>
      </div>
    </td>
    <td className="p-4 align-middle text-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(cls)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(cls)} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  </motion.tr>
);

const ClassCalendarCard = ({ cls, onEdit, onDelete }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-3 rounded-md border bg-card hover:bg-muted/50 transition-colors"
  >
    <div className="flex justify-between items-start">
      <h3 className="font-medium">{cls.name}</h3>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(cls)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(cls)} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div className="text-sm text-muted-foreground mt-1 space-y-1">
      <div className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1.5" /><span>{cls.time}</span></div>
      <div className="flex items-center"><Users className="h-3.5 w-3.5 mr-1.5" /><span>{cls.enrolled}/{cls.capacity}</span></div>
      <div className="flex items-center text-primary"><span>{cls.instructor}</span></div>
    </div>
  </motion.div>
);


const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  const [instructorFilter, setInstructorFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    const savedClasses = localStorage.getItem('gymClasses_v2_refactored');
    if (savedClasses) {
      setClasses(JSON.parse(savedClasses));
    } else {
      setClasses(initialClasses);
      localStorage.setItem('gymClasses_v2_refactored', JSON.stringify(initialClasses));
    }
  }, []);

  useEffect(() => {
    if (classes.length > 0) {
      localStorage.setItem('gymClasses_v2_refactored', JSON.stringify(classes));
    }
  }, [classes]);

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         cls.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesInstructor = instructorFilter === 'all' || cls.instructor === instructorFilter;
    return matchesSearch && matchesInstructor;
  });

  const instructors = ['all', ...new Set(classes.map(cls => cls.instructor))];

  const handleAddClass = (newClassData) => {
    const id = Math.max(0, ...classes.map(c => c.id)) + 1;
    const classToAdd = { ...newClassData, id, enrolled: 0 }; // Ensure enrolled is set for new classes
    setClasses([...classes, classToAdd]);
    setIsAddDialogOpen(false);
    toast({ title: "Class added", description: `${classToAdd.name} has been added.` });
  };

  const handleEditClass = (updatedClassData) => {
    setClasses(classes.map(cls => cls.id === updatedClassData.id ? updatedClassData : cls));
    setIsEditDialogOpen(false);
    toast({ title: "Class updated", description: `${updatedClassData.name} has been updated.` });
  };

  const handleDeleteClass = () => {
    if (!currentClass) return;
    setClasses(classes.filter(cls => cls.id !== currentClass.id));
    setIsDeleteDialogOpen(false);
    toast({ title: "Class deleted", description: `${currentClass.name} has been removed.`, variant: "destructive" });
    setCurrentClass(null);
  };

  const openEditDialog = (cls) => {
    setCurrentClass({ ...cls });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (cls) => {
    setCurrentClass(cls);
    setIsDeleteDialogOpen(true);
  };

  const classesByDay = {
    Monday: classes.filter(cls => cls.schedule.includes('Monday')),
    Tuesday: classes.filter(cls => cls.schedule.includes('Tuesday')),
    Wednesday: classes.filter(cls => cls.schedule.includes('Wednesday')),
    Thursday: classes.filter(cls => cls.schedule.includes('Thursday')),
    Friday: classes.filter(cls => cls.schedule.includes('Friday')),
    Saturday: classes.filter(cls => cls.schedule.includes('Saturday')),
    Sunday: classes.filter(cls => cls.schedule.includes('Sunday')),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Class
        </Button>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search classes..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Select value={instructorFilter} onValueChange={setInstructorFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Instructor" /></SelectTrigger>
                <SelectContent>
                  {instructors.map((instructor, index) => (
                    <SelectItem key={index} value={instructor}>{instructor === 'all' ? 'All Instructors' : instructor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
            </div>
          </div>

          {filteredClasses.length > 0 ? (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left font-medium">Class Name</th>
                      <th className="h-10 px-4 text-left font-medium">Instructor</th>
                      <th className="h-10 px-4 text-left font-medium">Schedule</th>
                      <th className="h-10 px-4 text-left font-medium">Time</th>
                      <th className="h-10 px-4 text-left font-medium">Location</th>
                      <th className="h-10 px-4 text-left font-medium">Capacity</th>
                      <th className="h-10 px-4 text-center font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClasses.map((cls) => (
                      <ClassListItem key={cls.id} cls={cls} onEdit={openEditDialog} onDelete={openDeleteDialog} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState 
                icon={() => <Search className="w-12 h-12 text-gray-400 mb-4" />}
                title="No Classes Found"
                description={searchTerm ? "No classes match your current search or filter." : "There are no classes scheduled yet. Add one to get started!"}
                actionText={!searchTerm ? "Add New Class" : undefined}
                onActionClick={!searchTerm ? () => setIsAddDialogOpen(true) : undefined}
            />
          )}
        </TabsContent>
        
        <TabsContent value="calendar" className="space-y-6">
            {Object.values(classesByDay).every(dayClasses => dayClasses.length === 0) ? (
                 <EmptyState 
                    icon={() => <CalendarIcon className="w-12 h-12 text-gray-400 mb-4" />}
                    title="No Classes Scheduled"
                    description="The calendar is empty. Add some classes to see them here."
                    actionText="Add New Class"
                    onActionClick={() => setIsAddDialogOpen(true)}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Object.entries(classesByDay).map(([day, dayClasses]) => (
                    <Card key={day} className={dayClasses.length > 0 ? "" : "opacity-70"}>
                        <CardHeader className="bg-muted/30"><CardTitle className="text-lg">{day}</CardTitle></CardHeader>
                        <CardContent className="p-4">
                        {dayClasses.length > 0 ? (
                            <div className="space-y-3">
                            {dayClasses.map((cls) => (
                                <ClassCalendarCard key={cls.id} cls={cls} onEdit={openEditDialog} onDelete={openDeleteDialog} />
                            ))}
                            </div>
                        ) : (
                            <div className="h-24 flex items-center justify-center text-muted-foreground">No classes scheduled</div>
                        )}
                        </CardContent>
                    </Card>
                    ))}
                </div>
            )}
        </TabsContent>
      </Tabs>

      <ClassFormDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddClass}
        title="Add New Class"
        submitButtonText="Add Class"
      />

      {currentClass && (
        <ClassFormDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          classData={currentClass}
          onSubmit={handleEditClass}
          title="Edit Class"
          submitButtonText="Save Changes"
        />
      )}

      {currentClass && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>Confirm Deletion</DialogTitle></DialogHeader>
            <div className="py-4"><p>Are you sure you want to delete the {currentClass.name} class?</p></div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}><X className="mr-2 h-4 w-4" />Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteClass}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Classes;


