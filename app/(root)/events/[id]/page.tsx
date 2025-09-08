'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useEvent } from '@/features/events/hooks/use-events';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  
  const { data: event, isLoading, error } = useEvent(eventId);
  const [participationMessage, setParticipationMessage] = useState('');
  const [isRequestingParticipation, setIsRequestingParticipation] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleRequestParticipation = async () => {
    if (!event) return;

    setIsRequestingParticipation(true);
    try {
      const response = await fetch(`/api/v1/events/${event.id}/participation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: participationMessage || undefined,
        }),
      });

      if (response.ok) {
        alert('Participation request sent successfully!');
        setParticipationMessage('');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to send participation request');
      }
    } catch (error) {
      console.error('Error requesting participation:', error);
      alert('Failed to send participation request');
    } finally {
      setIsRequestingParticipation(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2 text-destructive">
            Event not found
          </h3>
          <p className="text-muted-foreground mb-4">
            The event you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isEventFull = event.currentParticipants >= event.maxParticipants;
  const isEventPast = new Date(event.date) < new Date();
  const canRequestParticipation = event.status === 'active' && !isEventPast && !isEventFull;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button onClick={handleBack} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      </div>

      {/* Event Image */}
      {event.imageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-lg mb-6">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Event Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Title and Status */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                {event.status}
              </Badge>
            </div>
            {event.category && (
              <Badge variant="outline" className="mb-4">
                {event.category}
              </Badge>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <Card>
              <CardHeader>
                <CardTitle>About this event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{event.description}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(event.date), 'h:mm a')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <p>{event.location}</p>
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {event.currentParticipants} / {event.maxParticipants} participants
                  </p>
                  {isEventFull && (
                    <p className="text-sm text-destructive">Event is full</p>
                  )}
                </div>
              </div>

              {event.organizer && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{event.organizer.name}</p>
                    <p className="text-sm text-muted-foreground">Organizer</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Participation Request */}
          {canRequestParticipation && (
            <Card>
              <CardHeader>
                <CardTitle>Request to Participate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="message">Message (optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell the organizer why you'd like to join..."
                    value={participationMessage}
                    onChange={(e) => setParticipationMessage(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleRequestParticipation}
                  disabled={isRequestingParticipation}
                  className="w-full"
                >
                  {isRequestingParticipation ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending Request...
                    </>
                  ) : (
                    'Request to Participate'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Status Messages */}
          {!canRequestParticipation && (
            <Card>
              <CardContent className="p-4">
                {isEventPast && (
                  <p className="text-center text-muted-foreground">
                    This event has already taken place.
                  </p>
                )}
                {isEventFull && !isEventPast && (
                  <p className="text-center text-destructive">
                    This event has reached maximum capacity.
                  </p>
                )}
                {event.status !== 'active' && (
                  <p className="text-center text-muted-foreground">
                    This event is not accepting participants.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}