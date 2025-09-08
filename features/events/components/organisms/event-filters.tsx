import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { EventFilters } from '../../config/events.types';

interface EventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  categories?: string[];
  isLoading?: boolean;
}

const defaultCategories = [
  'Technology',
  'Business',
  'Art & Culture',
  'Health & Wellness',
  'Sports & Fitness',
  'Education',
  'Music',
  'Food & Drink',
  'Networking',
  'Other',
];

export function EventFilters({
  filters,
  onFiltersChange,
  categories = defaultCategories,
  isLoading = false,
}: EventFiltersProps) {
  const updateFilter = (key: keyof EventFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1, // Reset to first page when filters change
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit,
    });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.category ||
    filters.location ||
    filters.dateFrom ||
    filters.dateTo
  );

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value || undefined)}
              className="pl-9"
              disabled={isLoading}
            />
          </div>

          {/* Filter row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Category filter */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={filters.category || ''}
                onValueChange={(value) => updateFilter('category', value || undefined)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location filter */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter location"
                value={filters.location || ''}
                onChange={(e) => updateFilter('location', e.target.value || undefined)}
                disabled={isLoading}
              />
            </div>

            {/* Date from filter */}
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => updateFilter('dateFrom', e.target.value || undefined)}
                disabled={isLoading}
              />
            </div>

            {/* Date to filter */}
            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => updateFilter('dateTo', e.target.value || undefined)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={isLoading}
                size="sm"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}