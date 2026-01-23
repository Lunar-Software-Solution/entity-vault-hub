import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useUserRole = () => {
  const { user } = useAuth();

  const { data: roles, isLoading } = useQuery({
    queryKey: ["user_roles", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (error) throw error;
      return data.map(r => r.role);
    },
    enabled: !!user?.id,
  });

  type AppRole = "admin" | "viewer";
  
  const hasRole = (role: AppRole) => roles?.includes(role) ?? false;
  
  const isAdmin = hasRole("admin");
  const isViewer = hasRole("viewer");
  
  // Check if user can write (only admins can write)
  const canWrite = !isLoading && isAdmin;
  
  // Get primary role
  const primaryRole = isAdmin ? "admin" : "viewer";

  return {
    roles: roles ?? [],
    isLoading,
    hasRole,
    isAdmin,
    isViewer,
    canWrite,
    primaryRole,
  };
};
