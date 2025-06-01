
import React from 'react';
import { motion } from 'framer-motion';
import { Users as UsersIcon } from 'lucide-react';
import MemberCard from './MemberCard.jsx';
import { Button } from '@/components/ui/button';

const MembersList = ({ members, onEdit, onDelete, onViewProfile, onAddNewMember, searchTerm }) => {
  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No members found</h3>
        {searchTerm ? (
          <>
            <p className="mt-1 text-sm text-gray-500">No members match your search criteria "{searchTerm}".</p>
            <Button onClick={() => onAddNewMember(searchTerm)} className="mt-4">
              Create New Member: {searchTerm}
            </Button>
          </>
        ) : (
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or add a new member.</p>
        )}
      </div>
    );
  }
  return (
    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((member) => (
        <MemberCard key={member.id} member={member} onEdit={onEdit} onDelete={onDelete} onViewProfile={onViewProfile} />
      ))}
    </motion.div>
  );
};

export default MembersList;


