import { useState, useMemo } from "react";
import { useTaxIdTypes, useIssuingAuthorities, useDocumentTypes, useFilingTypes, useSoftwareCatalog, type TaxIdType, type IssuingAuthority, type DocumentType, type FilingType, type SoftwareCatalog } from "@/hooks/usePortalData";
import { 
  useCreateTaxIdType, useUpdateTaxIdType, useDeleteTaxIdType,
  useCreateIssuingAuthority, useUpdateIssuingAuthority, useDeleteIssuingAuthority,
  useCreateDocumentType, useUpdateDocumentType, useDeleteDocumentType,
  useCreateFilingType, useUpdateFilingType, useDeleteFilingType,
  useCreateSoftwareCatalog, useUpdateSoftwareCatalog, useDeleteSoftwareCatalog
} from "@/hooks/usePortalMutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { Plus, Edit, Trash2, FileText, Building2, Search, ArrowUpDown, ArrowUp, ArrowDown, FolderOpen, Calendar, Monitor } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { countries } from "@/lib/countries";
import { usStates, canadaProvinces } from "@/lib/states";
import { FILING_CATEGORY_COLORS } from "@/lib/filingUtils";

// Tax ID Type Form
interface TaxIdTypeFormData {
  code: string;
  label: string;
  description?: string;
  authority_id?: string;
}

const TaxIdTypeForm = ({ 
  item, 
  onSubmit, 
  onCancel, 
  isLoading,
  authorities 
}: { 
  item?: TaxIdType | null; 
  onSubmit: (data: TaxIdTypeFormData) => void; 
  onCancel: () => void; 
  isLoading?: boolean;
  authorities?: IssuingAuthority[];
}) => {
  const form = useForm<TaxIdTypeFormData>({
    defaultValues: {
      code: item?.code ?? "",
      label: item?.label ?? "",
      description: item?.description ?? "",
      authority_id: (item as any)?.authority_id ?? "",
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
        <FormField control={form.control} name="authority_id" render={({ field }) => (
          <FormItem>
            <FormLabel>Issuing Authority</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select an authority" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-background max-h-[300px]">
                <SelectItem value="__none__">None</SelectItem>
                {authorities?.map((auth) => (
                  <SelectItem key={auth.id} value={auth.id}>
                    {auth.name} ({auth.country})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
  
  const handleCountryChange = (value: string) => {
    form.setValue("country", value);
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

type AuthoritySortKey = "name" | "country" | "province_state" | "description";
type TypeSortKey = "code" | "label" | "description";
type DocTypeSortKey = "code" | "name" | "category" | "description";
type FilingTypeSortKey = "code" | "name" | "category" | "default_frequency" | "description";
type SoftwareSortKey = "name" | "category" | "vendor" | "website";
type SortDirection = "asc" | "desc";

// Filing Type Form
interface FilingTypeFormData {
  code: string;
  name: string;
  category: string;
  default_frequency: string;
  description?: string;
}

const filingCategories = ["State", "Federal", "Tax", "Payroll", "Corporate", "Other"];
const filingFrequencies = ["annual", "quarterly", "monthly", "one-time"];

const frequencyLabels: Record<string, string> = {
  annual: "Annual",
  quarterly: "Quarterly",
  monthly: "Monthly",
  "one-time": "One-Time",
};

const FilingTypeForm = ({ 
  item, 
  onSubmit, 
  onCancel, 
  isLoading
}: { 
  item?: FilingType | null; 
  onSubmit: (data: FilingTypeFormData) => void; 
  onCancel: () => void; 
  isLoading?: boolean;
}) => {
  const form = useForm<FilingTypeFormData>({
    defaultValues: {
      code: item?.code ?? "",
      name: item?.name ?? "",
      category: item?.category ?? "Other",
      default_frequency: item?.default_frequency ?? "annual",
      description: item?.description ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="code" render={({ field }) => (
          <FormItem>
            <FormLabel>Code *</FormLabel>
            <FormControl><Input placeholder="e.g., AR, FTX, 941" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name *</FormLabel>
            <FormControl><Input placeholder="e.g., Annual Report, Form 941" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || "Other"}>
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background">
                  {filingCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${FILING_CATEGORY_COLORS[cat]?.split(' ')[0] || 'bg-zinc-500'}`}></span>
                        {cat}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="default_frequency" render={({ field }) => (
            <FormItem>
              <FormLabel>Default Frequency *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || "annual"}>
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background">
                  {filingFrequencies.map((freq) => (
                    <SelectItem key={freq} value={freq}>
                      {frequencyLabels[freq]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>
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

// Document Type Form
interface DocumentTypeFormData {
  code: string;
  name: string;
  category: string;
  description?: string;
}

const categoryColors: Record<string, string> = {
  Formation: "bg-blue-500/20 text-blue-400",
  Tax: "bg-orange-500/20 text-orange-400",
  Governance: "bg-purple-500/20 text-purple-400",
  Legal: "bg-green-500/20 text-green-400",
  Other: "bg-zinc-500/20 text-zinc-400",
};

const categories = ["Formation", "Tax", "Governance", "Legal", "Other"];

const DocumentTypeForm = ({ 
  item, 
  onSubmit, 
  onCancel, 
  isLoading
}: { 
  item?: DocumentType | null; 
  onSubmit: (data: DocumentTypeFormData) => void; 
  onCancel: () => void; 
  isLoading?: boolean;
}) => {
  const form = useForm<DocumentTypeFormData>({
    defaultValues: {
      code: item?.code ?? "",
      name: item?.name ?? "",
      category: item?.category ?? "Other",
      description: item?.description ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="code" render={({ field }) => (
          <FormItem>
            <FormLabel>Code *</FormLabel>
            <FormControl><Input placeholder="e.g., COI, SS4, BYLAWS" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name *</FormLabel>
            <FormControl><Input placeholder="e.g., Certificate of Incorporation" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="category" render={({ field }) => (
          <FormItem>
            <FormLabel>Category *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || "Other"}>
              <FormControl>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-background">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${categoryColors[cat]?.split(' ')[0] || 'bg-zinc-500'}`}></span>
                      {cat}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

// Software Catalog Form
interface SoftwareCatalogFormData {
  name: string;
  category: string;
  vendor?: string;
  website?: string;
  description?: string;
}

const softwareCategories = [
  { value: "erp", label: "ERP System" },
  { value: "accounting", label: "Accounting" },
  { value: "payroll", label: "Payroll" },
  { value: "business_intelligence", label: "Business Intelligence" },
  { value: "crm", label: "CRM" },
  { value: "project_management", label: "Project Management" },
  { value: "communication", label: "Communication" },
  { value: "productivity", label: "Productivity" },
  { value: "hr", label: "HR Management" },
  { value: "inventory", label: "Inventory Management" },
  { value: "ecommerce", label: "E-Commerce" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Other" },
];

const softwareCategoryLabels: Record<string, string> = {
  erp: "ERP System",
  accounting: "Accounting",
  payroll: "Payroll",
  business_intelligence: "Business Intelligence",
  crm: "CRM",
  project_management: "Project Management",
  communication: "Communication",
  productivity: "Productivity",
  hr: "HR Management",
  inventory: "Inventory Management",
  ecommerce: "E-Commerce",
  marketing: "Marketing",
  other: "Other",
};

const SoftwareCatalogForm = ({ 
  item, 
  onSubmit, 
  onCancel, 
  isLoading
}: { 
  item?: SoftwareCatalog | null; 
  onSubmit: (data: SoftwareCatalogFormData) => void; 
  onCancel: () => void; 
  isLoading?: boolean;
}) => {
  const form = useForm<SoftwareCatalogFormData>({
    defaultValues: {
      name: item?.name ?? "",
      category: item?.category ?? "other",
      vendor: item?.vendor ?? "",
      website: item?.website ?? "",
      description: item?.description ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name *</FormLabel>
            <FormControl><Input placeholder="e.g., QuickBooks, SAP" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || "other"}>
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background max-h-[300px]">
                  {softwareCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="vendor" render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor</FormLabel>
              <FormControl><Input placeholder="e.g., Microsoft, Intuit" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="website" render={({ field }) => (
          <FormItem>
            <FormLabel>Website</FormLabel>
            <FormControl><Input placeholder="https://example.com" {...field} /></FormControl>
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
            {isLoading ? "Saving..." : item ? "Update" : "Add Software"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

const SettingsSection = () => {
  const { canWrite } = useUserRole();
  
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [editingType, setEditingType] = useState<TaxIdType | null>(null);
  const [deletingType, setDeletingType] = useState<TaxIdType | null>(null);
  
  const [showAuthorityForm, setShowAuthorityForm] = useState(false);
  const [editingAuthority, setEditingAuthority] = useState<IssuingAuthority | null>(null);
  const [deletingAuthority, setDeletingAuthority] = useState<IssuingAuthority | null>(null);
  
  const [showDocTypeForm, setShowDocTypeForm] = useState(false);
  const [editingDocType, setEditingDocType] = useState<DocumentType | null>(null);
  const [deletingDocType, setDeletingDocType] = useState<DocumentType | null>(null);

  const [showFilingTypeForm, setShowFilingTypeForm] = useState(false);
  const [editingFilingType, setEditingFilingType] = useState<FilingType | null>(null);
  const [deletingFilingType, setDeletingFilingType] = useState<FilingType | null>(null);

  const [showSoftwareForm, setShowSoftwareForm] = useState(false);
  const [editingSoftware, setEditingSoftware] = useState<SoftwareCatalog | null>(null);
  const [deletingSoftware, setDeletingSoftware] = useState<SoftwareCatalog | null>(null);
  
  // Search and sort state for Tax ID Types
  const [typeSearch, setTypeSearch] = useState("");
  const [typeSortKey, setTypeSortKey] = useState<TypeSortKey>("code");
  const [typeSortDirection, setTypeSortDirection] = useState<SortDirection>("asc");
  
  // Search and sort state for Issuing Authorities
  const [authoritySearch, setAuthoritySearch] = useState("");
  const [authoritySortKey, setAuthoritySortKey] = useState<AuthoritySortKey>("name");
  const [authoritySortDirection, setAuthoritySortDirection] = useState<SortDirection>("asc");

  // Search and sort state for Document Types
  const [docTypeSearch, setDocTypeSearch] = useState("");
  const [docTypeSortKey, setDocTypeSortKey] = useState<DocTypeSortKey>("code");
  const [docTypeSortDirection, setDocTypeSortDirection] = useState<SortDirection>("asc");

  // Search and sort state for Filing Types
  const [filingTypeSearch, setFilingTypeSearch] = useState("");
  const [filingTypeSortKey, setFilingTypeSortKey] = useState<FilingTypeSortKey>("code");
  const [filingTypeSortDirection, setFilingTypeSortDirection] = useState<SortDirection>("asc");

  // Search and sort state for Software Catalog
  const [softwareSearch, setSoftwareSearch] = useState("");
  const [softwareSortKey, setSoftwareSortKey] = useState<SoftwareSortKey>("name");
  const [softwareSortDirection, setSoftwareSortDirection] = useState<SortDirection>("asc");

  const { data: taxIdTypes, isLoading: typesLoading } = useTaxIdTypes();
  const { data: issuingAuthorities, isLoading: authoritiesLoading } = useIssuingAuthorities();
  const { data: documentTypes, isLoading: docTypesLoading } = useDocumentTypes();
  const { data: filingTypes, isLoading: filingTypesLoading } = useFilingTypes();
  const { data: softwareCatalog, isLoading: softwareLoading } = useSoftwareCatalog();

  const createTypeMutation = useCreateTaxIdType();
  const updateTypeMutation = useUpdateTaxIdType();
  const deleteTypeMutation = useDeleteTaxIdType();

  const createAuthorityMutation = useCreateIssuingAuthority();
  const updateAuthorityMutation = useUpdateIssuingAuthority();
  const deleteAuthorityMutation = useDeleteIssuingAuthority();

  const createDocTypeMutation = useCreateDocumentType();
  const updateDocTypeMutation = useUpdateDocumentType();
  const deleteDocTypeMutation = useDeleteDocumentType();

  const createFilingTypeMutation = useCreateFilingType();
  const updateFilingTypeMutation = useUpdateFilingType();
  const deleteFilingTypeMutation = useDeleteFilingType();

  const createSoftwareMutation = useCreateSoftwareCatalog();
  const updateSoftwareMutation = useUpdateSoftwareCatalog();
  const deleteSoftwareMutation = useDeleteSoftwareCatalog();
  // Get authority name for a tax id type
  const getAuthorityName = (authorityId: string | null | undefined) => {
    if (!authorityId) return null;
    const authority = issuingAuthorities?.find(a => a.id === authorityId);
    return authority ? authority.name : null;
  };
  
  // Get tax id type codes for an authority (via authority_id on tax_id_types)
  const getAuthorityTypeCodes = (authorityId: string) => {
    return taxIdTypes
      ?.filter(type => (type as any).authority_id === authorityId)
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

  // Filter and sort Filing Types
  const filteredAndSortedFilingTypes = useMemo(() => {
    if (!filingTypes) return [];
    
    let filtered = filingTypes;
    
    // Apply search filter
    if (filingTypeSearch.trim()) {
      const searchLower = filingTypeSearch.toLowerCase();
      filtered = filingTypes.filter((type) => 
        type.code.toLowerCase().includes(searchLower) ||
        type.name.toLowerCase().includes(searchLower) ||
        type.category.toLowerCase().includes(searchLower) ||
        (type.description || "").toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sort
    return [...filtered].sort((a, b) => {
      const aVal = (a[filingTypeSortKey] || "").toLowerCase();
      const bVal = (b[filingTypeSortKey] || "").toLowerCase();
      
      if (filingTypeSortDirection === "asc") {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });
  }, [filingTypes, filingTypeSearch, filingTypeSortKey, filingTypeSortDirection]);

  // Software category labels
  const softwareCategoryLabels: Record<string, string> = {
    erp: "ERP System",
    accounting: "Accounting",
    payroll: "Payroll",
    hr: "HR Management",
    crm: "CRM",
    bi: "Business Intelligence",
    project_management: "Project Management",
    communication: "Communication",
    document_management: "Document Management",
    other: "Other",
  };

  // Filter and sort Software Catalog
  const filteredAndSortedSoftware = useMemo(() => {
    if (!softwareCatalog) return [];
    
    let filtered = softwareCatalog;
    
    // Apply search filter
    if (softwareSearch.trim()) {
      const searchLower = softwareSearch.toLowerCase();
      filtered = softwareCatalog.filter((sw) => 
        sw.name.toLowerCase().includes(searchLower) ||
        sw.category.toLowerCase().includes(searchLower) ||
        (sw.vendor || "").toLowerCase().includes(searchLower) ||
        (sw.description || "").toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sort
    return [...filtered].sort((a, b) => {
      const aVal = (a[softwareSortKey] || "").toLowerCase();
      const bVal = (b[softwareSortKey] || "").toLowerCase();
      
      if (softwareSortDirection === "asc") {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });
  }, [softwareCatalog, softwareSearch, softwareSortKey, softwareSortDirection]);

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
    const authorityId = data.authority_id === "__none__" ? null : (data.authority_id || null);
    const payload = { 
      ...data, 
      description: data.description || null,
      authority_id: authorityId,
    };
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
        onSuccess: () => {
          setShowAuthorityForm(false);
          setEditingAuthority(null);
        },
      });
    } else {
      createAuthorityMutation.mutate(payload, {
        onSuccess: () => {
          setShowAuthorityForm(false);
        },
      });
    }
  };

  const handleFilingTypeSort = (key: FilingTypeSortKey) => {
    if (filingTypeSortKey === key) {
      setFilingTypeSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setFilingTypeSortKey(key);
      setFilingTypeSortDirection("asc");
    }
  };

  const handleFilingTypeSubmit = (data: FilingTypeFormData) => {
    const payload = { 
      ...data, 
      description: data.description || null,
    };
    if (editingFilingType) {
      updateFilingTypeMutation.mutate({ id: editingFilingType.id, ...payload }, {
        onSuccess: () => { setShowFilingTypeForm(false); setEditingFilingType(null); },
      });
    } else {
      createFilingTypeMutation.mutate(payload, {
        onSuccess: () => setShowFilingTypeForm(false),
      });
    }
  };

  const getFilingTypeSortIcon = (key: FilingTypeSortKey) => {
    if (filingTypeSortKey !== key) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    return filingTypeSortDirection === "asc" 
      ? <ArrowUp className="w-4 h-4 ml-1" /> 
      : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  // Filter and sort Document Types
  const filteredAndSortedDocTypes = useMemo(() => {
    if (!documentTypes) return [];
    
    let filtered = documentTypes;
    
    // Apply search filter
    if (docTypeSearch.trim()) {
      const searchLower = docTypeSearch.toLowerCase();
      filtered = documentTypes.filter((type) => 
        type.code.toLowerCase().includes(searchLower) ||
        type.name.toLowerCase().includes(searchLower) ||
        type.category.toLowerCase().includes(searchLower) ||
        (type.description || "").toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sort
    return [...filtered].sort((a, b) => {
      const aVal = (a[docTypeSortKey] || "").toLowerCase();
      const bVal = (b[docTypeSortKey] || "").toLowerCase();
      
      if (docTypeSortDirection === "asc") {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });
  }, [documentTypes, docTypeSearch, docTypeSortKey, docTypeSortDirection]);

  const handleDocTypeSort = (key: DocTypeSortKey) => {
    if (docTypeSortKey === key) {
      setDocTypeSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setDocTypeSortKey(key);
      setDocTypeSortDirection("asc");
    }
  };

  const getDocTypeSortIcon = (key: DocTypeSortKey) => {
    if (docTypeSortKey !== key) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    return docTypeSortDirection === "asc" 
      ? <ArrowUp className="w-4 h-4 ml-1" /> 
      : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const handleDocTypeSubmit = (data: DocumentTypeFormData) => {
    const payload = { 
      ...data, 
      description: data.description || null,
    };
    if (editingDocType) {
      updateDocTypeMutation.mutate({ id: editingDocType.id, ...payload }, {
        onSuccess: () => { setShowDocTypeForm(false); setEditingDocType(null); },
      });
    } else {
      createDocTypeMutation.mutate(payload, {
        onSuccess: () => setShowDocTypeForm(false),
      });
    }
  };

  if (typesLoading || authoritiesLoading || filingTypesLoading || docTypesLoading) {
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
        <p className="text-muted-foreground">Manage lookup tables for Tax ID Types, Issuing Authorities, Document Types, Filing Types, and Software Catalog</p>
      </div>

      <Tabs defaultValue="tax-id-types" className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-5">
          <TabsTrigger value="tax-id-types" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Tax ID Types</span>
            <span className="sm:hidden">Tax IDs</span>
          </TabsTrigger>
          <TabsTrigger value="issuing-authorities" className="gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Authorities</span>
            <span className="sm:hidden">Auth</span>
          </TabsTrigger>
          <TabsTrigger value="document-types" className="gap-2">
            <FolderOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Doc Types</span>
            <span className="sm:hidden">Docs</span>
          </TabsTrigger>
          <TabsTrigger value="filing-types" className="gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Filing Types</span>
            <span className="sm:hidden">Filings</span>
          </TabsTrigger>
          <TabsTrigger value="software-catalog" className="gap-2">
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">Software</span>
            <span className="sm:hidden">SW</span>
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
                    className="pl-9 w-full sm:w-64 text-foreground"
                  />
                </div>
                {canWrite && (
                  <Button onClick={() => setShowTypeForm(true)} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Type
                  </Button>
                )}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">
                      <button 
                        onClick={() => handleTypeSort("code")} 
                        className="flex items-center hover:text-foreground transition-colors text-foreground"
                      >
                        Code {getTypeSortIcon("code")}
                      </button>
                    </TableHead>
                    <TableHead className="w-[180px]">
                      <button 
                        onClick={() => handleTypeSort("label")} 
                        className="flex items-center hover:text-foreground transition-colors text-foreground"
                      >
                        Label {getTypeSortIcon("label")}
                      </button>
                    </TableHead>
                    <TableHead className="w-[150px] text-foreground">Authority</TableHead>
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
                  {filteredAndSortedTypes.map((type) => {
                    const authorityName = getAuthorityName((type as any).authority_id);
                    return (
                      <TableRow key={type.id}>
                        <TableCell className="font-mono font-medium text-foreground">{type.code}</TableCell>
                        <TableCell className="text-foreground">{type.label}</TableCell>
                        <TableCell>
                          {authorityName ? (
                            <Badge variant="secondary" className="text-xs">
                              {authorityName}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{type.description || "—"}</TableCell>
                        <TableCell>
                          {canWrite && (
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
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!filteredAndSortedTypes.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
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
                    className="pl-9 w-full sm:w-64 text-foreground"
                  />
                </div>
                {canWrite && (
                  <Button onClick={() => setShowAuthorityForm(true)} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Authority
                  </Button>
                )}
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
                          {canWrite && (
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
                          )}
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

        <TabsContent value="document-types" className="mt-6">
          <div className="glass-card rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-foreground">Document Types</h3>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search document types..."
                    value={docTypeSearch}
                    onChange={(e) => setDocTypeSearch(e.target.value)}
                    className="pl-9 w-full sm:w-64 text-foreground"
                  />
                </div>
                {canWrite && (
                  <Button onClick={() => setShowDocTypeForm(true)} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Type
                  </Button>
                )}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">
                      <button 
                        onClick={() => handleDocTypeSort("code")} 
                        className="flex items-center hover:text-foreground transition-colors text-foreground"
                      >
                        Code {getDocTypeSortIcon("code")}
                      </button>
                    </TableHead>
                    <TableHead className="w-[200px]">
                      <button 
                        onClick={() => handleDocTypeSort("name")} 
                        className="flex items-center hover:text-foreground transition-colors text-foreground"
                      >
                        Name {getDocTypeSortIcon("name")}
                      </button>
                    </TableHead>
                    <TableHead className="w-[100px]">
                      <button 
                        onClick={() => handleDocTypeSort("category")} 
                        className="flex items-center hover:text-foreground transition-colors text-foreground"
                      >
                        Category {getDocTypeSortIcon("category")}
                      </button>
                    </TableHead>
                    <TableHead className="w-auto">
                      <button 
                        onClick={() => handleDocTypeSort("description")} 
                        className="flex items-center hover:text-foreground transition-colors text-foreground"
                      >
                        Description {getDocTypeSortIcon("description")}
                      </button>
                    </TableHead>
                    <TableHead className="w-[100px] text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedDocTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-mono font-medium text-foreground">{type.code}</TableCell>
                      <TableCell className="text-foreground">{type.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${categoryColors[type.category] || categoryColors.Other}`}>
                          {type.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{type.description || "—"}</TableCell>
                      <TableCell>
                        {canWrite && (
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-primary hover:text-primary"
                              onClick={() => { setEditingDocType(type); setShowDocTypeForm(true); }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeletingDocType(type)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!filteredAndSortedDocTypes.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        {docTypeSearch ? "No document types match your search" : "No document types defined yet"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="filing-types" className="mt-6">
          <div className="glass-card rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-foreground">Filing Types</h3>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search filing types..."
                    value={filingTypeSearch}
                    onChange={(e) => setFilingTypeSearch(e.target.value)}
                    className="pl-9 w-full sm:w-64 text-foreground"
                  />
                </div>
                {canWrite && (
                  <Button onClick={() => setShowFilingTypeForm(true)} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Type
                  </Button>
                )}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">
                      <button 
                        onClick={() => handleFilingTypeSort("code")} 
                        className="flex items-center hover:text-foreground transition-colors text-foreground"
                      >
                        Code {getFilingTypeSortIcon("code")}
                      </button>
                    </TableHead>
                    <TableHead className="w-[200px]">
                      <button 
                        onClick={() => handleFilingTypeSort("name")} 
                        className="flex items-center hover:text-foreground transition-colors text-foreground"
                      >
                        Name {getFilingTypeSortIcon("name")}
                      </button>
                    </TableHead>
                    <TableHead className="w-[100px]">
                      <button 
                        onClick={() => handleFilingTypeSort("category")} 
                        className="flex items-center hover:text-foreground transition-colors text-foreground"
                      >
                        Category {getFilingTypeSortIcon("category")}
                      </button>
                    </TableHead>
                    <TableHead className="w-[100px]">
                      <button 
                        onClick={() => handleFilingTypeSort("default_frequency")} 
                        className="flex items-center hover:text-foreground transition-colors text-foreground"
                      >
                        Frequency {getFilingTypeSortIcon("default_frequency")}
                      </button>
                    </TableHead>
                    <TableHead className="w-auto">
                      <button 
                        onClick={() => handleFilingTypeSort("description")} 
                        className="flex items-center hover:text-foreground transition-colors text-foreground"
                      >
                        Description {getFilingTypeSortIcon("description")}
                      </button>
                    </TableHead>
                    <TableHead className="w-[100px] text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedFilingTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-mono font-medium text-foreground">{type.code}</TableCell>
                      <TableCell className="text-foreground">{type.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${FILING_CATEGORY_COLORS[type.category] || FILING_CATEGORY_COLORS.Other}`}>
                          {type.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground capitalize">{frequencyLabels[type.default_frequency] || type.default_frequency}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{type.description || "—"}</TableCell>
                      <TableCell>
                        {canWrite && (
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-primary hover:text-primary"
                              onClick={() => { setEditingFilingType(type); setShowFilingTypeForm(true); }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeletingFilingType(type)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!filteredAndSortedFilingTypes.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        {filingTypeSearch ? "No filing types match your search" : "No filing types defined yet"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="software-catalog" className="mt-6">
          <div className="glass-card rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-foreground">Software Catalog</h3>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search software..." value={softwareSearch} onChange={(e) => setSoftwareSearch(e.target.value)} className="pl-9 w-full sm:w-64 text-foreground" />
                </div>
                {canWrite && (
                  <Button onClick={() => setShowSoftwareForm(true)} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />Add Software
                  </Button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedSoftware.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No software found</TableCell></TableRow>
                  ) : filteredAndSortedSoftware.map((sw) => (
                    <TableRow key={sw.id}>
                      <TableCell className="font-medium">{sw.name}</TableCell>
                      <TableCell><Badge variant="outline">{softwareCategoryLabels[sw.category] || sw.category}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{sw.vendor || "-"}</TableCell>
                      <TableCell>
                        {canWrite && (
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingSoftware(sw); setShowSoftwareForm(true); }}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeletingSoftware(sw)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
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
            authorities={issuingAuthorities}
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

      {/* Filing Type Dialog */}
      <Dialog open={showFilingTypeForm} onOpenChange={() => { setShowFilingTypeForm(false); setEditingFilingType(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingFilingType ? "Edit Filing Type" : "Add Filing Type"}</DialogTitle>
          </DialogHeader>
          <FilingTypeForm
            item={editingFilingType}
            onSubmit={handleFilingTypeSubmit}
            onCancel={() => { setShowFilingTypeForm(false); setEditingFilingType(null); }}
            isLoading={createFilingTypeMutation.isPending || updateFilingTypeMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Document Type Dialog */}
      <Dialog open={showDocTypeForm} onOpenChange={() => { setShowDocTypeForm(false); setEditingDocType(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingDocType ? "Edit Document Type" : "Add Document Type"}</DialogTitle>
          </DialogHeader>
          <DocumentTypeForm
            item={editingDocType}
            onSubmit={handleDocTypeSubmit}
            onCancel={() => { setShowDocTypeForm(false); setEditingDocType(null); }}
            isLoading={createDocTypeMutation.isPending || updateDocTypeMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Software Catalog Dialog */}
      <Dialog open={showSoftwareForm} onOpenChange={() => { setShowSoftwareForm(false); setEditingSoftware(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSoftware ? "Edit Software" : "Add Software"}</DialogTitle>
          </DialogHeader>
          <SoftwareCatalogForm
            item={editingSoftware}
            onSubmit={(data) => {
              const payload = { ...data, vendor: data.vendor || null, website: data.website || null, description: data.description || null };
              if (editingSoftware) {
                updateSoftwareMutation.mutate({ id: editingSoftware.id, ...payload }, { onSuccess: () => { setShowSoftwareForm(false); setEditingSoftware(null); }});
              } else {
                createSoftwareMutation.mutate(payload, { onSuccess: () => setShowSoftwareForm(false) });
              }
            }}
            onCancel={() => { setShowSoftwareForm(false); setEditingSoftware(null); }}
            isLoading={createSoftwareMutation.isPending || updateSoftwareMutation.isPending}
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

      <DeleteConfirmDialog
        open={!!deletingFilingType}
        onOpenChange={() => setDeletingFilingType(null)}
        onConfirm={() => {
          if (deletingFilingType) deleteFilingTypeMutation.mutate(deletingFilingType.id, { onSuccess: () => setDeletingFilingType(null) });
        }}
        title="Delete Filing Type"
        description={`Are you sure you want to delete "${deletingFilingType?.code} - ${deletingFilingType?.name}"? This may affect existing filings using this type.`}
        isLoading={deleteFilingTypeMutation.isPending}
      />

      <DeleteConfirmDialog
        open={!!deletingDocType}
        onOpenChange={() => setDeletingDocType(null)}
        onConfirm={() => {
          if (deletingDocType) deleteDocTypeMutation.mutate(deletingDocType.id, { onSuccess: () => setDeletingDocType(null) });
        }}
        title="Delete Document Type"
        description={`Are you sure you want to delete "${deletingDocType?.code} - ${deletingDocType?.name}"? This may affect existing documents using this type.`}
        isLoading={deleteDocTypeMutation.isPending}
      />

      <DeleteConfirmDialog
        open={!!deletingSoftware}
        onOpenChange={() => setDeletingSoftware(null)}
        onConfirm={() => {
          if (deletingSoftware) deleteSoftwareMutation.mutate(deletingSoftware.id, { onSuccess: () => setDeletingSoftware(null) });
        }}
        title="Delete Software"
        description={`Are you sure you want to delete "${deletingSoftware?.name}"? Entities using this software will show custom name instead.`}
        isLoading={deleteSoftwareMutation.isPending}
      />
    </div>
  );
};

export default SettingsSection;
