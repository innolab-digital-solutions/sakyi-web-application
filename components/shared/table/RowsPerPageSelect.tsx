import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type RowsPerPageSelectProps = {
  value: number;
  options?: number[];
  onChange: (value: number) => void;
};

const DEFAULT_OPTIONS = [10, 25, 50, 100];

const RowsPerPageSelect = ({
  value,
  options = DEFAULT_OPTIONS,
  onChange,
}: RowsPerPageSelectProps) => {
  const stringValue = String(value);

  return (
    <div className='text-muted-foreground flex items-center gap-2 text-xs sm:text-sm'>
      <span>Rows per page</span>
      <Select
        value={stringValue}
        onValueChange={(next) => onChange(Number(next))}
      >
        <SelectTrigger size='sm' className='min-w-18 justify-between'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={String(option)}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RowsPerPageSelect;
