import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { socialMediaSchema, SocialMediaFormData } from "@/lib/formSchemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
];

const SocialMediaForm = ({ account, onSubmit, onCancel, isLoading }: SocialMediaFormProps) => {
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
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <FormControl><Input placeholder="https://instagram.com/username" {...field} /></FormControl>
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
