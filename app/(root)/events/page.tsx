'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventFilters } from '@/features/events/components/organisms/event-filters';
import { EventsListing } from '@/features/events/components/organisms/events-listing';
import { useEventsWithFilters } from '@/features/events/hooks/use-events';
import type { Event } from '@/features/events/config/events.types';

export default function EventsPage() {
  const router = useRouter();
  const { data, isLoading, error, filters, updateFilters } = useEventsWithFilters();

  const handleViewDetails = (event: Event) => {
    router.push(`/events/${event.id}`);
  };

  const handleCreateEvent = () => {
    router.push('/events/create');
  };

  const handleLoadMore = () => {
    if (data && data.page < data.totalPages) {
      updateFilters({ page: filters.page + 1 });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Discover Events</h1>
          <p className="text-muted-foreground mt-1">
            Find and join events that interest you
          </p>
        </div>
        <Button onClick={handleCreateEvent} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Filters */}
      <EventFilters
        filters={filters}
        onFiltersChange={updateFilters}
        isLoading={isLoading}
      />

      {/* Results */}
      {error ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2 text-destructive">
            Error loading events
          </h3>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </p>
        </div>
      ) : (
        <>
          {/* Results count */}
          {data && !isLoading && (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                {data.total === 0
                  ? 'No events found'
                  : `Showing ${data.events.length} of ${data.total} events`}
              </p>
            </div>
          )}

          {/* Events listing */}
          <EventsListing
            events={data?.events || []}
            loading={isLoading}
            onViewDetails={handleViewDetails}
            onLoadMore={handleLoadMore}
            hasMore={data ? data.page < data.totalPages : false}
            loadingMore={false}
          />
        </>
      )}
    </div>
  );
}