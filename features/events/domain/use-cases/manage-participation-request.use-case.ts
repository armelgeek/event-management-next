import { EventsService } from '../service';
import type { UpdateParticipationRequestInput, ParticipationRequest } from '../../config/events.types';

export async function manageParticipationRequestUseCase(
  requestId: string,
  data: UpdateParticipationRequestInput,
  organizerId: string
): Promise<ParticipationRequest> {
  const eventsService = new EventsService();
  
  // Get the participation request
  const request = await eventsService.getParticipationRequestById(requestId);
  
  // Get the event to verify organizer
  const event = await eventsService.getEventById(request.eventId);
  
  // Check if the user is the event organizer
  if (event.organizerId !== organizerId) {
    throw new Error('Only event organizers can manage participation requests');
  }
  
  // Check if request is still pending
  if (request.status !== 'pending') {
    throw new Error('Can only update pending participation requests');
  }
  
  // If accepting, check if event has capacity
  if (data.status === 'accepted') {
    if (event.currentParticipants >= event.maxParticipants) {
      throw new Error('Event has reached maximum capacity');
    }
  }

  return await eventsService.updateParticipationRequest(requestId, data);
}