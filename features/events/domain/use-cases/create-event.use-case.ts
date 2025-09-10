import { EventsService } from '../service';
import { TicketsService } from '@/features/tickets/domain/service';
import { createTicketTypeUseCase } from '@/features/tickets/domain/use-cases/create-ticket-type.use-case';
import type { CreateEventInput, Event } from '../../config/events.types';
import { db } from '@/drizzle/db';
import slugify from 'slugify';

export async function createEventUseCase(
  data: CreateEventInput,
  organizerId: string
): Promise<Event> {
  const eventsService = new EventsService();
  
  // Validate that the date is in the future
  const eventDate = new Date(data.date);
  if (eventDate <= new Date()) {
    throw new Error('Event date must be in the future');
  }

  // Validate end date if provided
  if (data.endDate) {
    const endDate = new Date(data.endDate);
    if (endDate <= eventDate) {
      throw new Error('Event end date must be after start date');
    }
  }

  // Validate max participants if provided
  if (data.maxParticipants && data.maxParticipants < 1) {
    throw new Error('Maximum participants must be at least 1');
  }

  // Generate slug from title
  const slug = slugify(data.title, { lower: true, strict: true });

  // Prepare event data (remove ticketTypes as they're handled separately)
  const { ticketTypes, ...eventDataWithoutTickets } = data;
  const eventData = {
    ...eventDataWithoutTickets,
    organizerId,
    slug,
    tags: data.tags ? JSON.stringify(data.tags) : null,
    socialMedia: data.socialMedia ? JSON.stringify(data.socialMedia) : null,
    status: 'draft' as const, // Start as draft, can be published later
    organizerName: data.organizer || null, // Organization name if different from user
    customFields: null, // No custom fields by default
    publishedAt: null, // Will be set when published
  };

  // Create event and ticket types in a transaction
  return await db.transaction(async (tx) => {
    // Create the event
    const event = await eventsService.createEvent(eventData);

    // Create ticket types if provided
    if (data.ticketTypes && data.ticketTypes.length > 0) {
      const ticketsService = new TicketsService();
      
      for (const [index, ticketTypeData] of data.ticketTypes.entries()) {
        await createTicketTypeUseCase(
          {
            eventId: event.id,
            name: ticketTypeData.name,
            description: ticketTypeData.description,
            price: ticketTypeData.price,
            currency: data.currency,
            quantity: ticketTypeData.quantity,
            maxPerPurchase: ticketTypeData.maxPerPurchase,
            saleStartDate: ticketTypeData.saleStartDate,
            saleEndDate: ticketTypeData.saleEndDate,
            isRefundable: ticketTypeData.isRefundable,
            refundDeadline: ticketTypeData.refundDeadline,
            sortOrder: index,
          },
          organizerId
        );
      }
    }

    return event;
  });
}