import { useQuery } from "@tanstack/react-query";
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
  data: EnrichedProfile;
  message?: string;
}

interface UseProfileEnrichmentOptions {
  email?: string | null;
  linkedin_url?: string | null;
  name?: string | null;
  enabled?: boolean;
}

export const useProfileEnrichment = ({
  email,
  linkedin_url,
  name,
  enabled = true,
}: UseProfileEnrichmentOptions) => {
  return useQuery({
    // Include linkedin_url in the query key so cache invalidates when it changes
    queryKey: ["profile-enrichment", email, linkedin_url, name],
    queryFn: async (): Promise<EnrichedProfile | null> => {
      if (!email && !linkedin_url) return null;

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

        return data?.data || null;
      } catch (err) {
        console.error("Failed to enrich profile:", err);
        return null;
      }
    },
    enabled: enabled && !!(email || linkedin_url),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes to pick up new enrichment data
    gcTime: 1000 * 60 * 30, // Garbage collect after 30 minutes
    retry: 1,
  });
};

// Helper to get avatar URL with Clay fallback to Gravatar
export const getEnrichedAvatarUrl = (
  enrichedProfile: EnrichedProfile | null | undefined,
  email: string | null | undefined,
  gravatarFallback: string | null
): string | null => {
  // Priority: Clay avatar > Gravatar
  if (enrichedProfile?.avatar_url) {
    return enrichedProfile.avatar_url;
  }
  return gravatarFallback;
};
