import React from 'react';
import { EventCard } from '../molecules/event-card';
import { LoadingButton } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Event, EventsResponse } from '../../config/events.types';

interface EventsListingProps {
  events: Event[];
  loading?: boolean;
  onViewDetails?: (event: Event) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export function EventsListing({
  events,
  loading = false,
  onViewDetails,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
}: EventsListingProps) {
  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No events found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria or check back later for new events.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <LoadingButton
            onClick={onLoadMore}
            pending={loadingMore}
            variant="outline"
          >
            Load More Events
          </LoadingButton>
        </div>
      )}
    </div>
  );
}