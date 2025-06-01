
import React from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import MembershipTableContent from './MembershipTableContent';

const MembershipsTableStructure = ({ columnVisibility, children }) => (
  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 mx-6 mb-6">
    <Table>
      <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
        <TableRow>
          {columnVisibility.name && <TableHead className="whitespace-nowrap text-left">Plan Name</TableHead>}
          {columnVisibility.category && <TableHead className="whitespace-nowrap text-left">Category</TableHead>}
          {columnVisibility.billing_type && <TableHead className="whitespace-nowrap text-left">Billing Type</TableHead>}
          {columnVisibility.price && <TableHead className="text-right whitespace-nowrap">Price</TableHead>}
          {columnVisibility.duration_months && <TableHead className="whitespace-nowrap text-left">Duration</TableHead>}
          {columnVisibility.features && <TableHead className="whitespace-nowrap text-left">Features</TableHead>}
          {columnVisibility.available_for_sale && <TableHead className="text-center whitespace-nowrap">For Sale</TableHead>}
          {columnVisibility.actions && <TableHead className="text-right whitespace-nowrap">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      {children}
    </Table>
  </div>
);

const MembershipTable = ({ types, columnVisibility, onEdit, onDelete, searchTerm }) => {
  return (
    <MembershipsTableStructure columnVisibility={columnVisibility}>
      <MembershipTableContent
        types={types}
        visibleColumns={columnVisibility}
        onEdit={onEdit}
        onDelete={onDelete}
        searchTerm={searchTerm}
      />
    </MembershipsTableStructure>
  );
};

export default MembershipTable;


