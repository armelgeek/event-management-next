import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { headers } from 'next/headers';
import { purchaseTicketsUseCase } from '@/features/tickets/domain/use-cases/purchase-tickets.use-case';
import { createOrderSchema } from '@/features/tickets/config/tickets.schema';

// POST /api/v1/tickets/purchase - Purchase tickets
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = createOrderSchema.parse(body);
    
    // Process ticket purchase
    const result = await purchaseTicketsUseCase(validatedData, session.user.id);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/tickets/purchase error:', error);
    
    if (error instanceof Error && (
      error.message.includes('not found') ||
      error.message.includes('available') ||
      error.message.includes('Maximum') ||
      error.message.includes('Sales') ||
      error.message.includes('Attendee information')
    )) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}