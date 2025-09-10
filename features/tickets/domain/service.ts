import { and, eq, gte, lte, desc, sql, count } from 'drizzle-orm';
import { db } from '@/drizzle/db';
import { 
  ticketTypes, 
  ticketPurchases, 
  orders, 
  tickets, 
  eventAnalytics,
  events,
  users 
} from '@/drizzle/schema';
import type {
  TicketType,
  TicketPurchase,
  Order,
  Ticket,
  EventAnalytics,
  TicketFilters,
  TicketTypesResponse,
  TicketPurchasesResponse,
  OrdersResponse,
  TicketsResponse,
  TicketAnalyticsResponse,
} from '../config/tickets.types';

export class TicketsService {
  // Ticket Types Management
  async getTicketTypesByEvent(eventId: string): Promise<TicketTypesResponse> {
    const result = await db
      .select({
        id: ticketTypes.id,
        eventId: ticketTypes.eventId,
        name: ticketTypes.name,
        description: ticketTypes.description,
        price: ticketTypes.price,
        currency: ticketTypes.currency,
        quantity: ticketTypes.quantity,
        sold: ticketTypes.sold,
        maxPerPurchase: ticketTypes.maxPerPurchase,
        saleStartDate: ticketTypes.saleStartDate,
        saleEndDate: ticketTypes.saleEndDate,
        status: ticketTypes.status,
        isRefundable: ticketTypes.isRefundable,
        refundDeadline: ticketTypes.refundDeadline,
        sortOrder: ticketTypes.sortOrder,
        createdAt: ticketTypes.createdAt,
        updatedAt: ticketTypes.updatedAt,
      })
      .from(ticketTypes)
      .where(eq(ticketTypes.eventId, eventId))
      .orderBy(ticketTypes.sortOrder, ticketTypes.createdAt);

    return {
      ticketTypes: result as TicketType[],
      total: result.length,
    };
  }

  async createTicketType(data: Omit<TicketType, 'id' | 'sold' | 'createdAt' | 'updatedAt'>): Promise<TicketType> {
    const [result] = await db
      .insert(ticketTypes)
      .values({
        ...data,
        price: data.price.toString(),
        saleStartDate: data.saleStartDate ? new Date(data.saleStartDate) : null,
        saleEndDate: data.saleEndDate ? new Date(data.saleEndDate) : null,
        refundDeadline: data.refundDeadline ? new Date(data.refundDeadline) : null,
      })
      .returning();

    return result as TicketType;
  }

  async updateTicketType(id: string, data: Partial<TicketType>): Promise<TicketType> {
    const [result] = await db
      .update(ticketTypes)
      .set({
        ...data,
        price: data.price ? data.price.toString() : undefined,
        saleStartDate: data.saleStartDate ? new Date(data.saleStartDate) : undefined,
        saleEndDate: data.saleEndDate ? new Date(data.saleEndDate) : undefined,
        refundDeadline: data.refundDeadline ? new Date(data.refundDeadline) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(ticketTypes.id, id))
      .returning();

    if (!result) {
      throw new Error('Ticket type not found');
    }

    return result as TicketType;
  }

  async deleteTicketType(id: string): Promise<void> {
    const result = await db
      .delete(ticketTypes)
      .where(eq(ticketTypes.id, id));

    if (result.rowCount === 0) {
      throw new Error('Ticket type not found');
    }
  }

  // Ticket Purchases Management
  async getTicketPurchases(filters: TicketFilters): Promise<TicketPurchasesResponse> {
    const conditions = [];

    if (filters.eventId) {
      conditions.push(eq(ticketPurchases.eventId, filters.eventId));
    }

    if (filters.userId) {
      conditions.push(eq(ticketPurchases.userId, filters.userId));
    }

    if (filters.status) {
      conditions.push(eq(ticketPurchases.status, filters.status));
    }

    if (filters.dateFrom) {
      conditions.push(gte(ticketPurchases.createdAt, new Date(filters.dateFrom)));
    }

    if (filters.dateTo) {
      conditions.push(lte(ticketPurchases.createdAt, new Date(filters.dateTo)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(ticketPurchases)
      .where(whereClause);

    // Get paginated results
    const offset = (filters.page - 1) * filters.limit;
    const result = await db
      .select({
        id: ticketPurchases.id,
        ticketTypeId: ticketPurchases.ticketTypeId,
        eventId: ticketPurchases.eventId,
        userId: ticketPurchases.userId,
        quantity: ticketPurchases.quantity,
        unitPrice: ticketPurchases.unitPrice,
        totalPrice: ticketPurchases.totalPrice,
        currency: ticketPurchases.currency,
        status: ticketPurchases.status,
        paymentIntentId: ticketPurchases.paymentIntentId,
        refundAmount: ticketPurchases.refundAmount,
        refundReason: ticketPurchases.refundReason,
        attendeeInfo: ticketPurchases.attendeeInfo,
        qrCode: ticketPurchases.qrCode,
        isUsed: ticketPurchases.isUsed,
        usedAt: ticketPurchases.usedAt,
        createdAt: ticketPurchases.createdAt,
        updatedAt: ticketPurchases.updatedAt,
        // Join with ticket type
        ticketTypeName: ticketTypes.name,
        ticketTypePrice: ticketTypes.price,
        // Join with event
        eventTitle: events.title,
        eventDate: events.date,
        eventLocation: events.location,
        // Join with user
        userName: users.name,
        userEmail: users.email,
      })
      .from(ticketPurchases)
      .leftJoin(ticketTypes, eq(ticketPurchases.ticketTypeId, ticketTypes.id))
      .leftJoin(events, eq(ticketPurchases.eventId, events.id))
      .leftJoin(users, eq(ticketPurchases.userId, users.id))
      .where(whereClause)
      .orderBy(desc(ticketPurchases.createdAt))
      .limit(filters.limit)
      .offset(offset);

    const purchases: TicketPurchase[] = result.map(row => ({
      id: row.id,
      ticketTypeId: row.ticketTypeId,
      eventId: row.eventId,
      userId: row.userId,
      quantity: row.quantity,
      unitPrice: row.unitPrice,
      totalPrice: row.totalPrice,
      currency: row.currency,
      status: row.status as any,
      paymentIntentId: row.paymentIntentId,
      refundAmount: row.refundAmount,
      refundReason: row.refundReason,
      attendeeInfo: row.attendeeInfo,
      qrCode: row.qrCode,
      isUsed: row.isUsed,
      usedAt: row.usedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      ticketType: row.ticketTypeName ? {
        id: row.ticketTypeId,
        name: row.ticketTypeName,
        price: row.ticketTypePrice,
      } as any : undefined,
      event: row.eventTitle ? {
        id: row.eventId,
        title: row.eventTitle,
        date: row.eventDate,
        location: row.eventLocation,
      } : undefined,
      user: row.userName ? {
        id: row.userId,
        name: row.userName,
        email: row.userEmail,
      } : undefined,
    }));

    const totalPages = Math.ceil(totalCount / filters.limit);

    return {
      purchases,
      total: totalCount,
      page: filters.page,
      totalPages,
    };
  }

  async createTicketPurchase(data: Omit<TicketPurchase, 'id' | 'createdAt' | 'updatedAt'>): Promise<TicketPurchase> {
    const [result] = await db
      .insert(ticketPurchases)
      .values({
        ...data,
        unitPrice: data.unitPrice.toString(),
        totalPrice: data.totalPrice.toString(),
        refundAmount: data.refundAmount ? data.refundAmount.toString() : null,
        usedAt: data.usedAt ? new Date(data.usedAt) : null,
      })
      .returning();

    return result as TicketPurchase;
  }

  async updateTicketPurchase(id: string, data: Partial<TicketPurchase>): Promise<TicketPurchase> {
    const [result] = await db
      .update(ticketPurchases)
      .set({
        ...data,
        unitPrice: data.unitPrice ? data.unitPrice.toString() : undefined,
        totalPrice: data.totalPrice ? data.totalPrice.toString() : undefined,
        refundAmount: data.refundAmount ? data.refundAmount.toString() : undefined,
        usedAt: data.usedAt ? new Date(data.usedAt) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(ticketPurchases.id, id))
      .returning();

    if (!result) {
      throw new Error('Ticket purchase not found');
    }

    return result as TicketPurchase;
  }

  // Orders Management
  async createOrder(data: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    // Generate unique order number
    const orderNumber = await this.generateOrderNumber();

    const [result] = await db
      .insert(orders)
      .values({
        ...data,
        orderNumber,
        totalAmount: data.totalAmount.toString(),
        refundAmount: data.refundAmount ? data.refundAmount.toString() : null,
      })
      .returning();

    return result as Order;
  }

  async getOrderById(id: string): Promise<Order | null> {
    const [result] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));

    return result as Order || null;
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order> {
    const [result] = await db
      .update(orders)
      .set({
        ...data,
        totalAmount: data.totalAmount ? data.totalAmount.toString() : undefined,
        refundAmount: data.refundAmount ? data.refundAmount.toString() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    if (!result) {
      throw new Error('Order not found');
    }

    return result as Order;
  }

  // Ticket Validation
  async validateTicket(qrCode: string, eventId: string): Promise<Ticket | null> {
    const [result] = await db
      .select()
      .from(tickets)
      .where(and(
        eq(tickets.qrCode, qrCode),
        eq(tickets.eventId, eventId)
      ));

    return result as Ticket || null;
  }

  async markTicketAsUsed(ticketId: string, scannedBy: string): Promise<Ticket> {
    const [result] = await db
      .update(tickets)
      .set({
        isUsed: true,
        usedAt: new Date(),
        scannedBy,
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, ticketId))
      .returning();

    if (!result) {
      throw new Error('Ticket not found');
    }

    return result as Ticket;
  }

  // Analytics
  async getEventAnalytics(eventId: string, dateFrom?: string, dateTo?: string): Promise<TicketAnalyticsResponse> {
    const conditions = [eq(eventAnalytics.eventId, eventId)];

    if (dateFrom) {
      conditions.push(gte(eventAnalytics.date, new Date(dateFrom)));
    }

    if (dateTo) {
      conditions.push(lte(eventAnalytics.date, new Date(dateTo)));
    }

    const analytics = await db
      .select()
      .from(eventAnalytics)
      .where(and(...conditions))
      .orderBy(desc(eventAnalytics.date));

    // Calculate summary statistics
    const summary = analytics.reduce(
      (acc, curr) => ({
        totalRevenue: (parseFloat(acc.totalRevenue) + parseFloat(curr.revenue)).toString(),
        totalTicketsSold: acc.totalTicketsSold + curr.ticketsSold,
        totalRefunds: (parseFloat(acc.totalRefunds) + parseFloat(curr.refunds)).toString(),
        averageTicketPrice: '0', // Will calculate after
        conversionRate: '0', // Will calculate after
      }),
      {
        totalRevenue: '0',
        totalTicketsSold: 0,
        totalRefunds: '0',
        averageTicketPrice: '0',
        conversionRate: '0',
      }
    );

    // Calculate average ticket price
    if (summary.totalTicketsSold > 0) {
      summary.averageTicketPrice = (parseFloat(summary.totalRevenue) / summary.totalTicketsSold).toFixed(2);
    }

    return {
      analytics: analytics as EventAnalytics[],
      summary,
    };
  }

  // Helper methods
  private async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  async generateTicketNumber(): Promise<string> {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `TKT-${timestamp}-${random}`;
  }

  async generateQRCode(): Promise<string> {
    // Generate a unique QR code string
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 15);
    return `${timestamp}-${random}`;
  }
}