import type { FlashcardListParams } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilterBarProps {
  selectedSource?: FlashcardListParams['source'];
  onSourceChange: (source: FlashcardListParams['source'] | undefined) => void;
}

export function FilterBar({ selectedSource, onSourceChange }: FilterBarProps) {
  return (
    <div className="flex items-center gap-4">
      <Select
        value={selectedSource}
        onValueChange={(value: string | undefined) => onSourceChange(value as FlashcardListParams['source'])}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ai-full">AI Generated</SelectItem>
          <SelectItem value="ai-edited">AI Edited</SelectItem>
          <SelectItem value="manual">Manual</SelectItem>
        </SelectContent>
      </Select>

      {selectedSource && (
        <Button 
          variant="ghost" 
          onClick={() => onSourceChange(undefined)}
        >
          Clear filter
        </Button>
      )}
    </div>
  );
} 