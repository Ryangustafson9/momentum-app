
import React from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';

const MembersFilterControls = ({ 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  membershipTypeFilter, 
  setMembershipTypeFilter, 
  uniqueStatuses, 
  uniqueMembershipDisplayTypes, 
  showArchived, 
  setShowArchived, 
  allMembershipTypes 
}) => {
  
  const getMembershipTypeName = (typeId) => {
    if (typeId === 'all') return 'All Types';
    const type = allMembershipTypes.find(mt => mt.id === typeId);
    return type ? type.name : 'Unknown Type';
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    if (status === 'Archived') {
      setShowArchived(true);
    }
  };

  return (
  <div className="flex flex-col md:flex-row gap-3 mb-6">
    <div className="relative flex-grow">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
      <Input
        type="text"
        placeholder="Search by name, email, or ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 w-full bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary"
      />
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto justify-between">
          <div className="flex items-center">
            <Filter className="mr-2 h-4 w-4" /> Status: {statusFilter === 'all' ? 'All Statuses' : statusFilter}
          </div>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(uniqueStatuses || []).map(status => (
          <DropdownMenuCheckboxItem 
            key={status} 
            checked={statusFilter === status} 
            onCheckedChange={() => handleStatusChange(status)}
          >
            {status === 'all' ? 'All Statuses' : status}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto justify-between">
          <div className="flex items-center">
            <Filter className="mr-2 h-4 w-4" /> Type: {getMembershipTypeName(membershipTypeFilter)}
          </div>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(uniqueMembershipDisplayTypes || []).map(type => (
          <DropdownMenuCheckboxItem 
            key={type.id} 
            checked={membershipTypeFilter === type.id} 
            onCheckedChange={() => setMembershipTypeFilter(type.id)}
          >
            {type.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
    <Button 
      variant="outline" 
      onClick={() => {
          const newShowArchived = !showArchived;
          setShowArchived(newShowArchived);
          if (newShowArchived && statusFilter !== 'Archived') {
            // If we show archived, and current filter is not 'Archived', 
            // it might be better to switch to 'all' or 'Archived' to avoid confusion
            // For now, just toggling showArchived. User can then select status filter.
          } else if (!newShowArchived && statusFilter === 'Archived') {
            setStatusFilter('Active'); // Default back to active if hiding archived
          }
        }
      }
      className="w-full md:w-auto"
    >
      {showArchived ? 'Hide Archived' : 'Show Archived'}
    </Button>
  </div>
  );
};

export default MembersFilterControls;


