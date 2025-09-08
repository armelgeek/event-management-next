import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { Event } from '../../config/events.types';

interface EventCardProps {
  event: Event;
  onViewDetails?: (event: Event) => void;
  showOrganizer?: boolean;
}

export function EventCard({ event, onViewDetails, showOrganizer = true }: EventCardProps) {
  const isEventFull = event.currentParticipants >= event.maxParticipants;
  const isEventPast = new Date(event.date) < new Date();

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      {event.imageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold line-clamp-1">{event.title}</h3>
          <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
            {event.status}
          </Badge>
        </div>
        
        {event.category && (
          <Badge variant="outline" className="w-fit">
            {event.category}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(event.date), 'PPpp')}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="line-clamp-1">{event.location}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {event.currentParticipants} / {event.maxParticipants} participants
            </span>
            {isEventFull && (
              <Badge variant="destructive" className="text-xs">
                Full
              </Badge>
            )}
          </div>

          {showOrganizer && event.organizer && (
            <div className="text-xs text-muted-foreground">
              Organized by {event.organizer.name}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => onViewDetails?.(event)}
          className="w-full"
          variant={isEventPast ? "outline" : "default"}
          disabled={isEventPast}
        >
          {isEventPast ? "Event Ended" : "View Details"}
        </Button>
      </CardFooter>
    </Card>
  );
}