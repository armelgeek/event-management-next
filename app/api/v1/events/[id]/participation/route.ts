import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { headers } from 'next/headers';
import { EventsService } from '@/features/events/domain/service';
import { requestParticipationUseCase } from '@/features/events/domain/use-cases/request-participation.use-case';
import { createParticipationRequestSchema } from '@/features/events/config/events.schema';

// GET /api/v1/events/[id]/participation - Get participation requests for an event
export async function GET(
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
    
    // Get participation requests
    const requests = await eventsService.getParticipationRequestsByEvent(eventId);

    return NextResponse.json(requests);
  } catch (error) {
    console.error('GET /api/v1/events/[id]/participation error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/events/[id]/participation - Request participation in an event
export async function POST(
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
    
    // Validate input
    const validatedData = createParticipationRequestSchema.parse({
      ...body,
      eventId,
    });
    
    // Request participation
    const participationRequest = await requestParticipationUseCase(validatedData, session.user.id);

    return NextResponse.json(participationRequest, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/events/[id]/participation error:', error);
    
    if (error instanceof Error && (
      error.message.includes('already requested') ||
      error.message.includes('inactive events') ||
      error.message.includes('past events') ||
      error.message.includes('maximum capacity') ||
      error.message.includes('own events')
    )) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}