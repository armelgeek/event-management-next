import { EventsService } from '../service';
import type { CreateParticipationRequestInput, ParticipationRequest } from '../../config/events.types';

export async function requestParticipationUseCase(
  data: CreateParticipationRequestInput,
  userId: string
): Promise<ParticipationRequest> {
  const eventsService = new EventsService();
  
  // Get the event to validate
  const event = await eventsService.getEventById(data.eventId);
  
  // Check if event is active
  if (event.status !== 'active') {
    throw new Error('Cannot request participation in inactive events');
  }
  
  // Check if event is in the future
  if (event.date <= new Date()) {
    throw new Error('Cannot request participation in past events');
  }
  
  // Check if event has reached capacity
  if (event.currentParticipants >= event.maxParticipants) {
    throw new Error('Event has reached maximum capacity');
  }
  
  // Check if user is not the organizer
  if (event.organizerId === userId) {
    throw new Error('Event organizers cannot request participation in their own events');
  }

  return await eventsService.createParticipationRequest({
    ...data,
    userId,
  });
}