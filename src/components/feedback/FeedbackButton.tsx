import { useState } from "react";
import { MessageSquarePlus, X, Send, Loader2, Camera, Trash2, Edit3 } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";
import ScreenshotAnnotator from "./ScreenshotAnnotator";

const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [feedbackType, setFeedbackType] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotBlob, setScreenshotBlob] = useState<Blob | null>(null);
  const [rawScreenshot, setRawScreenshot] = useState<string | null>(null);
  const { user } = useAuth();

  const captureScreenshot = async () => {
    setIsCapturing(true);
    const feedbackPanel = document.querySelector('[data-feedback-panel]') as HTMLElement;
    if (feedbackPanel) feedbackPanel.style.visibility = 'hidden';

    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        scale: 0.5,
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      setRawScreenshot(dataUrl);
      setIsAnnotating(true);
      
      toast.success("Screenshot captured! Add annotations if needed.");
    } catch (error) {
      console.error("Screenshot capture error:", error);
      toast.error("Failed to capture screenshot");
    } finally {
      if (feedbackPanel) feedbackPanel.style.visibility = 'visible';
      setIsCapturing(false);
    }
  };

  const handleAnnotationSave = (annotatedDataUrl: string, blob: Blob) => {
    setScreenshot(annotatedDataUrl);
    setScreenshotBlob(blob);
    setIsAnnotating(false);
    setRawScreenshot(null);
  };

  const handleAnnotationCancel = () => {
    setIsAnnotating(false);
    setRawScreenshot(null);
  };

  const startAnnotating = () => {
    if (screenshot) {
      setRawScreenshot(screenshot);
      setIsAnnotating(true);
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotBlob(null);
    setRawScreenshot(null);
    setIsAnnotating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !feedbackType) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      let screenshotUrl: string | undefined;

      // Upload screenshot if present
      if (screenshotBlob && user) {
        const fileName = `${user.id}/${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
          .from('feedback-screenshots')
          .upload(fileName, screenshotBlob, {
            contentType: 'image/png',
          });

        if (uploadError) {
          console.error("Screenshot upload error:", uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from('feedback-screenshots')
            .getPublicUrl(fileName);
          screenshotUrl = urlData.publicUrl;
        }
      }

      const payload = {
        name: `[${feedbackType}] ${title.trim()}`,
        description: description.trim() || undefined,
        email: user?.email || undefined,
        screenshotUrl,
      };

      const { data, error } = await supabase.functions.invoke("submit-feedback", {
        body: payload,
      });

      if (error) {
        throw error;
      }

      toast.success("Thank you for your feedback!");
      setTitle("");
      setDescription("");
      setFeedbackType("");
      setScreenshot(null);
      setScreenshotBlob(null);
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
        <div data-feedback-panel className="fixed bottom-24 right-6 w-[380px] max-h-[80vh] bg-background border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
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
          <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="feedback-type" className="text-foreground font-medium">Type *</Label>
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger id="feedback-type" className="text-foreground bg-background border-border">
                  <SelectValue placeholder="Select feedback type" className="text-muted-foreground" />
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
              <Label htmlFor="feedback-title" className="text-foreground font-medium">Title *</Label>
              <Input
                id="feedback-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of your feedback"
                maxLength={100}
                className="text-foreground bg-background border-border placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-description" className="text-foreground font-medium">Description</Label>
              <Textarea
                id="feedback-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide more details (optional)"
                rows={3}
                maxLength={2000}
                className="text-foreground bg-background border-border placeholder:text-muted-foreground"
              />
            </div>

            {/* Screenshot Section */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Screenshot</Label>
              {isAnnotating && rawScreenshot ? (
                <ScreenshotAnnotator
                  screenshotDataUrl={rawScreenshot}
                  onSave={handleAnnotationSave}
                  onCancel={handleAnnotationCancel}
                />
              ) : screenshot ? (
                <div className="relative rounded-lg border border-border overflow-hidden">
                  <img 
                    src={screenshot} 
                    alt="Screenshot preview" 
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7"
                      onClick={startAnnotating}
                      title="Edit annotations"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7"
                      onClick={removeScreenshot}
                      title="Remove screenshot"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-foreground border-border bg-muted/50 hover:bg-muted"
                  onClick={captureScreenshot}
                  disabled={isCapturing}
                >
                  {isCapturing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Capturing...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Screenshot
                    </>
                  )}
                </Button>
              )}
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
