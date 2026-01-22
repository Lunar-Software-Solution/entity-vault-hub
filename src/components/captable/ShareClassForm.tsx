import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ShareClassFormData {
  entity_id: string;
  name: string;
  class_type: string;
  authorized_shares: number;
  par_value?: number;
  voting_rights: boolean;
  votes_per_share?: number;
  liquidation_preference?: number;
  seniority?: number;
  notes?: string;
}

interface ShareClassFormProps {
  item?: any;
  entities: any[];
  onSubmit: (data: ShareClassFormData) => void;
  onCancel: () => void;
}

const ShareClassForm = ({ item, entities, onSubmit, onCancel }: ShareClassFormProps) => {
  const form = useForm<ShareClassFormData>({
    defaultValues: {
      entity_id: item?.entity_id || "",
      name: item?.name || "",
      class_type: item?.class_type || "common",
      authorized_shares: item?.authorized_shares || 10000000,
      par_value: item?.par_value || 0.0001,
      voting_rights: item?.voting_rights ?? true,
      votes_per_share: item?.votes_per_share || 1,
      liquidation_preference: item?.liquidation_preference || 1,
      seniority: item?.seniority || 1,
      notes: item?.notes || "",
    },
  });

  const classTypes = ["common", "preferred", "options"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="entity_id" render={({ field }) => (
          <FormItem>
            <FormLabel>Entity *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select an entity" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-background">
                {entities.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>{entity.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl><Input placeholder="Common Stock" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="class_type" render={({ field }) => (
            <FormItem>
              <FormLabel>Type *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background">
                  {classTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="authorized_shares" render={({ field }) => (
            <FormItem>
              <FormLabel>Authorized Shares *</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="par_value" render={({ field }) => (
            <FormItem>
              <FormLabel>Par Value ($)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.0001"
                  {...field} 
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="votes_per_share" render={({ field }) => (
            <FormItem>
              <FormLabel>Votes Per Share</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="liquidation_preference" render={({ field }) => (
            <FormItem>
              <FormLabel>Liquidation Preference (x)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.1"
                  {...field} 
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="voting_rights" render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Has Voting Rights</FormLabel>
            </div>
          </FormItem>
        )} />

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl><Textarea rows={2} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{item ? "Update" : "Create"}</Button>
        </div>
      </form>
    </Form>
  );
};

export default ShareClassForm;
