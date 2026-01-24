import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { creditCardSchema, CreditCardFormData } from "@/lib/formSchemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import type { CreditCard } from "@/hooks/usePortalData";
import { useEntities } from "@/hooks/usePortalData";
interface CreditCardFormProps {
  card?: CreditCard | null;
  onSubmit: (data: CreditCardFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const cardColors = [
  { value: "from-zinc-800 to-zinc-600", label: "Slate" },
  { value: "from-blue-600 to-blue-800", label: "Blue" },
  { value: "from-purple-600 to-purple-800", label: "Purple" },
  { value: "from-emerald-600 to-emerald-800", label: "Green" },
  { value: "from-rose-600 to-rose-800", label: "Rose" },
  { value: "from-amber-600 to-amber-800", label: "Gold" },
];

const CreditCardForm = ({ card, onSubmit, onCancel, isLoading }: CreditCardFormProps) => {
  const { data: entities } = useEntities();
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  
  const form = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      name: card?.name ?? "",
      issuer_website: (card as any)?.issuer_website ?? "",
      card_number: card?.card_number ?? "",
      cardholder_name: card?.cardholder_name ?? "",
      expiry_date: card?.expiry_date ?? "",
      credit_limit: card?.credit_limit ? Number(card.credit_limit) : 0,
      due_date: card?.due_date ?? "",
      card_color: card?.card_color ?? "from-zinc-800 to-zinc-600",
      entity_id: (card as any)?.entity_id ?? "",
      security_code: (card as any)?.security_code ?? "",
      billing_address: (card as any)?.billing_address ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="entity_id" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Linked Entity</FormLabel>
              <Select onValueChange={(value) => field.onChange(value === "__none__" ? "" : value)} defaultValue={field.value || "__none__"}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select entity (optional)" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="__none__">No entity</SelectItem>
                  {entities?.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>{entity.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Card Name *</FormLabel>
              <FormControl><Input placeholder="Sapphire Preferred" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="issuer_website" render={({ field }) => (
            <FormItem>
              <FormLabel>Issuer Website</FormLabel>
              <FormControl><Input placeholder="https://chase.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField control={form.control} name="card_number" render={({ field }) => (
            <FormItem>
              <FormLabel>Card Number *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type={showCardNumber ? "text" : "password"} 
                    placeholder="**** **** **** 1234" 
                    {...field} 
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCardNumber(!showCardNumber)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCardNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="cardholder_name" render={({ field }) => (
            <FormItem>
              <FormLabel>Cardholder Name</FormLabel>
              <FormControl><Input placeholder="JOHN DOE" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="expiry_date" render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry Date</FormLabel>
              <FormControl><Input placeholder="MM/YY" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="security_code" render={({ field }) => (
            <FormItem>
              <FormLabel>Security Code (CVV)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type={showCvv ? "text" : "password"} 
                    placeholder="***" 
                    maxLength={4} 
                    {...field} 
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCvv(!showCvv)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="credit_limit" render={({ field }) => (
            <FormItem>
              <FormLabel>Credit Limit *</FormLabel>
              <FormControl><Input type="number" step="0.01" placeholder="10000" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="due_date" render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Due Date</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="card_color" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Card Color</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select color" /></SelectTrigger></FormControl>
                <SelectContent>
                  {cardColors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded bg-gradient-to-r ${color.value}`} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="billing_address" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Billing Address</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="123 Main Street, City, State, ZIP, Country" 
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : card ? "Update Card" : "Add Card"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreditCardForm;