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

  type AppRole = "admin" | "moderator" | "member" | "viewer";
  
  const hasRole = (role: AppRole) => roles?.includes(role) ?? false;
  
  const isAdmin = hasRole("admin");
  const isModerator = hasRole("moderator");
  const isMember = hasRole("member");
  const isViewer = hasRole("viewer");
  
  // Check if user can write (not a viewer-only user)
  const canWrite = !isLoading && (isAdmin || isModerator || isMember || !isViewer);
  
  // Get highest role
  const primaryRole = isAdmin ? "admin" : isModerator ? "moderator" : isMember ? "member" : isViewer ? "viewer" : "member";

  return {
    roles: roles ?? [],
    isLoading,
    hasRole,
    isAdmin,
    isModerator,
    isMember,
    isViewer,
    canWrite,
    primaryRole,
  };
};
