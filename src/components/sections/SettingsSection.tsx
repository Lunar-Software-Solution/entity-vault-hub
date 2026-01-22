import { useState, useMemo, useEffect } from "react";
import { useTaxIdTypes, useIssuingAuthorities, useAllAuthorityTaxIdTypes, type TaxIdType, type IssuingAuthority } from "@/hooks/usePortalData";
import { 
  useCreateTaxIdType, useUpdateTaxIdType, useDeleteTaxIdType,
  useCreateIssuingAuthority, useUpdateIssuingAuthority, useDeleteIssuingAuthority,
  useUpdateAuthorityTaxIdTypes
} from "@/hooks/usePortalMutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
  tax_id_type_ids: string[];
}

const IssuingAuthorityForm = ({ 
  item, 
  onSubmit, 
  onCancel, 
  isLoading,
  taxIdTypes,
  initialTaxIdTypeIds
}: { 
  item?: IssuingAuthority | null; 
  onSubmit: (data: IssuingAuthorityFormData) => void; 
  onCancel: () => void; 
  isLoading?: boolean;
  taxIdTypes?: TaxIdType[];
  initialTaxIdTypeIds?: string[];
}) => {
  const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>(initialTaxIdTypeIds || []);
  
  useEffect(() => {
    setSelectedTypeIds(initialTaxIdTypeIds || []);
  }, [initialTaxIdTypeIds]);

  const form = useForm<Omit<IssuingAuthorityFormData, 'tax_id_type_ids'>>({
    defaultValues: {
      name: item?.name ?? "",
      country: item?.country ?? "",
      province_state: (item as any)?.province_state ?? "",
      description: item?.description ?? "",
    },
  });

  const selectedCountry = form.watch("country");
  
  const handleCountryChange = (value: string) => {
    form.setValue("country", value);
  };

  const getProvinceStateOptions = () => {
    if (selectedCountry === "United States") return usStates;
    if (selectedCountry === "Canada") return canadaProvinces;
    return null;
  };

  const provinceStateOptions = getProvinceStateOptions();

  const handleTypeToggle = (typeId: string) => {
    setSelectedTypeIds(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleSubmit = (data: Omit<IssuingAuthorityFormData, 'tax_id_type_ids'>) => {
    onSubmit({ ...data, tax_id_type_ids: selectedTypeIds });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
        
        {/* Tax ID Types multi-select */}
        <div className="space-y-2">
          <FormLabel>Tax ID Types Issued</FormLabel>
          <div className="border border-border rounded-md p-3 max-h-[150px] overflow-y-auto space-y-2 bg-background">
            {taxIdTypes?.length ? (
              taxIdTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type.id}`}
                    checked={selectedTypeIds.includes(type.id)}
                    onCheckedChange={() => handleTypeToggle(type.id)}
                  />
                  <label 
                    htmlFor={`type-${type.id}`} 
                    className="text-sm text-foreground cursor-pointer flex-1"
                  >
                    <span className="font-mono font-medium">{type.code}</span>
                    <span className="text-muted-foreground ml-2">— {type.label}</span>
                  </label>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No tax ID types defined yet</p>
            )}
          </div>
        </div>
        
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

type AuthoritySortKey = "name" | "country" | "province_state" | "description";
type TypeSortKey = "code" | "label" | "description";
type SortDirection = "asc" | "desc";

const SettingsSection = () => {
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [editingType, setEditingType] = useState<TaxIdType | null>(null);
  const [deletingType, setDeletingType] = useState<TaxIdType | null>(null);
  
  const [showAuthorityForm, setShowAuthorityForm] = useState(false);
  const [editingAuthority, setEditingAuthority] = useState<IssuingAuthority | null>(null);
  const [deletingAuthority, setDeletingAuthority] = useState<IssuingAuthority | null>(null);
  
  // Search and sort state for Tax ID Types
  const [typeSearch, setTypeSearch] = useState("");
  const [typeSortKey, setTypeSortKey] = useState<TypeSortKey>("code");
  const [typeSortDirection, setTypeSortDirection] = useState<SortDirection>("asc");
  
  // Search and sort state for Issuing Authorities
  const [authoritySearch, setAuthoritySearch] = useState("");
  const [authoritySortKey, setAuthoritySortKey] = useState<AuthoritySortKey>("name");
  const [authoritySortDirection, setAuthoritySortDirection] = useState<SortDirection>("asc");

  const { data: taxIdTypes, isLoading: typesLoading } = useTaxIdTypes();
  const { data: issuingAuthorities, isLoading: authoritiesLoading } = useIssuingAuthorities();
  const { data: authorityTaxIdTypes } = useAllAuthorityTaxIdTypes();

  const createTypeMutation = useCreateTaxIdType();
  const updateTypeMutation = useUpdateTaxIdType();
  const deleteTypeMutation = useDeleteTaxIdType();

  const createAuthorityMutation = useCreateIssuingAuthority();
  const updateAuthorityMutation = useUpdateIssuingAuthority();
  const deleteAuthorityMutation = useDeleteIssuingAuthority();
  const updateAuthorityTypesMutation = useUpdateAuthorityTaxIdTypes();
  
  // Get tax id type ids for an authority
  const getAuthorityTypeIds = (authorityId: string) => {
    return authorityTaxIdTypes
      ?.filter(rel => rel.authority_id === authorityId)
      .map(rel => rel.tax_id_type_id) || [];
  };
  
  // Get tax id type codes for display
  const getAuthorityTypeCodes = (authorityId: string) => {
    const typeIds = getAuthorityTypeIds(authorityId);
    return taxIdTypes
      ?.filter(type => typeIds.includes(type.id))
      .map(type => type.code) || [];
  };

  // Filter and sort Tax ID Types
  const filteredAndSortedTypes = useMemo(() => {
    if (!taxIdTypes) return [];
    
    let filtered = taxIdTypes;
    
    // Apply search filter
    if (typeSearch.trim()) {
      const searchLower = typeSearch.toLowerCase();
      filtered = taxIdTypes.filter((type) => 
        type.code.toLowerCase().includes(searchLower) ||
        type.label.toLowerCase().includes(searchLower) ||
        (type.description || "").toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sort
    return [...filtered].sort((a, b) => {
      const aVal = (a[typeSortKey] || "").toLowerCase();
      const bVal = (b[typeSortKey] || "").toLowerCase();
      
      if (typeSortDirection === "asc") {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });
  }, [taxIdTypes, typeSearch, typeSortKey, typeSortDirection]);

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
      
      if (authoritySortKey === "province_state") {
        aVal = ((a as any).province_state || "").toLowerCase();
        bVal = ((b as any).province_state || "").toLowerCase();
      } else {
        aVal = (a[authoritySortKey] || "").toLowerCase();
        bVal = (b[authoritySortKey] || "").toLowerCase();
      }
      
      if (authoritySortDirection === "asc") {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });
  }, [issuingAuthorities, authoritySearch, authoritySortKey, authoritySortDirection]);

  const handleTypeSort = (key: TypeSortKey) => {
    if (typeSortKey === key) {
      setTypeSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setTypeSortKey(key);
      setTypeSortDirection("asc");
    }
  };

  const handleAuthoritySort = (key: AuthoritySortKey) => {
    if (authoritySortKey === key) {
      setAuthoritySortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setAuthoritySortKey(key);
      setAuthoritySortDirection("asc");
    }
  };

  const getTypeSortIcon = (key: TypeSortKey) => {
    if (typeSortKey !== key) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    return typeSortDirection === "asc" 
      ? <ArrowUp className="w-4 h-4 ml-1" /> 
      : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const getAuthoritySortIcon = (key: AuthoritySortKey) => {
    if (authoritySortKey !== key) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    return authoritySortDirection === "asc" 
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
    const { tax_id_type_ids, ...rest } = data;
    const payload = { 
      ...rest, 
      description: data.description || null,
      province_state: provinceState,
    };
    
    if (editingAuthority) {
      updateAuthorityMutation.mutate({ id: editingAuthority.id, ...payload }, {
        onSuccess: () => {
          // Update tax id type relationships
          updateAuthorityTypesMutation.mutate({
            authorityId: editingAuthority.id,
            taxIdTypeIds: tax_id_type_ids,
          });
          setShowAuthorityForm(false);
          setEditingAuthority(null);
        },
      });
    } else {
      createAuthorityMutation.mutate(payload, {
        onSuccess: (newAuthority) => {
          // Create tax id type relationships for new authority
          if (newAuthority && tax_id_type_ids.length > 0) {
            updateAuthorityTypesMutation.mutate({
              authorityId: newAuthority.id,
              taxIdTypeIds: tax_id_type_ids,
            });
          }
          setShowAuthorityForm(false);
        },
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-foreground">Tax ID Types</h3>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search types..."
                    value={typeSearch}
                    onChange={(e) => setTypeSearch(e.target.value)}
                    className="pl-9 w-full sm:w-64"
                  />
                </div>
                <Button onClick={() => setShowTypeForm(true)} size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Type
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">
                      <button 
                        onClick={() => handleTypeSort("code")} 
                        className="flex items-center hover:text-foreground transition-colors text-foreground"
                      >
                        Code {getTypeSortIcon("code")}
                      </button>
                    </TableHead>
                    <TableHead className="w-[200px]">
                      <button 
                        onClick={() => handleTypeSort("label")} 
                        className="flex items-center hover:text-foreground transition-colors text-foreground"
                      >
                        Label {getTypeSortIcon("label")}
                      </button>
                    </TableHead>
                    <TableHead className="w-auto">
                      <button 
                        onClick={() => handleTypeSort("description")} 
                        className="flex items-center hover:text-foreground transition-colors text-foreground"
                      >
                        Description {getTypeSortIcon("description")}
                      </button>
                    </TableHead>
                    <TableHead className="w-[100px] text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-mono font-medium text-foreground">{type.code}</TableCell>
                      <TableCell className="text-foreground">{type.label}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{type.description || "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary hover:text-primary"
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
                  {!filteredAndSortedTypes.length && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        {typeSearch ? "No types match your search" : "No tax ID types defined yet"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
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
            
            <div className="overflow-x-auto">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">
                      <button 
                        onClick={() => handleAuthoritySort("name")} 
                        className="flex items-center hover:text-foreground transition-colors text-foreground"
                      >
                        Name {getAuthoritySortIcon("name")}
                      </button>
                    </TableHead>
                    <TableHead className="w-[130px]">
                      <button 
                        onClick={() => handleAuthoritySort("country")} 
                        className="flex items-center hover:text-foreground transition-colors text-foreground"
                      >
                        Country {getAuthoritySortIcon("country")}
                      </button>
                    </TableHead>
                    <TableHead className="w-[110px]">
                      <button 
                        onClick={() => handleAuthoritySort("province_state")} 
                        className="flex items-center hover:text-foreground transition-colors text-foreground"
                      >
                        State/Province {getAuthoritySortIcon("province_state")}
                      </button>
                    </TableHead>
                    <TableHead className="w-[180px] text-foreground">Tax ID Types</TableHead>
                    <TableHead className="w-auto">
                      <button 
                        onClick={() => handleAuthoritySort("description")} 
                        className="flex items-center hover:text-foreground transition-colors text-foreground"
                      >
                        Description {getAuthoritySortIcon("description")}
                      </button>
                    </TableHead>
                    <TableHead className="w-[100px] text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedAuthorities.map((authority) => {
                    const typeCodes = getAuthorityTypeCodes(authority.id);
                    return (
                      <TableRow key={authority.id}>
                        <TableCell className="font-medium text-foreground">{authority.name}</TableCell>
                        <TableCell className="text-foreground">{authority.country}</TableCell>
                        <TableCell className="text-foreground">{(authority as any).province_state || "—"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {typeCodes.length > 0 ? (
                              typeCodes.map((code) => (
                                <Badge key={code} variant="secondary" className="text-xs font-mono">
                                  {code}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </div>
                        </TableCell>
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
                    );
                  })}
                  {!filteredAndSortedAuthorities.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        {authoritySearch ? "No authorities match your search" : "No issuing authorities defined yet"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
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
            taxIdTypes={taxIdTypes}
            initialTaxIdTypeIds={editingAuthority ? getAuthorityTypeIds(editingAuthority.id) : []}
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
