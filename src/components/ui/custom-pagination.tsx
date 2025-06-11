import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationPrevious, 
  PaginationNext 
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface CustomPaginationProps {
  currentPage: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function CustomPagination({ 
  currentPage, 
  perPage, 
  total, 
  onPageChange, 
  onPerPageChange,
  pageSizeOptions = [5, 10, 20, 50],
  className
}: CustomPaginationProps) {
  const totalPages = Math.ceil(total / perPage);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  const handlePreviousPage = () => {
    if (!isFirstPage) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (!isLastPage) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageSizeChange = (value: string) => {
    const newPerPage = Number(value);
    onPerPageChange(newPerPage);
    // Reset to first page when changing page size
    onPageChange(1);
  };

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <Select 
            value={String(perPage)} 
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PaginationItem>

        <PaginationItem>
          <PaginationPrevious 
            href="#" 
            onClick={handlePreviousPage}
            className={cn(
              isFirstPage && "pointer-events-none opacity-50"
            )}
          />
        </PaginationItem>
        
        <PaginationItem>
          <div className="text-sm px-4">
            Page {currentPage} of {totalPages}
          </div>
        </PaginationItem>

        <PaginationItem>
          <PaginationNext 
            href="#" 
            onClick={handleNextPage}
            className={cn(
              isLastPage && "pointer-events-none opacity-50"
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
} 