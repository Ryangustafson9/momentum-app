
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import RoleForm from './RoleForm';

const RoleFormDialog = ({ isOpen, setIsOpen, editingRole, setEditingRole, onSave, allPermissions, isSubmitting }) => {
  const handleOpenChange = (openState) => {
    if (!isSubmitting) {
      setIsOpen(openState);
      if (!openState) {
        setEditingRole(null);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white dark:bg-slate-850 border-slate-300 dark:border-slate-700 shadow-2xl rounded-lg">
        <DialogHeader className="pb-3 border-b border-slate-200 dark:border-slate-700">
          <DialogTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            {editingRole ? 'Edit Staff Plan' : 'Create New Staff Plan'}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            {editingRole ? `Modify details for the "${editingRole.name}" plan.` : 'Define a new staff plan and set its permissions.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
          <RoleForm 
            role={editingRole} 
            onSave={onSave} 
            onCancel={() => {
              if (!isSubmitting) {
                setIsOpen(false);
                setEditingRole(null);
              }
            }} 
            allPermissions={allPermissions}
            isLoading={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleFormDialog;


