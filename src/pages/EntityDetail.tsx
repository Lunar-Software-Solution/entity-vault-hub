import { useParams, useNavigate } from "react-router-dom";
import { 
  useEntities, 
  useBankAccounts, 
  useCreditCards, 
  useAddresses, 
  useContracts 
} from "@/hooks/usePortalData";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone, 
  Globe,
  Wallet,
  CreditCard,
  FileText,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import LinkedBankAccounts from "@/components/entity-detail/LinkedBankAccounts";
import LinkedCreditCards from "@/components/entity-detail/LinkedCreditCards";
import LinkedAddresses from "@/components/entity-detail/LinkedAddresses";
import LinkedContracts from "@/components/entity-detail/LinkedContracts";

const EntityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: entities, isLoading: entitiesLoading } = useEntities();
  const { data: bankAccounts, isLoading: bankLoading } = useBankAccounts();
  const { data: creditCards, isLoading: cardsLoading } = useCreditCards();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const { data: contracts, isLoading: contractsLoading } = useContracts();

  const entity = entities?.find(e => e.id === id);
  const linkedBankAccounts = bankAccounts?.filter(b => b.entity_id === id) ?? [];
  const linkedCreditCards = creditCards?.filter(c => c.entity_id === id) ?? [];
  const linkedAddresses = addresses?.filter(a => a.entity_id === id) ?? [];
  const linkedContracts = contracts?.filter(c => c.entity_id === id) ?? [];

  const isLoading = entitiesLoading || bankLoading || cardsLoading || addressesLoading || contractsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Skeleton className="h-10 w-32 mb-8" />
        <Skeleton className="h-48 w-full rounded-xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-8 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </Button>
        <div className="glass-card rounded-xl p-12 text-center">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Entity not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <Button variant="ghost" onClick={() => navigate("/")} className="mb-8 gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Portal
      </Button>

      {/* Entity Header */}
      <div className="glass-card rounded-xl p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
            <Building2 className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{entity.name}</h1>
            <p className="text-muted-foreground text-lg">{entity.type}</p>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <Badge variant={entity.status === "Active" ? "default" : "secondary"}>
                {entity.status}
              </Badge>
              {entity.is_verified && (
                <Badge variant="outline">Verified</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Entity Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Founded</span>
            </div>
            <p className="text-foreground font-medium">
              {entity.founded_date 
                ? format(new Date(entity.founded_date), "MMM d, yyyy")
                : "Not specified"}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Jurisdiction</span>
            </div>
            <p className="text-foreground font-medium">{entity.jurisdiction || "Not specified"}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span className="text-sm">Email</span>
            </div>
            <p className="text-foreground font-medium">{entity.email || "Not specified"}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span className="text-sm">Phone</span>
            </div>
            <p className="text-foreground font-medium">{entity.phone || "Not specified"}</p>
          </div>
        </div>

        {entity.website && (
          <div className="mt-6 pt-6 border-t border-border">
            <a 
              href={entity.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <Globe className="w-4 h-4" />
              {entity.website}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Identification Numbers */}
        {(entity.ein_tax_id || entity.registration_number || entity.duns_number) && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Identification
            </h4>
            <div className="flex flex-wrap gap-4">
              {entity.ein_tax_id && (
                <div className="bg-muted/50 rounded-lg px-4 py-2">
                  <p className="text-xs text-muted-foreground">EIN/Tax ID</p>
                  <p className="font-mono text-foreground">{entity.ein_tax_id}</p>
                </div>
              )}
              {entity.registration_number && (
                <div className="bg-muted/50 rounded-lg px-4 py-2">
                  <p className="text-xs text-muted-foreground">Registration #</p>
                  <p className="font-mono text-foreground">{entity.registration_number}</p>
                </div>
              )}
              {entity.duns_number && (
                <div className="bg-muted/50 rounded-lg px-4 py-2">
                  <p className="text-xs text-muted-foreground">DUNS #</p>
                  <p className="font-mono text-foreground">{entity.duns_number}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-xl p-4 text-center">
          <Wallet className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{linkedBankAccounts.length}</p>
          <p className="text-sm text-muted-foreground">Bank Accounts</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <CreditCard className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{linkedCreditCards.length}</p>
          <p className="text-sm text-muted-foreground">Credit Cards</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{linkedAddresses.length}</p>
          <p className="text-sm text-muted-foreground">Addresses</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <FileText className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{linkedContracts.length}</p>
          <p className="text-sm text-muted-foreground">Contracts</p>
        </div>
      </div>

      {/* Linked Data Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LinkedBankAccounts accounts={linkedBankAccounts} />
        <LinkedCreditCards cards={linkedCreditCards} />
        <LinkedAddresses addresses={linkedAddresses} />
        <LinkedContracts contracts={linkedContracts} />
      </div>
    </div>
  );
};

export default EntityDetail;
