import { CirclePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClientListPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-1.5">
          <h1 className="text-foreground text-lg font-bold">Clients List</h1>
          {/* <p className="text-muted-foreground text-sm font-medium">
            View, manage, and organize all client records from a centralized
            dashboard. Access detailed client profiles and maintain up-to-date
            information efficiently.
          </p> */}
        </div>
        <div>
          <Button
            variant="default"
            className="cursor-pointer gap-2 rounded-sm font-semibold"
          >
            <CirclePlus className="size-4" />
            Add Client
          </Button>
        </div>
      </div>
    </div>
  );
}
