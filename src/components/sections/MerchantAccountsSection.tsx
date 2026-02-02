import { useState, useMemo } from "react";
import { Store, Plus, Pencil, Trash2, ExternalLink, ArrowUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMerchantAccounts, useEntities, usePaymentProviders, useBankAccounts, type MerchantAccount } from "@/hooks/usePortalData";
import { useCreateMerchantAccount, useUpdateMerchantAccount, useDeleteMerchantAccount } from "@/hooks/usePortalMutations";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { useUserRole } from "@/hooks/useUserRole";

interface MerchantAccountsSectionProps {
  entityFilter?: string | null;
}

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "CNY", "INR", "MXN", "BRL", "SGD", "HKD", "NZD", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF"];

const MerchantAccountsSection = ({ entityFilter }: MerchantAccountsSectionProps) => {
  const { data: merchantAccounts, isLoading } = useMerchantAccounts();
  const { data: entities } = useEntities();
  const { data: providers } = usePaymentProviders();
  const { data: bankAccounts } = useBankAccounts();
  const { isAdmin } = useUserRole();
  
  const createMutation = useCreateMerchantAccount();
  const updateMutation = useUpdateMerchantAccount();
  const deleteMutation = useDeleteMerchantAccount();

  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<MerchantAccount | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<MerchantAccount | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "provider" | "entity">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    entity_id: "",
    provider_id: "",
    merchant_id: "",
    api_key_masked: "",
    processing_currencies: [] as string[],
    fee_structure: "",
    settlement_currency: "USD",
    settlement_bank_account_id: "",
    is_primary: false,
    is_active: true,
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      entity_id: "",
      provider_id: "",
      merchant_id: "",
      api_key_masked: "",
      processing_currencies: [],
      fee_structure: "",
      settlement_currency: "USD",
      settlement_bank_account_id: "",
      is_primary: false,
      is_active: true,
      notes: "",
    });
    setEditingAccount(null);
  };

  const handleOpenForm = (account?: MerchantAccount) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        entity_id: account.entity_id || "",
        provider_id: account.provider_id || "",
        merchant_id: account.merchant_id || "",
        api_key_masked: account.api_key_masked || "",
        processing_currencies: account.processing_currencies || [],
        fee_structure: account.fee_structure || "",
        settlement_currency: account.settlement_currency || "USD",
        settlement_bank_account_id: account.settlement_bank_account_id || "",
        is_primary: account.is_primary || false,
        is_active: account.is_active ?? true,
        notes: account.notes || "",
      });
    } else {
      resetForm();
    }
    setShowForm(true);
  };

  const handleSubmit = async () => {
    const payload = {
      name: formData.name,
      entity_id: formData.entity_id || null,
      provider_id: formData.provider_id || null,
      merchant_id: formData.merchant_id || null,
      api_key_masked: formData.api_key_masked || null,
      processing_currencies: formData.processing_currencies,
      fee_structure: formData.fee_structure || null,
      settlement_currency: formData.settlement_currency,
      settlement_bank_account_id: formData.settlement_bank_account_id || null,
      is_primary: formData.is_primary,
      is_active: formData.is_active,
      notes: formData.notes || null,
    };

    if (editingAccount) {
      await updateMutation.mutateAsync({ id: editingAccount.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setShowForm(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (deletingAccount) {
      await deleteMutation.mutateAsync(deletingAccount.id);
      setDeletingAccount(null);
    }
  };

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const getProviderName = (providerId: string | null) => {
    if (!providerId) return "-";
    return providers?.find(p => p.id === providerId)?.name || "-";
  };

  const getEntityName = (entityId: string | null) => {
    if (!entityId) return "-";
    return entities?.find(e => e.id === entityId)?.name || "-";
  };

  const getBankAccountName = (bankId: string | null) => {
    if (!bankId) return "-";
    return bankAccounts?.find(b => b.id === bankId)?.name || "-";
  };

  const filteredAndSortedAccounts = useMemo(() => {
    let result = merchantAccounts || [];
    
    // Apply entity filter
    if (entityFilter) {
      result = result.filter(a => a.entity_id === entityFilter);
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.name.toLowerCase().includes(query) ||
        getProviderName(a.provider_id).toLowerCase().includes(query) ||
        getEntityName(a.entity_id).toLowerCase().includes(query) ||
        (a.merchant_id && a.merchant_id.toLowerCase().includes(query))
      );
    }
    
    // Sort
    result = [...result].sort((a, b) => {
      let aVal = "", bVal = "";
      if (sortKey === "name") {
        aVal = a.name;
        bVal = b.name;
      } else if (sortKey === "provider") {
        aVal = getProviderName(a.provider_id);
        bVal = getProviderName(b.provider_id);
      } else if (sortKey === "entity") {
        aVal = getEntityName(a.entity_id);
        bVal = getEntityName(b.entity_id);
      }
      return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    
    return result;
  }, [merchantAccounts, entityFilter, searchQuery, sortKey, sortDirection, providers, entities]);

  const toggleCurrency = (currency: string) => {
    setFormData(prev => ({
      ...prev,
      processing_currencies: prev.processing_currencies.includes(currency)
        ? prev.processing_currencies.filter(c => c !== currency)
        : [...prev.processing_currencies, currency]
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Merchant Accounts</CardTitle>
              <CardDescription>Manage payment processing accounts</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-64"
            />
            {isAdmin && (
              <Button onClick={() => handleOpenForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredAndSortedAccounts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No merchant accounts found</p>
              {isAdmin && (
                <Button variant="link" onClick={() => handleOpenForm()}>
                  Add your first merchant account
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("name")}>
                    Account Name <ArrowUpDown className="inline h-4 w-4 ml-1" />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("provider")}>
                    Provider <ArrowUpDown className="inline h-4 w-4 ml-1" />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("entity")}>
                    Entity <ArrowUpDown className="inline h-4 w-4 ml-1" />
                  </TableHead>
                  <TableHead>Merchant ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedAccounts.map(account => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {account.name}
                        {account.is_primary && (
                          <Badge variant="secondary" className="text-xs">Primary</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getProviderName(account.provider_id)}</TableCell>
                    <TableCell>{getEntityName(account.entity_id)}</TableCell>
                    <TableCell className="font-mono text-sm">{account.merchant_id || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={account.is_active ? "default" : "secondary"}>
                        {account.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {isAdmin && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenForm(account)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeletingAccount(account)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={open => { if (!open) { setShowForm(false); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAccount ? "Edit Merchant Account" : "Add Merchant Account"}</DialogTitle>
            <DialogDescription>
              {editingAccount ? "Update the merchant account details" : "Add a new payment processing account"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Account Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Main Stripe Account"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select value={formData.provider_id} onValueChange={v => setFormData(prev => ({ ...prev, provider_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers?.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entity">Entity</Label>
                <Select value={formData.entity_id} onValueChange={v => setFormData(prev => ({ ...prev, entity_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {entities?.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="merchant_id">Merchant ID</Label>
                <Input
                  id="merchant_id"
                  value={formData.merchant_id}
                  onChange={e => setFormData(prev => ({ ...prev, merchant_id: e.target.value }))}
                  placeholder="acct_xxx..."
                  className="font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="api_key">API Key (masked)</Label>
                <Input
                  id="api_key"
                  value={formData.api_key_masked}
                  onChange={e => setFormData(prev => ({ ...prev, api_key_masked: e.target.value }))}
                  placeholder="sk_live_...xxxx"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee_structure">Fee Structure</Label>
                <Input
                  id="fee_structure"
                  value={formData.fee_structure}
                  onChange={e => setFormData(prev => ({ ...prev, fee_structure: e.target.value }))}
                  placeholder="e.g., 2.9% + $0.30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="settlement_currency">Settlement Currency</Label>
                <Select value={formData.settlement_currency} onValueChange={v => setFormData(prev => ({ ...prev, settlement_currency: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="settlement_bank">Settlement Bank Account</Label>
                <Select value={formData.settlement_bank_account_id} onValueChange={v => setFormData(prev => ({ ...prev, settlement_bank_account_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank account (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts?.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Processing Currencies</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30">
                {CURRENCIES.slice(0, 10).map(currency => (
                  <Badge
                    key={currency}
                    variant={formData.processing_currencies.includes(currency) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleCurrency(currency)}
                  >
                    {formData.processing_currencies.includes(currency) && <Check className="h-3 w-3 mr-1" />}
                    {currency}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_primary"
                  checked={formData.is_primary}
                  onCheckedChange={v => setFormData(prev => ({ ...prev, is_primary: v }))}
                />
                <Label htmlFor="is_primary">Primary Account</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={v => setFormData(prev => ({ ...prev, is_active: v }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name || createMutation.isPending || updateMutation.isPending}>
              {editingAccount ? "Update" : "Add"} Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deletingAccount}
        onOpenChange={open => { if (!open) setDeletingAccount(null); }}
        onConfirm={handleDelete}
        title="Delete Merchant Account"
        description={`Are you sure you want to delete "${deletingAccount?.name}"? This action cannot be undone.`}
      />
    </>
  );
};

export default MerchantAccountsSection;
