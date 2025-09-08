'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateEventForm } from '@/features/events/components/organisms/create-event-form';
import { useRouter } from 'next/navigation';

export default function CreateEventPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleEventCreated = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Button onClick={handleBack} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
        <h1 className="text-3xl font-bold">Create New Event</h1>
        <p className="text-muted-foreground mt-1">
          Fill in the details below to create your event
        </p>
      </div>

      {/* Form */}
      <CreateEventForm onSuccess={handleEventCreated} />
    </div>
  );
}