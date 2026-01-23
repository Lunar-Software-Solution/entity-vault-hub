import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { entityFilingSchema, EntityFilingFormData } from "@/lib/formSchemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEntities, useFilingTypes } from "@/hooks/usePortalData";
import { FREQUENCY_OPTIONS, FILING_STATUS_OPTIONS } from "@/lib/filingUtils";

interface EntityFilingFormProps {
  defaultValues?: Partial<EntityFilingFormData>;
  onSubmit: (data: EntityFilingFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  preselectedEntityId?: string;
}

const EntityFilingForm = ({ 
  defaultValues, 
  onSubmit, 
  onCancel, 
  isLoading,
  preselectedEntityId 
}: EntityFilingFormProps) => {
  const { data: entities } = useEntities();
  const { data: filingTypes } = useFilingTypes();

  const form = useForm<EntityFilingFormData>({
    resolver: zodResolver(entityFilingSchema),
    defaultValues: {
      entity_id: preselectedEntityId || "",
      filing_type_id: "",
      title: "",
      jurisdiction: "",
      due_date: "",
      due_day: undefined,
      filing_date: "",
      frequency: "annual",
      amount: 0,
      confirmation_number: "",
      filed_by: "",
      notes: "",
      status: "pending",
      reminder_days: 30,
      ...defaultValues,
    },
  });

  // Auto-fill title when filing type changes
  const handleFilingTypeChange = (typeId: string) => {
    form.setValue("filing_type_id", typeId);
    const selectedType = filingTypes?.find(t => t.id === typeId);
    if (selectedType && !form.getValues("title")) {
      form.setValue("title", selectedType.name);
      form.setValue("frequency", selectedType.default_frequency);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="entity_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entity *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!!preselectedEntityId}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {entities?.map((entity) => (
                      <SelectItem key={entity.id} value={entity.id}>
                        {entity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="filing_type_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Filing Type</FormLabel>
                <Select onValueChange={handleFilingTypeChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filingTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        [{type.code}] {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Q1 2026 Sales Tax - California" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="jurisdiction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jurisdiction</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Delaware, California" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="due_day"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recurring Day</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    max="31" 
                    placeholder="1-31"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="filing_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Filing Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reminder_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reminder (days)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="365" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FILING_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="confirmation_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmation Number</FormLabel>
                <FormControl>
                  <Input placeholder="Reference/confirmation #" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="filed_by"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Filed By</FormLabel>
                <FormControl>
                  <Input placeholder="Person or firm name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-background">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : defaultValues?.title ? "Update Filing" : "Create Filing"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EntityFilingForm;
