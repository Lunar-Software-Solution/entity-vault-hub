import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Building2, Wallet, CreditCard, MapPin, FileText, Share2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEntities, useBankAccounts, useCreditCards, useAddresses, useContracts, useSocialMediaAccounts } from "@/hooks/usePortalData";
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  onNavigate: (section: string) => void;
}

type SearchResult = {
  id: string;
  type: "entity" | "bank" | "card" | "address" | "contract" | "social";
  title: string;
  subtitle: string;
  icon: typeof Building2;
};

const GlobalSearch = ({ onNavigate }: GlobalSearchProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { data: entities } = useEntities();
  const { data: bankAccounts } = useBankAccounts();
  const { data: creditCards } = useCreditCards();
  const { data: addresses } = useAddresses();
  const { data: contracts } = useContracts();
  const { data: socialAccounts } = useSocialMediaAccounts();

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const matched: SearchResult[] = [];

    // Search entities
    entities?.forEach((e) => {
      if (
        e.name.toLowerCase().includes(lowerQuery) ||
        e.type.toLowerCase().includes(lowerQuery) ||
        e.jurisdiction?.toLowerCase().includes(lowerQuery)
      ) {
        matched.push({
          id: e.id,
          type: "entity",
          title: e.name,
          subtitle: e.type,
          icon: Building2,
        });
      }
    });

    // Search bank accounts
    bankAccounts?.forEach((b) => {
      if (
        b.name.toLowerCase().includes(lowerQuery) ||
        b.bank.toLowerCase().includes(lowerQuery) ||
        b.account_number.includes(lowerQuery)
      ) {
        matched.push({
          id: b.id,
          type: "bank",
          title: b.name,
          subtitle: `${b.bank} • ****${b.account_number.slice(-4)}`,
          icon: Wallet,
        });
      }
    });

    // Search credit cards
    creditCards?.forEach((c) => {
      if (
        c.name.toLowerCase().includes(lowerQuery) ||
        c.card_number.includes(lowerQuery) ||
        c.cardholder_name?.toLowerCase().includes(lowerQuery)
      ) {
        matched.push({
          id: c.id,
          type: "card",
          title: c.name,
          subtitle: `****${c.card_number.slice(-4)}`,
          icon: CreditCard,
        });
      }
    });

    // Search addresses
    addresses?.forEach((a) => {
      if (
        a.label.toLowerCase().includes(lowerQuery) ||
        a.street.toLowerCase().includes(lowerQuery) ||
        a.city.toLowerCase().includes(lowerQuery)
      ) {
        matched.push({
          id: a.id,
          type: "address",
          title: a.label,
          subtitle: `${a.city}, ${a.country}`,
          icon: MapPin,
        });
      }
    });

    // Search contracts
    contracts?.forEach((c) => {
      if (
        c.title.toLowerCase().includes(lowerQuery) ||
        c.type.toLowerCase().includes(lowerQuery)
      ) {
        matched.push({
          id: c.id,
          type: "contract",
          title: c.title,
          subtitle: c.type,
          icon: FileText,
        });
      }
    });

    // Search social accounts
    socialAccounts?.forEach((s) => {
      if (
        s.platform.toLowerCase().includes(lowerQuery) ||
        s.username.toLowerCase().includes(lowerQuery)
      ) {
        matched.push({
          id: s.id,
          type: "social",
          title: `@${s.username}`,
          subtitle: s.platform,
          icon: Share2,
        });
      }
    });

    return matched.slice(0, 10);
  }, [query, entities, bankAccounts, creditCards, addresses, contracts, socialAccounts]);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery("");

    switch (result.type) {
      case "entity":
        navigate(`/entity/${result.id}`);
        break;
      case "bank":
        onNavigate("bank-accounts");
        break;
      case "card":
        onNavigate("credit-cards");
        break;
      case "address":
        onNavigate("addresses");
        break;
      case "contract":
        onNavigate("contracts");
        break;
      case "social":
        onNavigate("social-media");
        break;
    }
  };

  const typeLabels: Record<SearchResult["type"], string> = {
    entity: "Entity",
    bank: "Bank Account",
    card: "Credit Card",
    address: "Address",
    contract: "Contract",
    social: "Social Media",
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors w-full max-w-sm"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm">Search across all sections...</span>
        <kbd className="ml-auto hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden [&>button]:hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="sr-only">Global Search</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search entities, accounts, cards, addresses..."
              className="border-0 p-0 h-auto text-lg focus-visible:ring-0 bg-transparent"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {query && results.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No results found for "{query}"</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-1">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left",
                      "hover:bg-muted transition-colors"
                    )}
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <result.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {typeLabels[result.type]}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {!query && (
              <div className="py-8 text-center text-muted-foreground">
                <p className="text-sm">Start typing to search...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GlobalSearch;
