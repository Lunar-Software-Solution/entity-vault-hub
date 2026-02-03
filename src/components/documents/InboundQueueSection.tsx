import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Inbox, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Check, 
  X, 
  Trash2,
  Sparkles,
  Mail,
  FileText,
  Building2,
  Clock,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { 
  useInboundQueue, 
  useInboundQueueCounts, 
  useRejectInboundDocument,
  useDeleteInboundDocument,
  type InboundQueueItem 
} from "@/hooks/useInboundQueue";
import { supabase } from "@/integrations/supabase/client";
import InboundApprovalDialog from "./InboundApprovalDialog";
import PdfViewerDialog from "@/components/contracts/PdfViewerDialog";
import DeleteConfirmDialog from "../shared/DeleteConfirmDialog";

export default function InboundQueueSection() {
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<InboundQueueItem | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<InboundQueueItem | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: queueItems = [], isLoading } = useInboundQueue(statusFilter === "all" ? undefined : statusFilter);
  const { data: counts } = useInboundQueueCounts();
  const rejectMutation = useRejectInboundDocument();
  const deleteMutation = useDeleteInboundDocument();

  const filteredItems = queueItems.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.email_from.toLowerCase().includes(query) ||
      item.file_name.toLowerCase().includes(query) ||
      item.email_subject?.toLowerCase().includes(query) ||
      item.entities?.name?.toLowerCase().includes(query)
    );
  });

  const handlePreview = (item: InboundQueueItem) => {
    setPreviewItem(item);
  };

  const handleApprove = (item: InboundQueueItem) => {
    setSelectedItem(item);
    setApprovalDialogOpen(true);
  };

  const handleRejectClick = (item: InboundQueueItem) => {
    setSelectedItem(item);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!selectedItem) return;
    rejectMutation.mutate(
      { queueItemId: selectedItem.id, reason: rejectReason },
      { onSuccess: () => setRejectDialogOpen(false) }
    );
  };

  const handleDeleteClick = (item: InboundQueueItem) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedItem) return;
    deleteMutation.mutate(selectedItem, {
      onSuccess: () => setDeleteDialogOpen(false),
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="text-green-600 border-green-600"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="text-red-600 border-red-600"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Inbox className="h-6 w-6" />
            Inbound Document Queue
          </h2>
          <p className="text-muted-foreground">
            Review and approve documents received via email
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setStatusFilter("pending")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{counts?.pending || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setStatusFilter("approved")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{counts?.approved || 0}</p>
              </div>
              <Check className="h-8 w-8 text-green-600/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setStatusFilter("rejected")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{counts?.rejected || 0}</p>
              </div>
              <X className="h-8 w-8 text-red-600/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setStatusFilter("all")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{counts?.total || 0}</p>
              </div>
              <Inbox className="h-8 w-8 text-muted-foreground/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {statusFilter === "all" ? "All Documents" : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Documents`}
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No documents in queue</p>
              <p className="text-sm text-muted-foreground mt-1">
                Documents sent to your inbound email will appear here
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>AI Suggestion</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{item.file_name}</p>
                          {item.email_subject && (
                            <p className="text-xs text-muted-foreground truncate">{item.email_subject}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate max-w-[150px]">{item.email_from}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.ai_analysis ? (
                        <div className="space-y-1">
                          {item.entities?.name && (
                            <div className="flex items-center gap-1 text-xs">
                              <Building2 className="h-3 w-3 text-primary" />
                              <span>{item.entities.name}</span>
                            </div>
                          )}
                          {item.document_types?.code && (
                            <Badge variant="secondary" className="text-xs">
                              {item.document_types.code}
                            </Badge>
                          )}
                          {item.ai_analysis.confidence && (
                            <div className="flex items-center gap-1">
                              <Sparkles className="h-3 w-3 text-primary" />
                              <span className="text-xs text-muted-foreground">
                                {item.ai_analysis.confidence}% match
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          No AI analysis
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(item.email_received_at), "MMM d, yyyy HH:mm")}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePreview(item)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          {item.status === "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => handleApprove(item)}>
                                <Check className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRejectClick(item)}>
                                <X className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(item)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <InboundApprovalDialog
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
        item={selectedItem}
      />

      {/* PDF Preview */}
      <PdfViewerDialog
        open={!!previewItem}
        onOpenChange={(open) => !open && setPreviewItem(null)}
        filePath={previewItem?.file_path || null}
        fileName={previewItem?.file_name || null}
        bucketName="entity-documents"
      />

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectReason">Reason (optional)</Label>
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Document"
        description="Are you sure you want to delete this document? This will also remove the file from storage."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
