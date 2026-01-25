import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Smartphone, Trash2, Monitor, RefreshCw } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

interface TrustedDevice {
  id: string;
  device_name: string;
  created_at: string;
  expires_at: string;
  last_used_at: string;
}

// Get local device token to identify current device
const getLocalDeviceToken = (): string | null => {
  return localStorage.getItem("trusted_device_token");
};

const TrustedDevicesSection = () => {
  const { toast } = useToast();
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<TrustedDevice | null>(null);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("list-trusted-devices");

      if (error) {
        console.error("Error fetching devices:", error);
        toast({
          variant: "destructive",
          title: "Failed to load devices",
          description: "Could not fetch trusted devices.",
        });
        return;
      }

      setDevices(data?.devices || []);
    } catch (err) {
      console.error("Error fetching devices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleRevoke = async () => {
    if (!deviceToDelete) return;

    setRevoking(deviceToDelete.id);
    try {
      const { data, error } = await supabase.functions.invoke("revoke-trusted-device", {
        body: { deviceId: deviceToDelete.id },
      });

      if (error || !data?.success) {
        toast({
          variant: "destructive",
          title: "Failed to revoke device",
          description: "Could not remove the trusted device.",
        });
        return;
      }

      setDevices((prev) => prev.filter((d) => d.id !== deviceToDelete.id));
      toast({
        title: "Device revoked",
        description: "The device will require 2FA on next login.",
      });
    } catch (err) {
      console.error("Error revoking device:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setRevoking(null);
      setDeleteDialogOpen(false);
      setDeviceToDelete(null);
    }
  };

  const openDeleteDialog = (device: TrustedDevice) => {
    setDeviceToDelete(device);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Smartphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No trusted devices</p>
        <p className="text-xs mt-1">
          Check "Remember this device" during 2FA to add devices here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          These devices can skip 2FA for 30 days.
        </p>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={fetchDevices}>
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {devices.map((device) => {
        const isCurrentDevice = false; // We don't expose the token in the response for security
        const expiresIn = formatDistanceToNow(new Date(device.expires_at), { addSuffix: true });
        const lastUsed = formatDistanceToNow(new Date(device.last_used_at), { addSuffix: true });

        return (
          <div
            key={device.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-muted">
                <Monitor className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{device.device_name}</span>
                  {isCurrentDevice && (
                    <Badge variant="secondary" className="text-xs">
                      This device
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last used {lastUsed} • Expires {expiresIn}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => openDeleteDialog(device)}
              disabled={revoking === device.id}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleRevoke}
        title="Revoke Trusted Device"
        description={`Are you sure you want to revoke "${deviceToDelete?.device_name}"? This device will require 2FA verification on the next login.`}
      />
    </div>
  );
};

export default TrustedDevicesSection;
