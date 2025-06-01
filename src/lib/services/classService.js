
import { supabase } from '@/lib/supabaseClient.js';
import { generateUUID } from '@/lib/utils.js';
import { isValidUUID as checkValidUUID } from '@/lib/utils/localStorageUtils.js';


const formatClassData = (cls) => {
  if (!cls) return null;
  return {
    ...cls,
    instructor_name: cls.instructor 
      ? (cls.instructor.name || `${cls.instructor.first_name || ''} ${cls.instructor.last_name || ''}`.trim()) 
      : (cls.instructor_id ? 'Instructor N/A' : 'Unassigned'),
  };
};

const getClassSelectQuery = () => `
  id, name, description, instructor_id, start_time, end_time, max_capacity, booked_count,
  location, difficulty, recurring_rule, created_at, updated_at, created_by,
  instructor:members (id, name, first_name, last_name)
`;

export const getClasses = async (supabaseClient, isCacheValid, updateCache, getCache) => {
  if (!supabaseClient) {
    console.warn("Supabase client not available in classService.getClasses. Returning local data.");
    return JSON.parse(localStorage.getItem('classes'))?.map(formatClassData) || [];
  }
  if (isCacheValid?.('classes')) {
    const cachedData = getCache?.('classes');
    if (cachedData) return cachedData.map(formatClassData);
  }
  const { data, error } = await supabaseClient
    .from('classes')
    .select(getClassSelectQuery())
    .order('start_time', { ascending: true });

  if (error) { 
    console.error('Error fetching classes from Supabase:', error.message); 
    throw error; 
  }
  updateCache?.('classes', data);
  return data.map(formatClassData);
};

export const getClassById = async (supabaseClient, id, isValidUUID, getCache) => {
   if (!isValidUUID(id)) {
    console.error(`Invalid UUID provided for getClassById: ${id}`);
    return null;
  }
  if (!supabaseClient) {
    console.warn(`Supabase client not available in classService.getClassById for ID ${id}. Using local data.`);
    const classes = JSON.parse(localStorage.getItem('classes')) || [];
    return formatClassData(classes.find(c => c.id === id) || null);
  }

  const cachedClasses = getCache?.('classes');
  if (cachedClasses) {
      const classFromCache = cachedClasses.find(c => c.id === id);
      if (classFromCache) return formatClassData(classFromCache);
  }

  const { data, error } = await supabaseClient
    .from('classes')
    .select(getClassSelectQuery())
    .eq('id', id)
    .single();

  if (error) { 
    if (error.code === 'PGRST116') return null; 
    console.error(`Error fetching class by ID ${id} from Supabase:`, error.message); 
    throw error; 
  }
  return formatClassData(data);
};

export const addClass = async (supabaseClient, classData, invalidateCache) => {
  const newClass = {
    ...classData,
    id: generateUUID(),
    booked_count: classData.booked_count || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  delete newClass.instructor_name; 

  if (!supabaseClient) {
    console.warn("Supabase client not available in classService.addClass. Using local data.");
    const classes = JSON.parse(localStorage.getItem('classes')) || [];
    classes.push(newClass);
    localStorage.setItem('classes', JSON.stringify(classes));
    invalidateCache?.('classes');
    return formatClassData(newClass);
  }

  const { data, error } = await supabaseClient.from('classes').insert([newClass]).select(getClassSelectQuery()).single();
  if (error) { console.error('Error adding class to Supabase:', error.message); throw error; }
  
  invalidateCache?.('classes');
  return formatClassData(data);
};

export const updateClass = async (supabaseClient, id, updatedData, isValidUUID, invalidateCache) => {
  if (!isValidUUID(id)) {
    console.error(`Invalid UUID provided for updateClass: ${id}`);
    throw new Error("Invalid class ID for update.");
  }
  const dataToUpdate = { ...updatedData };
  dataToUpdate.updated_at = new Date().toISOString();
  delete dataToUpdate.instructor_name;
  delete dataToUpdate.instructor; 

  if (!supabaseClient) {
    console.warn(`Supabase client not available in classService.updateClass for ID ${id}. Using local data.`);
    let classes = JSON.parse(localStorage.getItem('classes')) || [];
    classes = classes.map(c => c.id === id ? { ...c, ...dataToUpdate } : c);
    localStorage.setItem('classes', JSON.stringify(classes));
    invalidateCache?.('classes');
    return formatClassData(classes.find(c => c.id === id));
  }

  const { data, error } = await supabaseClient.from('classes').update(dataToUpdate).eq('id', id).select(getClassSelectQuery()).single();
  if (error) { console.error('Error updating class in Supabase:', error.message); throw error; }
  
  invalidateCache?.('classes');
  return formatClassData(data);
};

export const deleteClass = async (supabaseClient, id, isValidUUID, invalidateCache) => {
  if (!isValidUUID(id)) {
    console.error(`Invalid UUID provided for deleteClass: ${id}`);
    throw new Error("Invalid class ID for deletion.");
  }
  if (!supabaseClient) {
    console.warn(`Supabase client not available in classService.deleteClass for ID ${id}. Using local data.`);
    let classes = JSON.parse(localStorage.getItem('classes')) || [];
    classes = classes.filter(c => c.id !== id);
    localStorage.setItem('classes', JSON.stringify(classes));
    invalidateCache?.('classes');
    return { success: true };
  }
  const { error } = await supabaseClient.from('classes').delete().eq('id', id);
  if (error) { console.error('Error deleting class from Supabase:', error.message); throw error; }
  
  invalidateCache?.('classes');
  return { success: true };
};


export const getUpcomingClassesForInstructor = async (supabaseClient, instructorId, isValidUUID) => {
  if (!isValidUUID(instructorId)) {
    console.error(`Invalid UUID for instructor: ${instructorId}`);
    return [];
  }
  if (!supabaseClient) {
    console.warn(`Supabase client not available in classService.getUpcomingClassesForInstructor for instructor ${instructorId}. Using local data.`);
    const allClasses = JSON.parse(localStorage.getItem('classes')) || [];
    return allClasses
      .filter(c => c.instructor_id === instructorId && new Date(c.start_time) >= new Date())
      .map(formatClassData);
  }

  const { data, error } = await supabaseClient
    .from('classes')
    .select(getClassSelectQuery())
    .eq('instructor_id', instructorId)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching upcoming classes for instructor from Supabase:', error.message);
    return [];
  }
  return data.map(formatClassData);
};


