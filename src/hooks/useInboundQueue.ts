import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InboundQueueItem {
  id: string;
  email_from: string;
  email_subject: string | null;
  email_received_at: string;
  file_name: string;
  file_path: string;
  ai_analysis: {
    entity_name?: string;
    title?: string;
    document_type_code?: string;
    issued_date?: string;
    expiry_date?: string;
    issuing_authority?: string;
    reference_number?: string;
    summary?: string;
    confidence?: number;
    matched_entity_id?: string;
    matched_doc_type_id?: string;
  } | null;
  suggested_entity_id: string | null;
  suggested_doc_type_id: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  entities?: { id: string; name: string } | null;
  document_types?: { id: string; code: string; name: string } | null;
}

export const useInboundQueue = (status?: string) => {
  return useQuery({
    queryKey: ["inbound_document_queue", status],
    queryFn: async () => {
      let query = supabase
        .from("inbound_document_queue")
        .select(`
          *,
          entities:suggested_entity_id(id, name),
          document_types:suggested_doc_type_id(id, code, name)
        `)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as InboundQueueItem[];
    },
  });
};

export const useInboundQueueCounts = () => {
  return useQuery({
    queryKey: ["inbound_document_queue_counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inbound_document_queue")
        .select("status");
      
      if (error) throw error;
      
      const counts = {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: data.length,
      };
      
      data.forEach((item: { status: string }) => {
        if (item.status === "pending") counts.pending++;
        else if (item.status === "approved") counts.approved++;
        else if (item.status === "rejected") counts.rejected++;
      });
      
      return counts;
    },
  });
};

export const useApproveInboundDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      queueItem,
      entityId,
      documentTypeId,
      title,
      notes,
    }: {
      queueItem: InboundQueueItem;
      entityId: string;
      documentTypeId: string;
      title: string;
      notes?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      // Create the entity document
      const { error: docError } = await supabase
        .from("entity_documents")
        .insert({
          entity_id: entityId,
          document_type_id: documentTypeId,
          title,
          file_name: queueItem.file_name,
          file_path: queueItem.file_path,
          ai_summary: queueItem.ai_analysis?.summary || null,
          issued_date: queueItem.ai_analysis?.issued_date || null,
          expiry_date: queueItem.ai_analysis?.expiry_date || null,
          issuing_authority: queueItem.ai_analysis?.issuing_authority || null,
          reference_number: queueItem.ai_analysis?.reference_number || null,
          notes: notes || null,
          status: "current",
        });

      if (docError) throw docError;

      // Update queue item status
      const { error: updateError } = await supabase
        .from("inbound_document_queue")
        .update({
          status: "approved",
          processed_by: user.user.id,
          processed_at: new Date().toISOString(),
        })
        .eq("id", queueItem.id);

      if (updateError) throw updateError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbound_document_queue"] });
      queryClient.invalidateQueries({ queryKey: ["inbound_document_queue_counts"] });
      queryClient.invalidateQueries({ queryKey: ["entity_documents"] });
      toast.success("Document approved and added to entity");
    },
    onError: (error) => {
      console.error("Error approving document:", error);
      toast.error("Failed to approve document");
    },
  });
};

export const useRejectInboundDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      queueItemId,
      reason,
    }: {
      queueItemId: string;
      reason?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("inbound_document_queue")
        .update({
          status: "rejected",
          rejection_reason: reason || null,
          processed_by: user.user.id,
          processed_at: new Date().toISOString(),
        })
        .eq("id", queueItemId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbound_document_queue"] });
      queryClient.invalidateQueries({ queryKey: ["inbound_document_queue_counts"] });
      toast.success("Document rejected");
    },
    onError: (error) => {
      console.error("Error rejecting document:", error);
      toast.error("Failed to reject document");
    },
  });
};

export const useDeleteInboundDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (queueItem: InboundQueueItem) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("entity-documents")
        .remove([queueItem.file_path]);

      if (storageError) {
        console.warn("Failed to delete file from storage:", storageError);
      }

      // Delete queue record
      const { error } = await supabase
        .from("inbound_document_queue")
        .delete()
        .eq("id", queueItem.id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbound_document_queue"] });
      queryClient.invalidateQueries({ queryKey: ["inbound_document_queue_counts"] });
      toast.success("Document deleted");
    },
    onError: (error) => {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    },
  });
};
