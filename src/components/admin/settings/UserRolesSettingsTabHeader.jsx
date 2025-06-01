
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, ShieldCheck } from 'lucide-react';

const UserRolesSettingsTabHeader = ({ onAddRole }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 dark:border-slate-700 mb-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 flex items-center">
          <ShieldCheck className="w-6 h-6 mr-3 text-primary" />
          User Roles & Permissions
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Define staff roles and manage their access permissions across the system.
        </p>
      </div>
      <Button onClick={onAddRole} variant="action" className="mt-4 sm:mt-0">
        <PlusCircle className="mr-2 h-4 w-4" /> Add New Role
      </Button>
    </div>
  );
};

export default UserRolesSettingsTabHeader;


