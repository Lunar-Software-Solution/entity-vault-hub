import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EnrichedProfile {
  name: string | null;
  email: string | null;
  linkedin_url: string | null;
  avatar_url: string | null;
  title: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
}

interface EnrichmentResponse {
  success: boolean;
  fallback: boolean;
  source?: string;
  data: EnrichedProfile;
  message?: string;
}

interface UseProfileEnrichmentOptions {
  email?: string | null;
  linkedin_url?: string | null;
  name?: string | null;
  enabled?: boolean;
  // Optional: provide record ID and table to auto-save enriched data
  recordId?: string;
  tableName?: "directors_ubos" | "shareholders";
}

export const useProfileEnrichment = ({
  email,
  linkedin_url,
  name,
  enabled = true,
  recordId,
  tableName,
}: UseProfileEnrichmentOptions) => {
  const queryClient = useQueryClient();

  return useQuery({
    // Include recordId so cache invalidates per-record for auto-save
    queryKey: ["profile-enrichment", email, linkedin_url, name, recordId],
    queryFn: async (): Promise<EnrichedProfile | null> => {
      // LinkedIn URL is required for Coresignal enrichment
      if (!linkedin_url) return null;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return null;

        const { data, error } = await supabase.functions.invoke<EnrichmentResponse>(
          "enrich-profile",
          {
            body: { email, linkedin_url, name },
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (error) {
          console.error("Profile enrichment error:", error);
          return null;
        }

        const enrichedData = data?.data || null;

        // Auto-save enriched data to database if recordId and tableName provided
        if (enrichedData && recordId && tableName) {
          const updatePayload: Record<string, string | null> = {};
          
          // Always update avatar_url if we got one
          if (enrichedData.avatar_url) {
            updatePayload.avatar_url = enrichedData.avatar_url;
          }
          
          // Update title if enriched (enrichment wins)
          if (enrichedData.title) {
            updatePayload.title = enrichedData.title;
          }
          
          // Update company and bio if available
          if (enrichedData.company) {
            updatePayload.company = enrichedData.company;
          }
          if (enrichedData.bio) {
            updatePayload.bio = enrichedData.bio;
          }

          if (Object.keys(updatePayload).length > 0) {
            console.log(`Auto-saving enriched data to ${tableName}:`, updatePayload);
            
            const { error: updateError } = await supabase
              .from(tableName)
              .update(updatePayload)
              .eq("id", recordId);

            if (updateError) {
              console.error("Failed to auto-save enriched data:", updateError);
            } else {
              // Invalidate the relevant query to refresh the UI
              queryClient.invalidateQueries({ queryKey: [tableName] });
            }
          }
        }

        return enrichedData;
      } catch (err) {
        console.error("Failed to enrich profile:", err);
        return null;
      }
    },
    enabled: enabled && !!linkedin_url,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 1,
  });
};

// Hook for manual enrichment trigger with database update
export const useEnrichAndSaveProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      email,
      linkedin_url,
      name,
      recordId,
      tableName,
    }: {
      email?: string | null;
      linkedin_url?: string | null;
      name?: string | null;
      recordId: string;
      tableName: "directors_ubos" | "shareholders";
    }): Promise<EnrichedProfile | null> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke<EnrichmentResponse>(
        "enrich-profile",
        {
          body: { email, linkedin_url, name },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) throw error;

      const enrichedData = data?.data;
      if (!enrichedData) return null;

      // Build update payload
      const updatePayload: Record<string, string | null> = {};
      if (enrichedData.avatar_url) updatePayload.avatar_url = enrichedData.avatar_url;
      if (enrichedData.title) updatePayload.title = enrichedData.title;
      if (enrichedData.company) updatePayload.company = enrichedData.company;
      if (enrichedData.bio) updatePayload.bio = enrichedData.bio;

      if (Object.keys(updatePayload).length > 0) {
        const { error: updateError } = await supabase
          .from(tableName)
          .update(updatePayload)
          .eq("id", recordId);

        if (updateError) throw updateError;
      }

      return enrichedData;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.tableName] });
      queryClient.invalidateQueries({ queryKey: ["profile-enrichment"] });
    },
  });
};

// Helper to get avatar URL with fallback to Gravatar
export const getEnrichedAvatarUrl = (
  enrichedProfile: EnrichedProfile | null | undefined,
  email: string | null | undefined,
  gravatarFallback: string | null
): string | null => {
  if (enrichedProfile?.avatar_url) {
    return enrichedProfile.avatar_url;
  }
  return gravatarFallback;
};
