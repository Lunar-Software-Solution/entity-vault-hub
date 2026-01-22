import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TransactionFormData {
  entity_id: string;
  shareholder_id: string;
  share_class_id: string;
  transaction_type: string;
  shares: number;
  price_per_share: number;
  transaction_date: string;
  certificate_number?: string;
  notes?: string;
}

interface TransactionFormProps {
  entities: any[];
  shareholders: any[];
  shareClasses: any[];
  onSubmit: (data: TransactionFormData) => void;
  onCancel: () => void;
}

const TransactionForm = ({ entities, shareholders, shareClasses, onSubmit, onCancel }: TransactionFormProps) => {
  const form = useForm<TransactionFormData>({
    defaultValues: {
      entity_id: "",
      shareholder_id: "",
      share_class_id: "",
      transaction_type: "issuance",
      shares: 0,
      price_per_share: 0,
      transaction_date: new Date().toISOString().split("T")[0],
      certificate_number: "",
      notes: "",
    },
  });

  const selectedEntityId = form.watch("entity_id");
  const filteredShareholders = shareholders.filter(s => !selectedEntityId || s.entity_id === selectedEntityId);
  const filteredShareClasses = shareClasses.filter(c => !selectedEntityId || c.entity_id === selectedEntityId);

  const transactionTypes = [
    { value: "issuance", label: "Issuance" },
    { value: "transfer", label: "Transfer" },
    { value: "repurchase", label: "Repurchase" },
    { value: "exercise", label: "Exercise" },
    { value: "conversion", label: "Conversion" },
    { value: "cancellation", label: "Cancellation" },
  ];

  const handleSubmit = (data: TransactionFormData) => {
    onSubmit({
      ...data,
      certificate_number: data.certificate_number || null,
      notes: data.notes || null,
    } as any);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
          <FormField control={form.control} name="shareholder_id" render={({ field }) => (
            <FormItem>
              <FormLabel>Shareholder *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!selectedEntityId}>
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select shareholder" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background">
                  {filteredShareholders.map((sh) => (
                    <SelectItem key={sh.id} value={sh.id}>{sh.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="share_class_id" render={({ field }) => (
            <FormItem>
              <FormLabel>Share Class *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!selectedEntityId}>
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select share class" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background">
                  {filteredShareClasses.map((sc) => (
                    <SelectItem key={sc.id} value={sc.id}>{sc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="transaction_type" render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Type *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background">
                  {transactionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="transaction_date" render={({ field }) => (
            <FormItem>
              <FormLabel>Date *</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="shares" render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Shares *</FormLabel>
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
          <FormField control={form.control} name="price_per_share" render={({ field }) => (
            <FormItem>
              <FormLabel>Price Per Share ($) *</FormLabel>
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

        <FormField control={form.control} name="certificate_number" render={({ field }) => (
          <FormItem>
            <FormLabel>Certificate Number</FormLabel>
            <FormControl><Input placeholder="CS-001" {...field} /></FormControl>
            <FormMessage />
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
          <Button type="submit">Record Transaction</Button>
        </div>
      </form>
    </Form>
  );
};

export default TransactionForm;
