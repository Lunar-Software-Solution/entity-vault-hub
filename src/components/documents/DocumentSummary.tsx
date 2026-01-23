import { Sparkles, Clock } from "lucide-react";
import { format } from "date-fns";
import DOMPurify from "dompurify";

interface DocumentSummaryProps {
  summary: string | null;
  generatedAt: string | null;
}

const DocumentSummary = ({ summary, generatedAt }: DocumentSummaryProps) => {
  if (!summary) return null;

  // Sanitize AI-generated content to prevent XSS attacks
  const sanitizedSummary = DOMPurify.sanitize(
    summary
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
      .replace(/\n/g, '<br/>'),
    { 
      ALLOWED_TAGS: ['strong', 'br', 'p', 'ul', 'ol', 'li', 'em', 'b', 'i'],
      ALLOWED_ATTR: ['class']
    }
  );

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">AI Summary</h4>
        </div>
        {generatedAt && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{format(new Date(generatedAt), "MMM d, yyyy h:mm a")}</span>
          </div>
        )}
      </div>
      <div className="prose prose-sm prose-invert max-w-none text-muted-foreground">
        <div 
          className="whitespace-pre-wrap text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitizedSummary }} 
        />
      </div>
    </div>
  );
};

export default DocumentSummary;