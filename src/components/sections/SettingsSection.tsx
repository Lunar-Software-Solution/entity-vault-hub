import { useState, useMemo } from "react";
import { useTaxIdTypes, useIssuingAuthorities, type TaxIdType, type IssuingAuthority } from "@/hooks/usePortalData";
import { 
  useCreateTaxIdType, useUpdateTaxIdType, useDeleteTaxIdType,
  useCreateIssuingAuthority, useUpdateIssuingAuthority, useDeleteIssuingAuthority 
} from "@/hooks/usePortalMutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { Plus, Edit, Trash2, FileText, Building2, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { countries } from "@/lib/countries";
import { usStates, canadaProvinces } from "@/lib/states";

// Tax ID Type Form
interface TaxIdTypeFormData {
  code: string;
  label: string;
  description?: string;
}

const TaxIdTypeForm = ({ 
  item, 
  onSubmit, 
  onCancel, 
  isLoading 
}: { 
  item?: TaxIdType | null; 
  onSubmit: (data: TaxIdTypeFormData) => void; 
  onCancel: () => void; 
  isLoading?: boolean;
}) => {
  const form = useForm<TaxIdTypeFormData>({
    defaultValues: {
      code: item?.code ?? "",
      label: item?.label ?? "",
      description: item?.description ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="code" render={({ field }) => (
          <FormItem>
            <FormLabel>Code *</FormLabel>
            <FormControl><Input placeholder="e.g., EIN, VAT" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="label" render={({ field }) => (
          <FormItem>
            <FormLabel>Label *</FormLabel>
            <FormControl><Input placeholder="e.g., Employer Identification Number" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl><Textarea placeholder="Optional description..." rows={2} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : item ? "Update" : "Add Type"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

// Issuing Authority Form
interface IssuingAuthorityFormData {
  name: string;
  country: string;
  province_state?: string;
  description?: string;
}

const IssuingAuthorityForm = ({ 
  item, 
  onSubmit, 
  onCancel, 
  isLoading 
}: { 
  item?: IssuingAuthority | null; 
  onSubmit: (data: IssuingAuthorityFormData) => void; 
  onCancel: () => void; 
  isLoading?: boolean;
}) => {
  const form = useForm<IssuingAuthorityFormData>({
    defaultValues: {
      name: item?.name ?? "",
      country: item?.country ?? "",
      province_state: (item as any)?.province_state ?? "",
      description: item?.description ?? "",
    },
  });

  const selectedCountry = form.watch("country");
  
  // Clear province_state when country changes to one without dropdown options
  const handleCountryChange = (value: string) => {
    form.setValue("country", value);
    if (value !== "United States" && value !== "Canada") {
      // Keep the value as-is for free text entry
    }
  };

  const getProvinceStateOptions = () => {
    if (selectedCountry === "United States") return usStates;
    if (selectedCountry === "Canada") return canadaProvinces;
    return null;
  };

  const provinceStateOptions = getProvinceStateOptions();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name *</FormLabel>
            <FormControl><Input placeholder="e.g., IRS, HMRC" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="country" render={({ field }) => (
          <FormItem>
            <FormLabel>Country *</FormLabel>
            <Select onValueChange={handleCountryChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-background max-h-[300px]">
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="province_state" render={({ field }) => (
          <FormItem>
            <FormLabel>
              {selectedCountry === "Canada" ? "Province" : selectedCountry === "United States" ? "State" : "Province / State"}
            </FormLabel>
            {provinceStateOptions ? (
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder={`Select a ${selectedCountry === "Canada" ? "province" : "state"}`} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background max-h-[300px]">
                  <SelectItem value="__none__">None</SelectItem>
                  {provinceStateOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <FormControl>
                <Input placeholder="e.g., Bavaria, New South Wales" {...field} />
              </FormControl>
            )}
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl><Textarea placeholder="Full name or description..." rows={2} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : item ? "Update" : "Add Authority"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

type SortKey = "name" | "country" | "province_state" | "description";
type SortDirection = "asc" | "desc";

const SettingsSection = () => {
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [editingType, setEditingType] = useState<TaxIdType | null>(null);
  const [deletingType, setDeletingType] = useState<TaxIdType | null>(null);
  
  const [showAuthorityForm, setShowAuthorityForm] = useState(false);
  const [editingAuthority, setEditingAuthority] = useState<IssuingAuthority | null>(null);
  const [deletingAuthority, setDeletingAuthority] = useState<IssuingAuthority | null>(null);
  
  // Search and sort state
  const [authoritySearch, setAuthoritySearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const { data: taxIdTypes, isLoading: typesLoading } = useTaxIdTypes();
  const { data: issuingAuthorities, isLoading: authoritiesLoading } = useIssuingAuthorities();

  const createTypeMutation = useCreateTaxIdType();
  const updateTypeMutation = useUpdateTaxIdType();
  const deleteTypeMutation = useDeleteTaxIdType();

  const createAuthorityMutation = useCreateIssuingAuthority();
  const updateAuthorityMutation = useUpdateIssuingAuthority();
  const deleteAuthorityMutation = useDeleteIssuingAuthority();

  // Filter and sort authorities
  const filteredAndSortedAuthorities = useMemo(() => {
    if (!issuingAuthorities) return [];
    
    let filtered = issuingAuthorities;
    
    // Apply search filter
    if (authoritySearch.trim()) {
      const searchLower = authoritySearch.toLowerCase();
      filtered = issuingAuthorities.filter((auth) => 
        auth.name.toLowerCase().includes(searchLower) ||
        auth.country.toLowerCase().includes(searchLower) ||
        ((auth as any).province_state || "").toLowerCase().includes(searchLower) ||
        (auth.description || "").toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sort
    return [...filtered].sort((a, b) => {
      let aVal = "";
      let bVal = "";
      
      if (sortKey === "province_state") {
        aVal = ((a as any).province_state || "").toLowerCase();
        bVal = ((b as any).province_state || "").toLowerCase();
      } else {
        aVal = (a[sortKey] || "").toLowerCase();
        bVal = (b[sortKey] || "").toLowerCase();
      }
      
      if (sortDirection === "asc") {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });
  }, [issuingAuthorities, authoritySearch, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    return sortDirection === "asc" 
      ? <ArrowUp className="w-4 h-4 ml-1" /> 
      : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const handleTypeSubmit = (data: TaxIdTypeFormData) => {
    const payload = { ...data, description: data.description || null };
    if (editingType) {
      updateTypeMutation.mutate({ id: editingType.id, ...payload }, {
        onSuccess: () => { setShowTypeForm(false); setEditingType(null); },
      });
    } else {
      createTypeMutation.mutate(payload, {
        onSuccess: () => setShowTypeForm(false),
      });
    }
  };

  const handleAuthoritySubmit = (data: IssuingAuthorityFormData) => {
    const provinceState = data.province_state === "__none__" ? null : (data.province_state || null);
    const payload = { 
      ...data, 
      description: data.description || null,
      province_state: provinceState,
    };
    if (editingAuthority) {
      updateAuthorityMutation.mutate({ id: editingAuthority.id, ...payload }, {
        onSuccess: () => { setShowAuthorityForm(false); setEditingAuthority(null); },
      });
    } else {
      createAuthorityMutation.mutate(payload, {
        onSuccess: () => setShowAuthorityForm(false),
      });
    }
  };

  if (typesLoading || authoritiesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground">Manage lookup tables for Tax ID Types and Issuing Authorities</p>
      </div>

      <Tabs defaultValue="tax-id-types" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tax-id-types" className="gap-2">
            <FileText className="w-4 h-4" />
            Tax ID Types
          </TabsTrigger>
          <TabsTrigger value="issuing-authorities" className="gap-2">
            <Building2 className="w-4 h-4" />
            Issuing Authorities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tax-id-types" className="mt-6">
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Tax ID Types</h3>
              <Button onClick={() => setShowTypeForm(true)} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Type
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxIdTypes?.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-mono font-medium">{type.code}</TableCell>
                    <TableCell>{type.label}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{type.description || "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => { setEditingType(type); setShowTypeForm(true); }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeletingType(type)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!taxIdTypes?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No tax ID types defined yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="issuing-authorities" className="mt-6">
          <div className="glass-card rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-foreground">Issuing Authorities</h3>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search authorities..."
                    value={authoritySearch}
                    onChange={(e) => setAuthoritySearch(e.target.value)}
                    className="pl-9 w-full sm:w-64"
                  />
                </div>
                <Button onClick={() => setShowAuthorityForm(true)} size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Authority
                </Button>
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">
                    <button 
                      onClick={() => handleSort("name")} 
                      className="flex items-center hover:text-foreground transition-colors"
                    >
                      Name {getSortIcon("name")}
                    </button>
                  </TableHead>
                  <TableHead className="min-w-[150px]">
                    <button 
                      onClick={() => handleSort("country")} 
                      className="flex items-center hover:text-foreground transition-colors"
                    >
                      Country {getSortIcon("country")}
                    </button>
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    <button 
                      onClick={() => handleSort("province_state")} 
                      className="flex items-center hover:text-foreground transition-colors"
                    >
                      Province/State {getSortIcon("province_state")}
                    </button>
                  </TableHead>
                  <TableHead className="min-w-[200px]">
                    <button 
                      onClick={() => handleSort("description")} 
                      className="flex items-center hover:text-foreground transition-colors"
                    >
                      Description {getSortIcon("description")}
                    </button>
                  </TableHead>
                  <TableHead className="w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedAuthorities.map((authority) => (
                  <TableRow key={authority.id}>
                    <TableCell className="font-medium text-foreground">{authority.name}</TableCell>
                    <TableCell className="text-foreground">{authority.country}</TableCell>
                    <TableCell className="text-foreground">{(authority as any).province_state || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{authority.description || "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-primary hover:text-primary"
                          onClick={() => { setEditingAuthority(authority); setShowAuthorityForm(true); }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeletingAuthority(authority)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!filteredAndSortedAuthorities.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      {authoritySearch ? "No authorities match your search" : "No issuing authorities defined yet"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Tax ID Type Dialog */}
      <Dialog open={showTypeForm} onOpenChange={() => { setShowTypeForm(false); setEditingType(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingType ? "Edit Tax ID Type" : "Add Tax ID Type"}</DialogTitle>
          </DialogHeader>
          <TaxIdTypeForm
            item={editingType}
            onSubmit={handleTypeSubmit}
            onCancel={() => { setShowTypeForm(false); setEditingType(null); }}
            isLoading={createTypeMutation.isPending || updateTypeMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Issuing Authority Dialog */}
      <Dialog open={showAuthorityForm} onOpenChange={() => { setShowAuthorityForm(false); setEditingAuthority(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAuthority ? "Edit Issuing Authority" : "Add Issuing Authority"}</DialogTitle>
          </DialogHeader>
          <IssuingAuthorityForm
            item={editingAuthority}
            onSubmit={handleAuthoritySubmit}
            onCancel={() => { setShowAuthorityForm(false); setEditingAuthority(null); }}
            isLoading={createAuthorityMutation.isPending || updateAuthorityMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmations */}
      <DeleteConfirmDialog
        open={!!deletingType}
        onOpenChange={() => setDeletingType(null)}
        onConfirm={() => {
          if (deletingType) deleteTypeMutation.mutate(deletingType.id, { onSuccess: () => setDeletingType(null) });
        }}
        title="Delete Tax ID Type"
        description={`Are you sure you want to delete "${deletingType?.code}"? This may affect existing tax IDs using this type.`}
        isLoading={deleteTypeMutation.isPending}
      />

      <DeleteConfirmDialog
        open={!!deletingAuthority}
        onOpenChange={() => setDeletingAuthority(null)}
        onConfirm={() => {
          if (deletingAuthority) deleteAuthorityMutation.mutate(deletingAuthority.id, { onSuccess: () => setDeletingAuthority(null) });
        }}
        title="Delete Issuing Authority"
        description={`Are you sure you want to delete "${deletingAuthority?.name}"? This may affect existing tax IDs using this authority.`}
        isLoading={deleteAuthorityMutation.isPending}
      />
    </div>
  );
};

export default SettingsSection;
