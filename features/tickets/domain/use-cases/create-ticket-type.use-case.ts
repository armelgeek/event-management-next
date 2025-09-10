import { TicketsService } from '../service';
import type { CreateTicketTypeInput, TicketType } from '../../config/tickets.types';

export async function createTicketTypeUseCase(
  data: CreateTicketTypeInput,
  userId: string
): Promise<TicketType> {
  const ticketsService = new TicketsService();

  // Validate sale dates
  if (data.saleStartDate && data.saleEndDate) {
    const startDate = new Date(data.saleStartDate);
    const endDate = new Date(data.saleEndDate);
    
    if (startDate >= endDate) {
      throw new Error('Sale start date must be before sale end date');
    }
  }

  // Validate refund deadline
  if (data.refundDeadline && data.saleEndDate) {
    const refundDeadline = new Date(data.refundDeadline);
    const saleEndDate = new Date(data.saleEndDate);
    
    if (refundDeadline > saleEndDate) {
      throw new Error('Refund deadline cannot be after sale end date');
    }
  }

  // Validate price for paid tickets
  if (data.price > 0 && !data.currency) {
    throw new Error('Currency is required for paid tickets');
  }

  // Create the ticket type
  const ticketType = await ticketsService.createTicketType({
    eventId: data.eventId,
    name: data.name,
    description: data.description || null,
    price: data.price.toString(),
    currency: data.currency,
    quantity: data.quantity,
    sold: 0,
    maxPerPurchase: data.maxPerPurchase || null,
    saleStartDate: data.saleStartDate ? new Date(data.saleStartDate) : null,
    saleEndDate: data.saleEndDate ? new Date(data.saleEndDate) : null,
    status: 'active',
    isRefundable: data.isRefundable,
    refundDeadline: data.refundDeadline ? new Date(data.refundDeadline) : null,
    sortOrder: data.sortOrder || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return ticketType;
}