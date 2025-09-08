'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, Users, Clock, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

// Mock data - this would come from APIs in a real implementation
const mockOrganizerEvents = [
  {
    id: '1',
    title: 'React Meetup',
    date: new Date('2024-12-15T18:00:00'),
    currentParticipants: 15,
    maxParticipants: 20,
    status: 'active' as const,
    pendingRequests: 3,
  },
  {
    id: '2', 
    title: 'Tech Conference 2024',
    date: new Date('2024-12-20T09:00:00'),
    currentParticipants: 45,
    maxParticipants: 50,
    status: 'active' as const,
    pendingRequests: 0,
  },
];

const mockParticipantEvents = [
  {
    id: '3',
    title: 'Design Workshop',
    date: new Date('2024-12-10T14:00:00'),
    status: 'accepted' as const,
    organizer: 'John Smith',
  },
  {
    id: '4',
    title: 'Startup Pitch Night',
    date: new Date('2024-12-18T19:00:00'),
    status: 'pending' as const,
    organizer: 'Jane Doe',
  },
  {
    id: '5',
    title: 'Book Club Meeting',
    date: new Date('2024-12-08T16:00:00'),
    status: 'rejected' as const,
    organizer: 'Alice Johnson',
  },
];

export default function DashboardPage() {
  const router = useRouter();

  const handleCreateEvent = () => {
    router.push('/events/create');
  };

  const handleViewEvent = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your events and participation requests
          </p>
        </div>
        <Button onClick={handleCreateEvent} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="organized" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="organized">Events I Organize</TabsTrigger>
          <TabsTrigger value="participating">My Participations</TabsTrigger>
        </TabsList>

        {/* Events I Organize */}
        <TabsContent value="organized" className="space-y-4">
          {mockOrganizerEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No events yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t created any events yet. Create your first event to get started!
                </p>
                <Button onClick={handleCreateEvent} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockOrganizerEvents.map((event) => (
                <Card key={event.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{format(event.date, 'MMM d, yyyy • h:mm a')}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{event.currentParticipants}/{event.maxParticipants} participants</span>
                    </div>

                    {event.pendingRequests > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {event.pendingRequests} pending request{event.pendingRequests !== 1 ? 's' : ''}
                      </Badge>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleViewEvent(event.id)}
                        className="flex-1"
                      >
                        View
                      </Button>
                      <Button size="sm" variant="ghost" className="gap-1">
                        <Settings className="h-3 w-3" />
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Events I'm Participating In */}
        <TabsContent value="participating" className="space-y-4">
          {mockParticipantEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No participations yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t joined any events yet. Browse events to find something interesting!
                </p>
                <Button onClick={() => router.push('/events')} variant="outline">
                  Browse Events
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {mockParticipantEvents.map((event) => (
                <Card key={event.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{format(event.date, 'MMM d, yyyy • h:mm a')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>by {event.organizer}</span>
                          </div>
                        </div>
                      </div>

                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewEvent(event.id)}
                      >
                        View Event
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}