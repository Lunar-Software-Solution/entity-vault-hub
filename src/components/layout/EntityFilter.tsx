import { Building2, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEntities } from "@/hooks/usePortalData";

interface EntityFilterProps {
  selectedEntityId: string | null;
  onEntityChange: (entityId: string | null) => void;
}

const EntityFilter = ({ selectedEntityId, onEntityChange }: EntityFilterProps) => {
  const { data: entities } = useEntities();

  const selectedEntity = entities?.find(e => e.id === selectedEntityId);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-foreground">
        <Building2 className="w-4 h-4" />
        <span className="font-medium">Filter by entity:</span>
      </div>
      <Select 
        value={selectedEntityId || "__all__"} 
        onValueChange={(value) => onEntityChange(value === "__all__" ? null : value)}
      >
        <SelectTrigger className="w-[200px] text-foreground">
          <SelectValue placeholder="All entities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All entities</SelectItem>
          {entities?.map((entity) => (
            <SelectItem key={entity.id} value={entity.id}>
              {entity.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedEntityId && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onEntityChange(null)}
          className="h-8 px-2"
        >
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}
      {selectedEntity && (
        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
          Showing {selectedEntity.name} only
        </span>
      )}
    </div>
  );
};

export default EntityFilter;