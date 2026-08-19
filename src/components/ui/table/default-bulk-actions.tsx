import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Icons } from '@/components/icons';

interface DefaultBulkActionsProps {
  onStatusUpdate?: () => void;
  onPriorityUpdate?: () => void;
  onExport?: () => void;
  onDelete?: () => void;
}

export function DefaultBulkActions({
  onStatusUpdate,
  onPriorityUpdate,
  onExport,
  onDelete
}: DefaultBulkActionsProps) {
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            className='size-8'
            aria-label='Update status'
            title='Update status'
            onClick={onStatusUpdate}
          >
            <Icons.status className='size-4' />
            <span className='sr-only'>Update status</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Update status</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            className='size-8'
            aria-label='Update priority'
            title='Update priority'
            onClick={onPriorityUpdate}
          >
            <Icons.priority className='size-4' />
            <span className='sr-only'>Update priority</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Update priority</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            className='size-8'
            aria-label='Export items'
            title='Export items'
            onClick={onExport}
          >
            <Icons.download className='size-4' />
            <span className='sr-only'>Export items</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export items</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='destructive'
            size='icon'
            className='size-8'
            aria-label='Delete selected'
            title='Delete selected'
            onClick={onDelete}
          >
            <Icons.trash className='size-4' />
            <span className='sr-only'>Delete selected</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete selected</p>
        </TooltipContent>
      </Tooltip>
    </>
  );
}
