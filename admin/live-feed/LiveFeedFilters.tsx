import { Button } from "@/components/ui/button";

type Filter = 'all' | 'pending' | 'completed' | 'cancelled';

interface LiveFeedFiltersProps {
    filter: Filter;
    setFilter: (filter: Filter) => void;
}

const filters: { label: string; value: Filter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
];

export default function LiveFeedFilters({ filter, setFilter }: LiveFeedFiltersProps) {
    return (
        <div className="flex items-center gap-1 pt-2">
            {filters.map(f => (
                <Button
                    key={f.value}
                    variant={filter === f.value ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(f.value)}
                    className="capitalize"
                >
                    {f.label}
                </Button>
            ))}
        </div>
    );
}
