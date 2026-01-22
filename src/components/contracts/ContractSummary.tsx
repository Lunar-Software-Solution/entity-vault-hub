import { Sparkles, Clock } from "lucide-react";
import { format } from "date-fns";

interface ContractSummaryProps {
  summary: string | null;
  generatedAt: string | null;
}

const ContractSummary = ({ summary, generatedAt }: ContractSummaryProps) => {
  if (!summary) return null;

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
          dangerouslySetInnerHTML={{ 
            __html: summary
              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
              .replace(/\n/g, '<br/>')
          }} 
        />
      </div>
    </div>
  );
};

export default ContractSummary;
