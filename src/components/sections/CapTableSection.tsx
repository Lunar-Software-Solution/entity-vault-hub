import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEntities } from "@/hooks/usePortalData";
import { useEnrichAndSaveProfile } from "@/hooks/useProfileEnrichment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Plus, SquarePen, Trash2, Search, PieChart, Users, Layers, ArrowRightLeft, 
  TrendingUp, DollarSign, Percent, Linkedin, MoreVertical, RefreshCw
} from "lucide-react";
import ShareClassForm from "@/components/captable/ShareClassForm";
import ShareholderForm from "@/components/captable/ShareholderForm";
import TransactionForm from "@/components/captable/TransactionForm";
import CapTableOverview from "@/components/captable/CapTableOverview";
import GravatarAvatar from "@/components/shared/GravatarAvatar";

// Types
interface ShareClass {
  id: string;
  entity_id: string;
  name: string;
  class_type: string;
  authorized_shares: number;
  par_value: number | null;
  voting_rights: boolean;
  votes_per_share: number | null;
  liquidation_preference: number | null;
  seniority: number | null;
  notes: string | null;
  created_at: string;
}

interface ShareholderEntityLink {
  id: string;
  entity_id: string;
  entity: {
    id: string;
    name: string;
    website: string | null;
  } | null;
}

interface Shareholder {
  id: string;
  entity_id: string;
  name: string;
  shareholder_type: string;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  address: string | null;
  tax_id: string | null;
  is_founder: boolean;
  is_board_member: boolean;
  notes: string | null;
  created_at: string;
  entity_links?: ShareholderEntityLink[];
}

interface EquityTransaction {
  id: string;
  entity_id: string;
  shareholder_id: string;
  share_class_id: string;
  transaction_type: string;
  shares: number;
  price_per_share: number;
  total_amount: number;
  transaction_date: string;
  certificate_number: string | null;
  notes: string | null;
  created_at: string;
}

// Hooks
const useShareClasses = (entityId?: string) => {
  return useQuery({
    queryKey: ["share_classes", entityId],
    queryFn: async () => {
      let query = supabase.from("share_classes").select("*").order("seniority", { ascending: true });
      if (entityId) query = query.eq("entity_id", entityId);
      const { data, error } = await query;
      if (error) throw error;
      return data as ShareClass[];
    },
  });
};

const useShareholders = (entityId?: string) => {
  return useQuery({
    queryKey: ["shareholders", entityId],
    queryFn: async () => {
      let query = supabase.from("shareholders").select("*").order("name");
      if (entityId) query = query.eq("entity_id", entityId);
      const { data: shareholders, error } = await query;
      if (error) throw error;

      // Fetch all entity links for shareholders
      const { data: links, error: linksError } = await supabase
        .from("shareholder_entity_links")
        .select(`
          id,
          shareholder_id,
          entity_id,
          entity:entities(id, name, website)
        `);
      if (linksError) console.error("Error fetching shareholder entity links:", linksError);

      // Merge links into shareholders
      const shareholdersWithLinks = shareholders.map(shareholder => ({
        ...shareholder,
        entity_links: (links || [])
          .filter(link => link.shareholder_id === shareholder.id)
          .map(link => ({
            id: link.id,
            entity_id: link.entity_id,
            entity: link.entity as { id: string; name: string; website: string | null } | null,
          })),
      }));

      return shareholdersWithLinks as Shareholder[];
    },
  });
};

const useEquityTransactions = (entityId?: string) => {
  return useQuery({
    queryKey: ["equity_transactions", entityId],
    queryFn: async () => {
      let query = supabase.from("equity_transactions").select("*").order("transaction_date", { ascending: false });
      if (entityId) query = query.eq("entity_id", entityId);
      const { data, error } = await query;
      if (error) throw error;
      return data as EquityTransaction[];
    },
  });
};

const CapTableSection = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedEntityId, setSelectedEntityId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form states
  const [showShareClassForm, setShowShareClassForm] = useState(false);
  const [showShareholderForm, setShowShareholderForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingShareClass, setEditingShareClass] = useState<ShareClass | null>(null);
  const [editingShareholder, setEditingShareholder] = useState<Shareholder | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<EquityTransaction | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ type: string; item: any } | null>(null);
  const [enrichingId, setEnrichingId] = useState<string | null>(null);

  const { data: entities } = useEntities();
  const { data: shareClasses, isLoading: classesLoading } = useShareClasses(selectedEntityId || undefined);
  const { data: shareholders, isLoading: shareholdersLoading } = useShareholders(selectedEntityId || undefined);
  const { data: transactions, isLoading: transactionsLoading } = useEquityTransactions(selectedEntityId || undefined);
  const enrichMutation = useEnrichAndSaveProfile();

  // Mutations
  const createShareClass = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("share_classes").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["share_classes"] });
      toast.success("Share class created");
      setShowShareClassForm(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateShareClass = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from("share_classes").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["share_classes"] });
      toast.success("Share class updated");
      setShowShareClassForm(false);
      setEditingShareClass(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteShareClass = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("share_classes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["share_classes"] });
      toast.success("Share class deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createShareholder = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("shareholders").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shareholders"] });
      toast.success("Shareholder created");
      setShowShareholderForm(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateShareholder = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from("shareholders").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shareholders"] });
      toast.success("Shareholder updated");
      setShowShareholderForm(false);
      setEditingShareholder(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteShareholder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shareholders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shareholders"] });
      toast.success("Shareholder deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createTransaction = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("equity_transactions").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equity_transactions"] });
      toast.success("Transaction recorded");
      setShowTransactionForm(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("equity_transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equity_transactions"] });
      toast.success("Transaction deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleDelete = () => {
    if (!deletingItem) return;
    const { type, item } = deletingItem;
    switch (type) {
      case "share_class":
        deleteShareClass.mutate(item.id, { onSuccess: () => setDeletingItem(null) });
        break;
      case "shareholder":
        deleteShareholder.mutate(item.id, { onSuccess: () => setDeletingItem(null) });
        break;
      case "transaction":
        deleteTransaction.mutate(item.id, { onSuccess: () => setDeletingItem(null) });
        break;
    }
  };

  const handleReEnrichShareholder = async (shareholder: Shareholder) => {
    // LinkedIn URL is required for Coresignal enrichment
    if (!shareholder.linkedin_url) {
      toast.error("LinkedIn URL is required for profile enrichment");
      return;
    }
    
    setEnrichingId(shareholder.id);
    try {
      const result = await enrichMutation.mutateAsync({
        email: shareholder.email,
        linkedin_url: shareholder.linkedin_url,
        name: shareholder.name,
        recordId: shareholder.id,
        tableName: "shareholders",
      });
      
      if (result?.avatar_url) {
        toast.success("Profile enriched successfully!");
      } else {
        toast.info("Enrichment completed, but no avatar found");
      }
    } catch (error) {
      toast.error("Failed to enrich profile");
    } finally {
      setEnrichingId(null);
    }
  };

  const getEntityName = (entityId: string) => entities?.find(e => e.id === entityId)?.name || "Unknown";
  const getShareholderName = (id: string) => shareholders?.find(s => s.id === id)?.name || "Unknown";
  const getShareClassName = (id: string) => shareClasses?.find(c => c.id === id)?.name || "Unknown";

  const filteredShareholders = useMemo(() => {
    if (!shareholders) return [];
    if (!searchQuery.trim()) return shareholders;
    const q = searchQuery.toLowerCase();
    return shareholders.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.email?.toLowerCase().includes(q)
    );
  }, [shareholders, searchQuery]);

  const isLoading = classesLoading || shareholdersLoading || transactionsLoading;

  if (isLoading && !shareClasses && !shareholders) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Cap Table</h2>
          <p className="text-muted-foreground">Manage shareholders, share classes, and equity transactions</p>
        </div>
        <Select value={selectedEntityId} onValueChange={setSelectedEntityId}>
          <SelectTrigger className="w-[250px] bg-background">
            <SelectValue placeholder="Select an entity" />
          </SelectTrigger>
          <SelectContent className="bg-background">
            <SelectItem value="__all__">All Entities</SelectItem>
            {entities?.map((entity) => (
              <SelectItem key={entity.id} value={entity.id}>{entity.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <PieChart className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="shareholders" className="gap-2">
            <Users className="w-4 h-4" />
            Shareholders
          </TabsTrigger>
          <TabsTrigger value="share-classes" className="gap-2">
            <Layers className="w-4 h-4" />
            Share Classes
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            <ArrowRightLeft className="w-4 h-4" />
            Transactions
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <CapTableOverview 
            entityId={selectedEntityId === "__all__" ? undefined : selectedEntityId}
            shareClasses={shareClasses || []}
            shareholders={shareholders || []}
            transactions={transactions || []}
            entities={entities || []}
          />
        </TabsContent>

        {/* Shareholders Tab */}
        <TabsContent value="shareholders" className="mt-6">
          <div className="glass-card rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search shareholders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={() => setShowShareholderForm(true)} className="gap-2 ml-auto">
                <Plus className="w-4 h-4" />
                Add Shareholder
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">Name</TableHead>
                  <TableHead className="text-foreground">Type</TableHead>
                  <TableHead className="text-foreground">Entity</TableHead>
                  <TableHead className="text-foreground">Email</TableHead>
                  <TableHead className="text-foreground">Role</TableHead>
                  <TableHead className="text-foreground w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShareholders.map((shareholder) => (
                  <TableRow key={shareholder.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <GravatarAvatar
                          email={shareholder.email}
                          name={shareholder.name}
                          size="sm"
                          linkedinUrl={shareholder.linkedin_url}
                        />
                        <span className="font-medium text-foreground">{shareholder.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{shareholder.shareholder_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-foreground">
                        {shareholder.entity_links && shareholder.entity_links.length > 0 
                          ? shareholder.entity_links.map(link => link.entity?.name || "Unknown").join(", ")
                          : getEntityName(shareholder.entity_id)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{shareholder.email || "—"}</span>
                        {shareholder.linkedin_url && (
                          <a
                            href={shareholder.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0A66C2] hover:text-[#0A66C2]/80"
                            title="View LinkedIn"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {shareholder.is_founder && (
                          <Badge className="bg-green-600 hover:bg-green-600 text-white border-0">Founder</Badge>
                        )}
                        {shareholder.is_board_member && (
                          <Badge variant="secondary" className="bg-muted text-foreground border border-border">Board</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingShareholder(shareholder); setShowShareholderForm(true); }}>
                            <SquarePen className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletingItem({ type: "shareholder", item: shareholder })}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {!filteredShareholders.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No shareholders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Share Classes Tab */}
        <TabsContent value="share-classes" className="mt-6">
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Share Classes</h3>
              <Button onClick={() => setShowShareClassForm(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Share Class
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">Name</TableHead>
                  <TableHead className="text-foreground">Type</TableHead>
                  <TableHead className="text-foreground">Entity</TableHead>
                  <TableHead className="text-foreground">Authorized</TableHead>
                  <TableHead className="text-foreground">Par Value</TableHead>
                  <TableHead className="text-foreground">Voting</TableHead>
                  <TableHead className="text-foreground w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shareClasses?.map((sc) => (
                  <TableRow key={sc.id}>
                    <TableCell className="font-medium text-foreground">{sc.name}</TableCell>
                    <TableCell>
                      <Badge variant={sc.class_type === "preferred" ? "default" : "secondary"}>
                        {sc.class_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{getEntityName(sc.entity_id)}</TableCell>
                    <TableCell className="text-muted-foreground">{sc.authorized_shares.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">${sc.par_value?.toFixed(4) || "0.0001"}</TableCell>
                    <TableCell>
                      <Badge variant={sc.voting_rights ? "default" : "outline"}>
                        {sc.voting_rights ? `${sc.votes_per_share || 1}x` : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary" onClick={() => { setEditingShareClass(sc); setShowShareClassForm(true); }}>
                          <SquarePen className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeletingItem({ type: "share_class", item: sc })}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!shareClasses?.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No share classes defined
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="mt-6">
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Equity Transactions</h3>
              <Button onClick={() => setShowTransactionForm(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Record Transaction
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">Date</TableHead>
                  <TableHead className="text-foreground">Type</TableHead>
                  <TableHead className="text-foreground">Shareholder</TableHead>
                  <TableHead className="text-foreground">Share Class</TableHead>
                  <TableHead className="text-foreground">Shares</TableHead>
                  <TableHead className="text-foreground">Price/Share</TableHead>
                  <TableHead className="text-foreground">Total</TableHead>
                  <TableHead className="text-foreground w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(tx.transaction_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tx.transaction_type === "issuance" ? "default" : "secondary"}>
                        {tx.transaction_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{getShareholderName(tx.shareholder_id)}</TableCell>
                    <TableCell className="text-muted-foreground">{getShareClassName(tx.share_class_id)}</TableCell>
                    <TableCell className="text-muted-foreground">{tx.shares.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">${tx.price_per_share.toFixed(4)}</TableCell>
                    <TableCell className="font-medium text-foreground">${tx.total_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeletingItem({ type: "transaction", item: tx })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!transactions?.length && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No transactions recorded
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showShareClassForm} onOpenChange={(open) => { if (!open) { setShowShareClassForm(false); setEditingShareClass(null); } }}>
        <DialogContent className="max-w-lg bg-background">
          <DialogHeader>
            <DialogTitle>{editingShareClass ? "Edit Share Class" : "Add Share Class"}</DialogTitle>
          </DialogHeader>
          <ShareClassForm
            item={editingShareClass}
            entities={entities || []}
            onSubmit={(data) => editingShareClass ? updateShareClass.mutate({ id: editingShareClass.id, ...data }) : createShareClass.mutate(data)}
            onCancel={() => { setShowShareClassForm(false); setEditingShareClass(null); }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showShareholderForm} onOpenChange={(open) => { if (!open) { setShowShareholderForm(false); setEditingShareholder(null); } }}>
        <DialogContent className="max-w-lg bg-background">
          <DialogHeader>
            <DialogTitle>{editingShareholder ? "Edit Shareholder" : "Add Shareholder"}</DialogTitle>
          </DialogHeader>
          <ShareholderForm
            item={editingShareholder}
            entities={entities || []}
            onSubmit={(data) => editingShareholder ? updateShareholder.mutate({ id: editingShareholder.id, ...data }) : createShareholder.mutate(data)}
            onCancel={() => { setShowShareholderForm(false); setEditingShareholder(null); }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showTransactionForm} onOpenChange={(open) => { if (!open) { setShowTransactionForm(false); setEditingTransaction(null); } }}>
        <DialogContent className="max-w-lg bg-background">
          <DialogHeader>
            <DialogTitle>Record Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm
            entities={entities || []}
            shareholders={shareholders || []}
            shareClasses={shareClasses || []}
            onSubmit={(data) => createTransaction.mutate(data)}
            onCancel={() => setShowTransactionForm(false)}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={handleDelete}
        title={`Delete ${deletingItem?.type.replace("_", " ")}`}
        description={`Are you sure you want to delete this ${deletingItem?.type.replace("_", " ")}? This action cannot be undone.`}
      />
    </div>
  );
};

export default CapTableSection;
