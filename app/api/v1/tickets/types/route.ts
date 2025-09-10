import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { headers } from 'next/headers';
import { TicketsService } from '@/features/tickets/domain/service';
import { createTicketTypeUseCase } from '@/features/tickets/domain/use-cases/create-ticket-type.use-case';
import { createTicketTypeSchema } from '@/features/tickets/config/tickets.schema';

// GET /api/v1/tickets/types?eventId={eventId} - Get ticket types for an event
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const ticketsService = new TicketsService();
    const result = await ticketsService.getTicketTypesByEvent(eventId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/v1/tickets/types error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/tickets/types - Create a new ticket type
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = createTicketTypeSchema.parse(body);
    
    // Create ticket type
    const ticketType = await createTicketTypeUseCase(validatedData, session.user.id);

    return NextResponse.json(ticketType, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/tickets/types error:', error);
    
    if (error instanceof Error && (
      error.message.includes('Sale start date') ||
      error.message.includes('Refund deadline') ||
      error.message.includes('Currency is required')
    )) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}