import { useState } from "react";
import { RefreshCw, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface SyncResult {
  success: boolean;
  fetched?: number;
  inserted?: number;
  updated?: number;
  message?: string;
  error?: string;
}

const DocuSealSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);
  const queryClient = useQueryClient();

  const handleSync = async () => {
    setIsSyncing(true);
    setLastResult(null);

    try {
      const { data, error } = await supabase.functions.invoke<SyncResult>(
        "fetch-docuseal-contracts",
        {
          body: { status: "all", limit: 100 },
        }
      );

      if (error) throw error;

      if (data?.success) {
        setLastResult(data);
        toast.success(data.message || "Contracts synced successfully");
        // Invalidate contracts query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["contracts"] });
      } else {
        throw new Error(data?.error || "Sync failed");
      }
    } catch (error) {
      console.error("DocuSeal sync error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to sync contracts";
      setLastResult({ success: false, error: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        disabled={isSyncing}
        className="gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
        {isSyncing ? "Syncing..." : "Sync from DocuSeal"}
      </Button>
      
      {lastResult && (
        <div className="flex items-center gap-1.5 text-xs">
          {lastResult.success ? (
            <>
              <Check className="w-3.5 h-3.5 text-success" />
              <span className="text-muted-foreground">
                {lastResult.inserted || 0} new, {lastResult.updated || 0} updated
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-destructive" />
              <span className="text-destructive text-xs">Sync failed</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DocuSealSync;
