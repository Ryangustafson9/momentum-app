
import React from 'react';
import RoleCard from './RoleCard';

const UserRolesList = ({ roles, allPermissionsList, onEditRole, onDeleteRole, isSubmitting }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {roles.map(role => (
        <RoleCard 
          key={role.id}
          role={role}
          allPermissionsList={allPermissionsList}
          onEditRole={onEditRole}
          onDeleteRole={onDeleteRole}
          isSubmitting={isSubmitting}
        />
      ))}
    </div>
  );
};

export default UserRolesList;


