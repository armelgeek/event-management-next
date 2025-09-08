import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { EventFilters, EventsResponse } from '../config/events.types';

// Query keys
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters: EventFilters) => [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
};

// API functions
async function fetchEvents(filters: EventFilters): Promise<EventsResponse> {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  if (filters.location) params.append('location', filters.location);
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.append('dateTo', filters.dateTo);
  params.append('page', filters.page.toString());
  params.append('limit', filters.limit.toString());

  const response = await fetch(`/api/v1/events?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  
  return response.json();
}

async function fetchEvent(id: string) {
  const response = await fetch(`/api/v1/events/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch event');
  }
  
  return response.json();
}

// Custom hooks
export function useEvents(filters: EventFilters) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: () => fetchEvents(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => fetchEvent(id),
    enabled: !!id,
  });
}

export function useEventsWithFilters(initialFilters: Partial<EventFilters> = {}) {
  const [filters, setFilters] = useState<EventFilters>({
    page: 1,
    limit: 12,
    ...initialFilters,
  });

  const query = useEvents(filters);

  const updateFilters = (newFilters: Partial<EventFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  };

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
    });
  };

  return {
    ...query,
    filters,
    updateFilters,
    resetFilters,
  };
}