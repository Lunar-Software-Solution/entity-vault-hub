import { useState } from "react";
import { MessageSquarePlus, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const PLANE_INTAKE_URL = "https://projects.lunr.tech/api/v1/intake/9ec06cc8e1f749f8b13a1c87a29e191c/";

const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackType, setFeedbackType] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !feedbackType) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: `[${feedbackType}] ${title.trim()}`,
        description: description.trim() || undefined,
        email: user?.email || undefined,
      };

      const response = await fetch(PLANE_INTAKE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      toast.success("Thank you for your feedback!");
      setTitle("");
      setDescription("");
      setFeedbackType("");
      setIsOpen(false);
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Feedback Button - positioned above AI button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg z-50",
          "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
          "transition-transform hover:scale-105",
          isOpen && "hidden"
        )}
        size="icon"
        title="Send Feedback"
      >
        <MessageSquarePlus className="h-6 w-6" />
      </Button>

      {/* Feedback Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[380px] bg-background border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
                <MessageSquarePlus className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Send Feedback</h3>
                <p className="text-xs text-muted-foreground">Help us improve the portal</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback-type">Type *</Label>
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger id="feedback-type">
                  <SelectValue placeholder="Select feedback type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bug">Bug Report</SelectItem>
                  <SelectItem value="Feature">Feature Request</SelectItem>
                  <SelectItem value="Improvement">Improvement</SelectItem>
                  <SelectItem value="Question">Question</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-title">Title *</Label>
              <Input
                id="feedback-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of your feedback"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-description">Description</Label>
              <Textarea
                id="feedback-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide more details (optional)"
                rows={4}
                maxLength={2000}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !title.trim() || !feedbackType}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </form>
        </div>
      )}
    </>
  );
};

export default FeedbackButton;
