import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { socialMediaSchema, SocialMediaFormData } from "@/lib/formSchemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useEntities } from "@/hooks/usePortalData";
import type { SocialMediaAccount } from "@/hooks/usePortalData";

interface SocialMediaFormProps {
  account?: SocialMediaAccount | null;
  onSubmit: (data: SocialMediaFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const platformColors = [
  { value: "bg-zinc-800", label: "Default" },
  { value: "bg-blue-600", label: "Blue (Twitter/LinkedIn)" },
  { value: "bg-pink-600", label: "Pink (Instagram)" },
  { value: "bg-red-600", label: "Red (YouTube)" },
  { value: "bg-black", label: "Black (TikTok)" },
  { value: "bg-green-600", label: "Green (WhatsApp)" },
  { value: "bg-purple-600", label: "Purple (Twitch)" },
  { value: "bg-indigo-600", label: "Indigo (Discord)" },
  { value: "bg-orange-600", label: "Orange (Reddit)" },
  { value: "bg-yellow-400", label: "Yellow (Snapchat)" },
  { value: "bg-blue-500", label: "Light Blue (Telegram)" },
];

const SocialMediaForm = ({ account, onSubmit, onCancel, isLoading }: SocialMediaFormProps) => {
  const [isFetching, setIsFetching] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(account?.avatar_url || null);
  const { data: entities } = useEntities();
  
  const form = useForm<SocialMediaFormData>({
    resolver: zodResolver(socialMediaSchema),
    defaultValues: {
      platform: account?.platform ?? "",
      username: account?.username ?? "",
      profile_url: account?.profile_url ?? "",
      followers: account?.followers ?? "",
      is_verified: account?.is_verified ?? false,
      color: account?.color ?? "bg-zinc-800",
      icon: account?.icon ?? "",
      entity_id: account?.entity_id ?? "__none__",
      avatar_url: account?.avatar_url ?? "",
    },
  });

  const fetchProfileFromUrl = async () => {
    const url = form.getValues("profile_url");
    if (!url) {
      toast.error("Please enter a profile URL first");
      return;
    }

    setIsFetching(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke("fetch-social-profile", {
        body: { profileUrl: url },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`,
        } : undefined,
      });

      if (response.error) throw response.error;

      const profile = response.data;
      
      if (profile.platform) form.setValue("platform", profile.platform);
      if (profile.username) form.setValue("username", profile.username);
      if (profile.icon) form.setValue("icon", profile.icon);
      if (profile.color) form.setValue("color", profile.color);
      if (profile.avatar_url) {
        form.setValue("avatar_url", profile.avatar_url);
        setAvatarPreview(profile.avatar_url);
      }
      
      toast.success(`Detected ${profile.platform} profile`);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Could not fetch profile info. Please fill in manually.");
    } finally {
      setIsFetching(false);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="entity_id" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Entity</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || "__none__"}>
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select entity (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background">
                  <SelectItem value="__none__">No entity</SelectItem>
                  {entities?.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>{entity.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="platform" render={({ field }) => (
            <FormItem>
              <FormLabel>Platform *</FormLabel>
              <FormControl><Input placeholder="Instagram" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField control={form.control} name="username" render={({ field }) => (
            <FormItem>
              <FormLabel>Username *</FormLabel>
              <FormControl><Input placeholder="@username" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="profile_url" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Profile URL</FormLabel>
              <div className="flex gap-2">
                <FormControl><Input placeholder="https://instagram.com/username" {...field} /></FormControl>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={fetchProfileFromUrl}
                  disabled={isFetching}
                  title="Auto-detect platform and username"
                >
                  {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="avatar_url" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Avatar URL</FormLabel>
              <div className="flex gap-3 items-start">
                <FormControl>
                  <Input 
                    placeholder="https://example.com/avatar.jpg" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      setAvatarPreview(e.target.value || null);
                    }}
                  />
                </FormControl>
                {avatarPreview && (
                  <div className="flex-shrink-0">
                    <img 
                      src={avatarPreview} 
                      alt="Avatar preview" 
                      className="w-10 h-10 rounded-lg object-cover border border-border"
                      onError={() => setAvatarPreview(null)}
                    />
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="followers" render={({ field }) => (
            <FormItem>
              <FormLabel>Followers</FormLabel>
              <FormControl><Input placeholder="10.5K" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="icon" render={({ field }) => (
            <FormItem>
              <FormLabel>Icon (emoji or letter)</FormLabel>
              <FormControl><Input placeholder="📸" maxLength={2} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="color" render={({ field }) => (
            <FormItem>
              <FormLabel>Brand Color</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select color" /></SelectTrigger></FormControl>
                <SelectContent>
                  {platformColors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${color.value}`} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="is_verified" render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <FormLabel className="cursor-pointer">Verified Account</FormLabel>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : account ? "Update Account" : "Link Account"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SocialMediaForm;
