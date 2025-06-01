
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  MoreHorizontal,
  X,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
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
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock data for trainers
const initialTrainers = [
  { 
    id: 1, 
    name: 'Emma Wilson', 
    email: 'emma.w@example.com', 
    phone: '(555) 123-4567', 
    specialization: 'Yoga', 
    experience: '5 years',
    status: 'Active',
    bio: 'Certified yoga instructor with expertise in Vinyasa and Hatha yoga. Focuses on mindfulness and proper alignment.',
    schedule: 'Monday, Wednesday, Friday',
    classes: ['Yoga Flow', 'Meditation Basics']
  },
  { 
    id: 2, 
    name: 'James Rodriguez', 
    email: 'james.r@example.com', 
    phone: '(555) 234-5678', 
    specialization: 'HIIT', 
    experience: '7 years',
    status: 'Active',
    bio: 'Former professional athlete specializing in high-intensity training and sports conditioning.',
    schedule: 'Tuesday, Thursday, Saturday',
    classes: ['HIIT Workout', 'Sports Conditioning']
  },
  { 
    id: 3, 
    name: 'Alex Chen', 
    email: 'alex.c@example.com', 
    phone: '(555) 345-6789', 
    specialization: 'Cycling', 
    experience: '4 years',
    status: 'Active',
    bio: 'Passionate about indoor cycling and endurance training. Creates energetic and challenging routines.',
    schedule: 'Monday, Wednesday, Friday',
    classes: ['Spin Class', 'Endurance Cycling']
  },
  { 
    id: 4, 
    name: 'Sophia Martinez', 
    email: 'sophia.m@example.com', 
    phone: '(555) 456-7890', 
    specialization: 'Pilates', 
    experience: '6 years',
    status: 'Active',
    bio: 'Certified Pilates instructor with additional training in rehabilitation exercises and core strengthening.',
    schedule: 'Tuesday, Thursday',
    classes: ['Pilates', 'Core Strength']
  },
  { 
    id: 5, 
    name: 'Carlos Diaz', 
    email: 'carlos.d@example.com', 
    phone: '(555) 567-8901', 
    specialization: 'Zumba', 
    experience: '3 years',
    status: 'Inactive',
    bio: 'Energetic dance instructor with background in Latin dance and choreography. Makes fitness fun!',
    schedule: 'Saturday',
    classes: ['Zumba']
  },
];

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTrainer, setCurrentTrainer] = useState(null);
  const [newTrainer, setNewTrainer] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    status: 'Active',
    bio: '',
    schedule: '',
    classes: []
  });
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const { toast } = useToast();

  // Load trainers from localStorage or use initial data
  useEffect(() => {
    const savedTrainers = localStorage.getItem('gymTrainers');
    if (savedTrainers) {
      setTrainers(JSON.parse(savedTrainers));
    } else {
      setTrainers(initialTrainers);
      localStorage.setItem('gymTrainers', JSON.stringify(initialTrainers));
    }
  }, []);

  // Save trainers to localStorage whenever they change
  useEffect(() => {
    if (trainers.length > 0) {
      localStorage.setItem('gymTrainers', JSON.stringify(trainers));
    }
  }, [trainers]);

  const filteredTrainers = trainers.filter(trainer => {
    const matchesSearch = trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         trainer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = specializationFilter === 'all' || trainer.specialization === specializationFilter;
    
    return matchesSearch && matchesSpecialization;
  });

  // Get unique specializations for filter
  const specializations = ['all', ...new Set(trainers.map(trainer => trainer.specialization))];

  const handleAddTrainer = () => {
    const id = Math.max(0, ...trainers.map(t => t.id)) + 1;
    const trainerToAdd = { ...newTrainer, id };
    
    setTrainers([...trainers, trainerToAdd]);
    setNewTrainer({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      experience: '',
      status: 'Active',
      bio: '',
      schedule: '',
      classes: []
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Trainer added",
      description: `${trainerToAdd.name} has been added to the team.`,
    });
  };

  const handleEditTrainer = () => {
    setTrainers(trainers.map(trainer => 
      trainer.id === currentTrainer.id ? currentTrainer : trainer
    ));
    setIsEditDialogOpen(false);
    
    toast({
      title: "Trainer updated",
      description: `${currentTrainer.name}'s information has been updated.`,
    });
  };

  const handleDeleteTrainer = () => {
    setTrainers(trainers.filter(trainer => trainer.id !== currentTrainer.id));
    setIsDeleteDialogOpen(false);
    
    toast({
      title: "Trainer deleted",
      description: `${currentTrainer.name} has been removed from the system.`,
      variant: "destructive",
    });
  };

  const openEditDialog = (trainer) => {
    setCurrentTrainer({ ...trainer });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (trainer) => {
    setCurrentTrainer(trainer);
    setIsDeleteDialogOpen(true);
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight">Trainers</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Trainer
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trainers..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Specialization" />
            </SelectTrigger>
            <SelectContent>
              {specializations.map((specialization, index) => (
                <SelectItem key={index} value={specialization}>
                  {specialization === 'all' ? 'All Specializations' : specialization}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          
          <Tabs value={viewMode} onValueChange={setViewMode} className="hidden sm:block">
            <TabsList>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="grid">Grid</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left font-medium">Name</th>
                  <th className="h-10 px-4 text-left font-medium">Email</th>
                  <th className="h-10 px-4 text-left font-medium">Phone</th>
                  <th className="h-10 px-4 text-left font-medium">Specialization</th>
                  <th className="h-10 px-4 text-left font-medium">Experience</th>
                  <th className="h-10 px-4 text-left font-medium">Status</th>
                  <th className="h-10 px-4 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrainers.length > 0 ? (
                  filteredTrainers.map((trainer) => (
                    <motion.tr
                      key={trainer.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{getInitials(trainer.name)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{trainer.name}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">{trainer.email}</td>
                      <td className="p-4 align-middle">{trainer.phone}</td>
                      <td className="p-4 align-middle">{trainer.specialization}</td>
                      <td className="p-4 align-middle">{trainer.experience}</td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          trainer.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {trainer.status}
                        </span>
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
                            <DropdownMenuItem onClick={() => openEditDialog(trainer)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(trainer)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="h-24 text-center">
                      No trainers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainers.length > 0 ? (
            filteredTrainers.map((trainer) => (
              <motion.div
                key={trainer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="text-lg bg-primary text-white">
                            {getInitials(trainer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold">{trainer.name}</h3>
                          <p className="text-sm text-muted-foreground">{trainer.specialization}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(trainer)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(trainer)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{trainer.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{trainer.phone}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{trainer.schedule}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">{trainer.bio}</p>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Classes</h4>
                      <div className="flex flex-wrap gap-2">
                        {trainer.classes.map((cls, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                          >
                            {cls}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              No trainers found.
            </div>
          )}
        </div>
      )}

      {/* Add Trainer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Trainer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newTrainer.name}
                  onChange={(e) => setNewTrainer({ ...newTrainer, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newTrainer.email}
                  onChange={(e) => setNewTrainer({ ...newTrainer, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newTrainer.phone}
                  onChange={(e) => setNewTrainer({ ...newTrainer, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={newTrainer.specialization}
                  onChange={(e) => setNewTrainer({ ...newTrainer, specialization: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  placeholder="e.g. 5 years"
                  value={newTrainer.experience}
                  onChange={(e) => setNewTrainer({ ...newTrainer, experience: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newTrainer.status}
                  onValueChange={(value) => setNewTrainer({ ...newTrainer, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule</Label>
              <Input
                id="schedule"
                placeholder="e.g. Monday, Wednesday, Friday"
                value={newTrainer.schedule}
                onChange={(e) => setNewTrainer({ ...newTrainer, schedule: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classes">Classes (comma separated)</Label>
              <Input
                id="classes"
                placeholder="e.g. Yoga Flow, Meditation Basics"
                value={newTrainer.classes.join(', ')}
                onChange={(e) => setNewTrainer({ 
                  ...newTrainer, 
                  classes: e.target.value.split(',').map(cls => cls.trim()).filter(cls => cls) 
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={newTrainer.bio}
                onChange={(e) => setNewTrainer({ ...newTrainer, bio: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTrainer}>Add Trainer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Trainer Dialog */}
      {currentTrainer && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Trainer</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={currentTrainer.name}
                    onChange={(e) => setCurrentTrainer({ ...currentTrainer, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={currentTrainer.email}
                    onChange={(e) => setCurrentTrainer({ ...currentTrainer, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={currentTrainer.phone}
                    onChange={(e) => setCurrentTrainer({ ...currentTrainer, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-specialization">Specialization</Label>
                  <Input
                    id="edit-specialization"
                    value={currentTrainer.specialization}
                    onChange={(e) => setCurrentTrainer({ ...currentTrainer, specialization: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-experience">Experience</Label>
                  <Input
                    id="edit-experience"
                    value={currentTrainer.experience}
                    onChange={(e) => setCurrentTrainer({ ...currentTrainer, experience: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={currentTrainer.status}
                    onValueChange={(value) => setCurrentTrainer({ ...currentTrainer, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-schedule">Schedule</Label>
                <Input
                  id="edit-schedule"
                  value={currentTrainer.schedule}
                  onChange={(e) => setCurrentTrainer({ ...currentTrainer, schedule: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-classes">Classes (comma separated)</Label>
                <Input
                  id="edit-classes"
                  value={currentTrainer.classes.join(', ')}
                  onChange={(e) => setCurrentTrainer({ 
                    ...currentTrainer, 
                    classes: e.target.value.split(',').map(cls => cls.trim()).filter(cls => cls) 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bio">Bio</Label>
                <Input
                  id="edit-bio"
                  value={currentTrainer.bio}
                  onChange={(e) => setCurrentTrainer({ ...currentTrainer, bio: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditTrainer}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {currentTrainer && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete {currentTrainer.name}? This action cannot be undone.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteTrainer}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Trainers;


