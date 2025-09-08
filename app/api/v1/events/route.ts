import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { headers } from 'next/headers';
import { EventsService } from '@/features/events/domain/service';
import { createEventUseCase } from '@/features/events/domain/use-cases/create-event.use-case';
import { createEventSchema, eventFiltersSchema } from '@/features/events/config/events.schema';

// GET /api/v1/events - Get events with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      category: searchParams.get('category') || undefined,
      location: searchParams.get('location') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    };

    // Validate filters
    const validatedFilters = eventFiltersSchema.parse(filters);
    
    const eventsService = new EventsService();
    const result = await eventsService.getEvents(validatedFilters);

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/v1/events error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = createEventSchema.parse(body);
    
    // Create event
    const event = await createEventUseCase(validatedData, session.user.id);

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/events error:', error);
    
    if (error instanceof Error && error.message.includes('future')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}