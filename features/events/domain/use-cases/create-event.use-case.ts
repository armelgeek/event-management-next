import { EventsService } from '../service';
import type { CreateEventInput, Event } from '../../config/events.types';

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

  // Validate max participants is reasonable
  if (data.maxParticipants < 1) {
    throw new Error('Maximum participants must be at least 1');
  }

  return await eventsService.createEvent({
    ...data,
    organizerId,
  });
}