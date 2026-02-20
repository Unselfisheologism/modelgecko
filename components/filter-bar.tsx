'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { SearchInput } from '@/components/search-input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface FilterOption {
    value: string
    label: string
}

interface FilterBarProps {
    providers: FilterOption[]
    modalities: FilterOption[]
    sortOptions?: FilterOption[]
    currentProvider?: string
    currentModality?: string
    currentSort?: string
    currentSearch?: string
}

export function FilterBar({
    providers,
    modalities,
    sortOptions = [
        { value: 'name', label: 'Name (A-Z)' },
        { value: 'name_desc', label: 'Name (Z-A)' },
        { value: 'releaseDate_desc', label: 'Newest First' },
        { value: 'releaseDate', label: 'Oldest First' },
        { value: 'contextWindow_desc', label: 'Largest Context' },
    ],
    currentProvider,
    currentModality,
    currentSort,
    currentSearch,
}: FilterBarProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`?${params.toString()}`)
    }

    const clearFilters = () => {
        router.push('/models')
    }

    const hasFilters = currentProvider || currentModality || currentSearch

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                    <SearchInput
                        placeholder="Search models..."
                        defaultValue={currentSearch}
                        onChange={(e) => updateFilter('search', e.target.value)}
                    />
                </div>

                <Select
                    value={currentProvider}
                    onChange={(e) => updateFilter('provider', e.target.value)}
                    className="w-[180px]"
                >
                    <option value="">All Providers</option>
                    {providers.map((p) => (
                        <option key={p.value} value={p.value}>
                            {p.label}
                        </option>
                    ))}
                </Select>

                <Select
                    value={currentModality}
                    onChange={(e) => updateFilter('modality', e.target.value)}
                    className="w-[180px]"
                >
                    <option value="">All Modalities</option>
                    {modalities.map((m) => (
                        <option key={m.value} value={m.value}>
                            {m.label}
                        </option>
                    ))}
                </Select>

                <Select
                    value={currentSort}
                    onChange={(e) => updateFilter('sortBy', e.target.value)}
                    className="w-[180px]"
                >
                    {sortOptions.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </Select>

                {hasFilters && (
                    <Button variant="ghost" onClick={clearFilters} className="gap-2">
                        <X className="w-4 h-4" />
                        Clear
                    </Button>
                )}
            </div>
        </div>
    )
}
