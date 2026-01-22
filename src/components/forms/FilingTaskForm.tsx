import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { filingTaskSchema, FilingTaskFormData } from "@/lib/formSchemas";
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
import { useEntities, useEntityFilings } from "@/hooks/usePortalData";
import { TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from "@/lib/filingUtils";

interface FilingTaskFormProps {
  defaultValues?: Partial<FilingTaskFormData>;
  onSubmit: (data: FilingTaskFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  preselectedEntityId?: string;
  preselectedFilingId?: string;
}

const FilingTaskForm = ({ 
  defaultValues, 
  onSubmit, 
  onCancel, 
  isLoading,
  preselectedEntityId,
  preselectedFilingId
}: FilingTaskFormProps) => {
  const { data: entities } = useEntities();
  const { data: filings } = useEntityFilings();

  const form = useForm<FilingTaskFormData>({
    resolver: zodResolver(filingTaskSchema),
    defaultValues: {
      entity_id: preselectedEntityId || "",
      filing_id: preselectedFilingId || "",
      title: "",
      description: "",
      due_date: "",
      priority: "medium",
      status: "pending",
      assigned_to: "",
      ...defaultValues,
    },
  });

  const selectedEntityId = form.watch("entity_id");
  const entityFilings = filings?.filter(f => f.entity_id === selectedEntityId) ?? [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            name="filing_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related Filing</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""} disabled={!!preselectedFilingId}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Optional - link to filing" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {entityFilings.map((filing) => (
                      <SelectItem key={filing.id} value={filing.id}>
                        {filing.title}
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
                <Input placeholder="e.g., File Q1 Sales Tax Return" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Task details..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TASK_PRIORITY_OPTIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
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
                    {TASK_STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
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
          name="assigned_to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned To</FormLabel>
              <FormControl>
                <Input placeholder="Person responsible" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : defaultValues?.title ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FilingTaskForm;
