import { TicketsService } from '../service';
import type { 
  CreateOrderInput, 
  Order, 
  TicketPurchase, 
  Ticket,
  AttendeeInfo 
} from '../../config/tickets.types';
import { db } from '@/drizzle/db';
import { ticketTypes, tickets, ticketPurchases } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function purchaseTicketsUseCase(
  data: CreateOrderInput,
  userId: string
): Promise<{ order: Order; tickets: Ticket[] }> {
  const ticketsService = new TicketsService();

  // Start transaction
  return await db.transaction(async (tx) => {
    let totalAmount = 0;
    const purchasesData: any[] = [];
    const ticketsData: any[] = [];

    // Process each ticket purchase
    for (const purchase of data.ticketPurchases) {
      // Get ticket type information
      const [ticketType] = await tx
        .select()
        .from(ticketTypes)
        .where(eq(ticketTypes.id, purchase.ticketTypeId));

      if (!ticketType) {
        throw new Error(`Ticket type ${purchase.ticketTypeId} not found`);
      }

      // Check availability
      const availableQuantity = ticketType.quantity - ticketType.sold;
      if (purchase.quantity > availableQuantity) {
        throw new Error(`Only ${availableQuantity} tickets available for ${ticketType.name}`);
      }

      // Check max per purchase limit
      if (ticketType.maxPerPurchase && purchase.quantity > ticketType.maxPerPurchase) {
        throw new Error(`Maximum ${ticketType.maxPerPurchase} tickets allowed per purchase for ${ticketType.name}`);
      }

      // Check sale dates
      const now = new Date();
      if (ticketType.saleStartDate && now < ticketType.saleStartDate) {
        throw new Error(`Sales for ${ticketType.name} haven't started yet`);
      }
      if (ticketType.saleEndDate && now > ticketType.saleEndDate) {
        throw new Error(`Sales for ${ticketType.name} have ended`);
      }

      // Validate attendee info
      if (purchase.attendeeInfo.length !== purchase.quantity) {
        throw new Error('Attendee information must be provided for each ticket');
      }

      const unitPrice = parseFloat(ticketType.price);
      const purchaseTotal = unitPrice * purchase.quantity;
      totalAmount += purchaseTotal;

      // Create purchase record
      const purchaseData = {
        ticketTypeId: purchase.ticketTypeId,
        eventId: data.eventId,
        userId,
        quantity: purchase.quantity,
        unitPrice: unitPrice.toString(),
        totalPrice: purchaseTotal.toString(),
        currency: ticketType.currency,
        status: 'pending' as const,
        attendeeInfo: JSON.stringify(purchase.attendeeInfo),
        isUsed: false,
      };
      
      purchasesData.push(purchaseData);

      // Create individual tickets
      for (let i = 0; i < purchase.quantity; i++) {
        const attendee = purchase.attendeeInfo[i];
        const ticketNumber = await ticketsService.generateTicketNumber();
        const qrCode = await ticketsService.generateQRCode();

        ticketsData.push({
          ticketTypeId: purchase.ticketTypeId,
          eventId: data.eventId,
          userId,
          ticketNumber,
          qrCode,
          attendeeName: attendee.name,
          attendeeEmail: attendee.email,
          isTransferable: true,
          isUsed: false,
        });
      }

      // Update sold count
      await tx
        .update(ticketTypes)
        .set({ 
          sold: ticketType.sold + purchase.quantity,
          status: (ticketType.sold + purchase.quantity >= ticketType.quantity) ? 'sold_out' : 'active'
        })
        .where(eq(ticketTypes.id, purchase.ticketTypeId));
    }

    // Create order
    const orderData = {
      userId,
      eventId: data.eventId,
      totalAmount: totalAmount.toString(),
      currency: data.ticketPurchases[0] ? 
        (await tx.select().from(ticketTypes).where(eq(ticketTypes.id, data.ticketPurchases[0].ticketTypeId)))[0]?.currency || 'EUR' 
        : 'EUR',
      status: 'pending' as const,
      billingEmail: data.billingEmail,
      billingName: data.billingName,
      billingAddress: data.billingAddress ? JSON.stringify(data.billingAddress) : null,
    };

    const order = await ticketsService.createOrder(orderData);

    // Create ticket purchases
    const createdPurchases: TicketPurchase[] = [];
    for (const purchaseData of purchasesData) {
      const [purchase] = await tx
        .insert(ticketPurchases)
        .values(purchaseData)
        .returning();
      createdPurchases.push(purchase as TicketPurchase);
    }

    // Create tickets with order and purchase references
    const createdTickets: Ticket[] = [];
    for (let i = 0; i < ticketsData.length; i++) {
      const ticketData = ticketsData[i];
      // Find the corresponding purchase for this ticket
      const correspondingPurchase = createdPurchases.find(p => 
        p.ticketTypeId === ticketData.ticketTypeId
      );

      const [ticket] = await tx
        .insert(tickets)
        .values({
          ...ticketData,
          orderId: order.id,
          ticketPurchaseId: correspondingPurchase?.id || '',
        })
        .returning();
      
      createdTickets.push(ticket as Ticket);
    }

    return { order, tickets: createdTickets };
  });
}