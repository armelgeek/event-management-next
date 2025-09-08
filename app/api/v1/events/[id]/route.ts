import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { headers } from 'next/headers';
import { EventsService } from '@/features/events/domain/service';
import { updateEventSchema } from '@/features/events/config/events.schema';

// GET /api/v1/events/[id] - Get a single event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    
    const eventsService = new EventsService();
    const event = await eventsService.getEventById(eventId);

    return NextResponse.json(event);
  } catch (error) {
    console.error('GET /api/v1/events/[id] error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/events/[id] - Update an event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: eventId } = await params;
    const body = await request.json();
    
    const eventsService = new EventsService();
    
    // Check if user is the organizer
    const event = await eventsService.getEventById(eventId);
    if (event.organizerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Validate input
    const validatedData = updateEventSchema.parse({ ...body, id: eventId });
    
    // Update event
    const updatedEvent = await eventsService.updateEvent(eventId, validatedData);

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('PUT /api/v1/events/[id] error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/events/[id] - Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: eventId } = await params;
    
    const eventsService = new EventsService();
    
    // Check if user is the organizer
    const event = await eventsService.getEventById(eventId);
    if (event.organizerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Delete event
    await eventsService.deleteEvent(eventId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/v1/events/[id] error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}