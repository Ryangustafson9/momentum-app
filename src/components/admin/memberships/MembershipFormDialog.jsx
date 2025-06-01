
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';

const MembershipFormField = React.memo(({ label, id, children, className = "" }) => (
  <div className={className}>
    <Label htmlFor={id}>{label}</Label>
    {children}
  </div>
));
MembershipFormField.displayName = 'MembershipFormField';


const MembershipFormDialog = ({ isOpen, onClose, onSave, membershipData, existingCategories = [] }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const initialFormState = useMemo(() => ({
    id: '', 
    name: '', 
    category: 'Member',
    billing_type: 'Recurring',
    price: '', 
    features: '', 
    color: '#3B82F6', 
    available_for_sale: true,
    duration_months: null,
    billingCycleLength: '1', 
    billingCycleUnit: 'Months',
    signUpFee: '',
  }), []);

  const [formData, setFormData] = useState(initialFormState);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (membershipData) {
        setFormData({
          ...initialFormState,
          ...membershipData,
          features: Array.isArray(membershipData.features) ? membershipData.features.join(', ') : (membershipData.features || ''),
          price: membershipData.price ? String(membershipData.price) : '0',
          signUpFee: membershipData.signUpFee ? String(membershipData.signUpFee) : '',
          duration_months: membershipData.duration_months || null,
          category: membershipData.category || 'Member',
          billing_type: membershipData.billing_type || 'Recurring',
          billingCycleLength: (membershipData.billing_type === 'Paid in Full' && membershipData.duration_months) ? String(membershipData.duration_months) : '1',
          billingCycleUnit: (membershipData.billing_type === 'Paid in Full' && membershipData.duration_months) ? 'Months' : 'Months',
        });
        setIsNewCategory(false);
        setNewCategoryName('');
      } else {
        setFormData(initialFormState);
        setIsNewCategory(false);
        setNewCategoryName('');
      }
    }
  }, [membershipData, isOpen, initialFormState]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  }, []);
  
  const handleSelectChange = useCallback((name, value) => {
    if (name === 'category' && value === '__new__') {
      setIsNewCategory(true);
      setFormData(prev => ({ ...prev, category: '' }));
    } else {
      setIsNewCategory(false);
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleSubmitForm = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let finalCategory = formData.category;
    if (isNewCategory && newCategoryName.trim()) {
      finalCategory = newCategoryName.trim();
    } else if (isNewCategory && !newCategoryName.trim()) {
      toast({ title: "Validation Error", description: "New category name cannot be empty.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    
    if (!formData.name.trim()) {
        toast({ title: "Validation Error", description: "Membership name is required.", variant: "destructive" });
        setIsLoading(false);
        return;
    }
    if (formData.billing_type !== 'N/A' && (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0)) {
        toast({ title: "Validation Error", description: "Price must be a valid non-negative number for this billing type.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    const dataToSubmit = {
        id: formData.id || (membershipData ? membershipData.id : undefined),
        name: formData.name.trim(),
        price: formData.billing_type === 'N/A' ? 0 : (parseFloat(formData.price) || 0),
        billing_type: formData.billing_type,
        duration_months: formData.billing_type === 'Paid in Full' ? (parseInt(formData.billingCycleLength) || null) : (formData.duration_months ? parseInt(formData.duration_months) : null),
        features: Array.isArray(formData.features) ? formData.features : (formData.features || '').split(',').map(f => f.trim()).filter(f => f),
        available_for_sale: formData.available_for_sale,
        category: finalCategory,
        color: formData.color,
    };
    
    if (dataToSubmit.billing_type === 'Recurring') {
        dataToSubmit.duration_months = null;
    }

    try {
      await onSave(dataToSubmit); 
    } catch (error) {
      // Error toast is handled by the caller (MembershipsPage)
    } finally {
      setIsLoading(false);
    }
  }, [formData, isNewCategory, newCategoryName, membershipData, onSave, toast]);

  const allCategories = useMemo(() => {
    const combined = new Set(['Member', 'Staff', 'Non-Member', ...existingCategories]);
    return Array.from(combined);
  }, [existingCategories]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose(); 
    }}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{membershipData ? 'Edit Membership Plan' : 'Add New Membership Plan'}</DialogTitle>
          <DialogDescription>
            {membershipData ? 'Update the details of this membership plan.' : 'Define a new membership plan.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmitForm} className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3 py-3 max-h-[80vh] overflow-y-auto pr-2 text-sm">
          
          <h3 className="md:col-span-3 font-semibold text-base mb-1 border-b pb-1">Membership Details</h3>
          <MembershipFormField label="Membership Name *" id="mship-name">
            <Input id="mship-name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Standard Individual" required disabled={isLoading}/>
          </MembershipFormField>
          <MembershipFormField label="Category for Plan" id="mship-category">
            <Select name="category" value={isNewCategory ? '__new__' : formData.category} onValueChange={(value) => handleSelectChange('category', value)} disabled={isLoading}>
              <SelectTrigger><SelectValue placeholder="Select plan category" /></SelectTrigger>
              <SelectContent>
                {allCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                <SelectItem value="__new__">Create New Category...</SelectItem>
              </SelectContent>
            </Select>
          </MembershipFormField>
          {isNewCategory && (
            <MembershipFormField label="New Category Name" id="mship-new-category">
              <Input 
                id="mship-new-category" 
                name="newCategoryName" 
                value={newCategoryName} 
                onChange={(e) => setNewCategoryName(e.target.value)} 
                placeholder="Enter new category" 
                disabled={isLoading}
              />
            </MembershipFormField>
          )}
           <MembershipFormField label="Badge Color" id="mship-color" className={isNewCategory ? "" : "md:col-start-3"}>
            <Input id="mship-color" name="color" type="color" value={formData.color} onChange={handleInputChange} className="h-10 w-full" disabled={isLoading}/>
          </MembershipFormField>
          
          <h3 className="md:col-span-3 font-semibold text-base mt-3 mb-1 border-b pb-1">Billing Settings</h3>
          <MembershipFormField label="Billing Type" id="mship-billing_type">
            <Select name="billing_type" value={formData.billing_type} onValueChange={(value) => handleSelectChange('billing_type', value)} disabled={isLoading}>
              <SelectTrigger><SelectValue placeholder="Select billing type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Recurring">Recurring</SelectItem>
                <SelectItem value="Paid in Full">Paid in Full</SelectItem>
                <SelectItem value="N/A">N/A (e.g. Staff, Non-Member)</SelectItem>
              </SelectContent>
            </Select>
          </MembershipFormField>
          
          {formData.billing_type === 'Recurring' && (
            <>
              <MembershipFormField label="Cycle Length" id="mship-billingCycleLength">
                <Input id="mship-billingCycleLength" name="billingCycleLength" type="number" min="1" value={formData.billingCycleLength} onChange={handleInputChange} disabled={isLoading}/>
              </MembershipFormField>
              <MembershipFormField label="Cycle Unit" id="mship-billingCycleUnit">
                <Select name="billingCycleUnit" value={formData.billingCycleUnit} onValueChange={(value) => handleSelectChange('billingCycleUnit', value)} disabled={isLoading}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Days">Days</SelectItem>
                    <SelectItem value="Weeks">Weeks</SelectItem>
                    <SelectItem value="Months">Months</SelectItem>
                  </SelectContent>
                </Select>
              </MembershipFormField>
            </>
          )}
           {formData.billing_type === 'Paid in Full' && (
            <>
              <MembershipFormField label="Duration" id="mship-billingCycleLength">
                <Input id="mship-billingCycleLength" name="billingCycleLength" type="number" min="1" value={formData.billingCycleLength} onChange={handleInputChange} placeholder="e.g., 12" disabled={isLoading}/>
              </MembershipFormField>
              <MembershipFormField label="Duration Unit" id="mship-billingCycleUnit">
                 <Select name="billingCycleUnit" value={formData.billingCycleUnit} onValueChange={(value) => handleSelectChange('billingCycleUnit', value)} disabled={isLoading}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Days">Days</SelectItem>
                    <SelectItem value="Weeks">Weeks</SelectItem>
                    <SelectItem value="Months">Months</SelectItem>
                  </SelectContent>
                </Select>
              </MembershipFormField>
            </>
          )}

          {formData.billing_type !== 'N/A' && (
            <MembershipFormField label={`Membership Fee ($) ${formData.billing_type !== 'N/A' ? '*' : ''}`} id="mship-price">
              <Input id="mship-price" name="price" type="number" step="0.01" min="0" value={formData.price} onChange={handleInputChange} required={formData.billing_type !== 'N/A'} disabled={isLoading}/>
            </MembershipFormField>
          )}

          {formData.billing_type !== 'N/A' && (
            <MembershipFormField label="Enrollment Fee ($) (Optional)" id="mship-signUpFee">
              <Input id="mship-signUpFee" name="signUpFee" type="number" step="0.01" min="0" value={formData.signUpFee} onChange={handleInputChange} placeholder="e.g., 50" disabled={isLoading}/>
            </MembershipFormField>
          )}

          <h3 className="md:col-span-3 font-semibold text-base mt-3 mb-1 border-b pb-1">Restrictions & Availability</h3>
          <div className="flex items-center space-x-2 pt-2 md:col-span-1">
            <Checkbox id="mship-available_for_sale" name="available_for_sale" checked={formData.available_for_sale} onCheckedChange={(checked) => handleInputChange({ target: { name: 'available_for_sale', checked, type: 'checkbox' } })} disabled={isLoading}/>
            <Label htmlFor="mship-available_for_sale">Available for Sale</Label>
          </div>
          
          <h3 className="md:col-span-3 font-semibold text-base mt-3 mb-1 border-b pb-1">Other Information</h3>
          <MembershipFormField label="Features (comma-separated)" id="mship-features" className="md:col-span-3">
            <Textarea id="mship-features" name="features" value={formData.features} onChange={handleInputChange} placeholder="e.g., Gym Access, Group Classes" rows={2} disabled={isLoading}/>
          </MembershipFormField>
          
          <DialogFooter className="pt-4 md:col-span-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {membershipData ? 'Save Changes' : 'Add Membership'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MembershipFormDialog;


