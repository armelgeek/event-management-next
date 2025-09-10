import { db } from '@/drizzle/db';
import { events, participationRequests, users, ticketTypes } from '@/drizzle/schema';
import { and, eq, like, gte, lte, sql, desc, asc, count } from 'drizzle-orm';
import type {
  CreateEventInput,
  UpdateEventInput,
  EventFilters,
  Event,
  ParticipationRequest,
  CreateParticipationRequestInput,
  UpdateParticipationRequestInput,
  EventsResponse,
  ParticipationRequestsResponse,
} from '../config/events.types';

export class EventsService {
  // Event CRUD operations
  async createEvent(data: Omit<Event, 'id' | 'currentParticipants' | 'createdAt' | 'updatedAt' | 'organizer' | 'ticketTypes'>): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values({
        ...data,
        date: new Date(data.date),
        endDate: data.endDate ? new Date(data.endDate) : null,
        publishedAt: data.status === 'published' ? new Date() : null,
      })
      .returning();

    return this.getEventById(event.id);
  }

  async getEventById(id: string): Promise<Event> {
    const result = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        shortDescription: events.shortDescription,
        date: events.date,
        endDate: events.endDate,
        location: events.location,
        onlineUrl: events.onlineUrl,
        category: events.category,
        tags: events.tags,
        maxParticipants: events.maxParticipants,
        currentParticipants: events.currentParticipants,
        organizerId: events.organizerId,
        status: events.status,
        eventType: events.eventType,
        imageUrl: events.imageUrl,
        bannerUrl: events.bannerUrl,
        isPublic: events.isPublic,
        requiresApproval: events.requiresApproval,
        allowGuestList: events.allowGuestList,
        timezone: events.timezone,
        currency: events.currency,
        organizerName: events.organizer,
        organizerEmail: events.organizerEmail,
        organizerPhone: events.organizerPhone,
        website: events.website,
        socialMedia: events.socialMedia,
        customFields: events.customFields,
        seoTitle: events.seoTitle,
        seoDescription: events.seoDescription,
        slug: events.slug,
        publishedAt: events.publishedAt,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        organizer: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .where(eq(events.id, id));

    if (!result.length) {
      throw new Error('Event not found');
    }

    const eventData = result[0];

    // Get ticket types for this event
    const eventTicketTypes = await db
      .select({
        id: ticketTypes.id,
        name: ticketTypes.name,
        price: ticketTypes.price,
        quantity: ticketTypes.quantity,
        sold: ticketTypes.sold,
        status: ticketTypes.status,
      })
      .from(ticketTypes)
      .where(eq(ticketTypes.eventId, id))
      .orderBy(ticketTypes.sortOrder, ticketTypes.createdAt);

    return {
      ...eventData,
      ticketTypes: eventTicketTypes,
    } as Event;
  }

  async getEvents(filters: EventFilters): Promise<EventsResponse> {
    const { page, limit, ...otherFilters } = filters;
    const offset = (page - 1) * limit;

    const conditions = [];

    // Build where conditions
    if (otherFilters.category) {
      conditions.push(eq(events.category, otherFilters.category));
    }

    if (otherFilters.location) {
      conditions.push(like(events.location, `%${otherFilters.location}%`));
    }

    if (otherFilters.dateFrom) {
      conditions.push(gte(events.date, new Date(otherFilters.dateFrom)));
    }

    if (otherFilters.dateTo) {
      conditions.push(lte(events.date, new Date(otherFilters.dateTo)));
    }

    if (otherFilters.search) {
      conditions.push(
        sql`${events.title} ILIKE ${`%${otherFilters.search}%`} OR ${events.description} ILIKE ${`%${otherFilters.search}%`}`
      );
    }

    if (otherFilters.eventType) {
      conditions.push(eq(events.eventType, otherFilters.eventType));
    }

    if (otherFilters.status) {
      conditions.push(eq(events.status, otherFilters.status));
    } else {
      // By default, only show published and active events
      conditions.push(sql`${events.status} IN ('published', 'active')`);
    }

    if (otherFilters.isPublic !== undefined) {
      conditions.push(eq(events.isPublic, otherFilters.isPublic));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [countResult] = await db
      .select({ count: count() })
      .from(events)
      .where(whereClause);

    // Get paginated results
    const eventsResult = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        shortDescription: events.shortDescription,
        date: events.date,
        endDate: events.endDate,
        location: events.location,
        onlineUrl: events.onlineUrl,
        category: events.category,
        tags: events.tags,
        maxParticipants: events.maxParticipants,
        currentParticipants: events.currentParticipants,
        organizerId: events.organizerId,
        status: events.status,
        eventType: events.eventType,
        imageUrl: events.imageUrl,
        bannerUrl: events.bannerUrl,
        isPublic: events.isPublic,
        requiresApproval: events.requiresApproval,
        allowGuestList: events.allowGuestList,
        timezone: events.timezone,
        currency: events.currency,
        organizerName: events.organizer,
        organizerEmail: events.organizerEmail,
        organizerPhone: events.organizerPhone,
        website: events.website,
        socialMedia: events.socialMedia,
        customFields: events.customFields,
        seoTitle: events.seoTitle,
        seoDescription: events.seoDescription,
        slug: events.slug,
        publishedAt: events.publishedAt,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        organizer: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .where(whereClause)
      .orderBy(desc(events.createdAt))
      .limit(limit)
      .offset(offset);

    const total = countResult.count;
    const totalPages = Math.ceil(total / limit);

    return {
      events: eventsResult as Event[],
      total,
      page,
      totalPages,
    };
  }

  async updateEvent(id: string, data: Partial<UpdateEventInput>): Promise<Event> {
    const updateData = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date) as any;
    }
    if (data.endDate) {
      updateData.endDate = new Date(data.endDate) as any;
    }
    updateData.updatedAt = new Date() as any;

    const [result] = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();

    if (!result) {
      throw new Error('Event not found');
    }

    return this.getEventById(id);
  }

  async deleteEvent(id: string): Promise<void> {
    const result = await db
      .delete(events)
      .where(eq(events.id, id));

    if (result.rowCount === 0) {
      throw new Error('Event not found');
    }
  }

  async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    const result = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        shortDescription: events.shortDescription,
        date: events.date,
        endDate: events.endDate,
        location: events.location,
        onlineUrl: events.onlineUrl,
        category: events.category,
        tags: events.tags,
        maxParticipants: events.maxParticipants,
        currentParticipants: events.currentParticipants,
        organizerId: events.organizerId,
        status: events.status,
        eventType: events.eventType,
        imageUrl: events.imageUrl,
        bannerUrl: events.bannerUrl,
        isPublic: events.isPublic,
        requiresApproval: events.requiresApproval,
        allowGuestList: events.allowGuestList,
        timezone: events.timezone,
        currency: events.currency,
        organizerName: events.organizer,
        organizerEmail: events.organizerEmail,
        organizerPhone: events.organizerPhone,
        website: events.website,
        socialMedia: events.socialMedia,
        customFields: events.customFields,
        seoTitle: events.seoTitle,
        seoDescription: events.seoDescription,
        slug: events.slug,
        publishedAt: events.publishedAt,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
      })
      .from(events)
      .where(eq(events.organizerId, organizerId))
      .orderBy(desc(events.createdAt));

    return result as Event[];
  }

  // Participation Request methods (keeping existing functionality)
  async createParticipationRequest(
    data: CreateParticipationRequestInput,
    userId: string
  ): Promise<ParticipationRequest> {
    // Check if user already has a request for this event
    const [existing] = await db
      .select()
      .from(participationRequests)
      .where(
        and(
          eq(participationRequests.eventId, data.eventId),
          eq(participationRequests.userId, userId)
        )
      );

    if (existing) {
      throw new Error('You have already requested to participate in this event');
    }

    const [result] = await db
      .insert(participationRequests)
      .values({
        ...data,
        userId,
      })
      .returning();

    return this.getParticipationRequestById(result.id);
  }

  async getParticipationRequestById(id: string): Promise<ParticipationRequest> {
    const result = await db
      .select({
        id: participationRequests.id,
        eventId: participationRequests.eventId,
        userId: participationRequests.userId,
        status: participationRequests.status,
        message: participationRequests.message,
        createdAt: participationRequests.createdAt,
        updatedAt: participationRequests.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(participationRequests)
      .leftJoin(users, eq(participationRequests.userId, users.id))
      .where(eq(participationRequests.id, id));

    if (!result[0]) {
      throw new Error('Participation request not found');
    }

    return result[0] as ParticipationRequest;
  }

  async getParticipationRequestsByEvent(eventId: string): Promise<ParticipationRequest[]> {
    const result = await db
      .select({
        id: participationRequests.id,
        eventId: participationRequests.eventId,
        userId: participationRequests.userId,
        status: participationRequests.status,
        message: participationRequests.message,
        createdAt: participationRequests.createdAt,
        updatedAt: participationRequests.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(participationRequests)
      .leftJoin(users, eq(participationRequests.userId, users.id))
      .where(eq(participationRequests.eventId, eventId))
      .orderBy(desc(participationRequests.createdAt));

    return result as ParticipationRequest[];
  }

  async getParticipationRequestsByUser(userId: string): Promise<ParticipationRequest[]> {
    const result = await db
      .select({
        id: participationRequests.id,
        eventId: participationRequests.eventId,
        userId: participationRequests.userId,
        status: participationRequests.status,
        message: participationRequests.message,
        createdAt: participationRequests.createdAt,
        updatedAt: participationRequests.updatedAt,
        event: {
          id: events.id,
          title: events.title,
          description: events.description,
          date: events.date,
          location: events.location,
          category: events.category,
          maxParticipants: events.maxParticipants,
          currentParticipants: events.currentParticipants,
          organizerId: events.organizerId,
          status: events.status,
          imageUrl: events.imageUrl,
          createdAt: events.createdAt,
          updatedAt: events.updatedAt,
        },
      })
      .from(participationRequests)
      .leftJoin(events, eq(participationRequests.eventId, events.id))
      .where(eq(participationRequests.userId, userId))
      .orderBy(desc(participationRequests.createdAt));

    return result as ParticipationRequest[];
  }

  async updateParticipationRequest(
    id: string,
    data: UpdateParticipationRequestInput
  ): Promise<ParticipationRequest> {
    const updateData = { ...data, updatedAt: new Date() };

    const [result] = await db
      .update(participationRequests)
      .set(updateData)
      .where(eq(participationRequests.id, id))
      .returning();

    if (!result) {
      throw new Error('Participation request not found');
    }

    // Update event participant count if status changed to accepted/rejected
    if (data.status === 'accepted') {
      await db
        .update(events)
        .set({
          currentParticipants: sql`${events.currentParticipants} + 1`,
        })
        .where(eq(events.id, result.eventId));
    }

    return this.getParticipationRequestById(id);
  }

  async getUserParticipationStatus(eventId: string, userId: string): Promise<ParticipationRequest | null> {
    const [result] = await db
      .select()
      .from(participationRequests)
      .where(
        and(
          eq(participationRequests.eventId, eventId),
          eq(participationRequests.userId, userId)
        )
      );

    return result as ParticipationRequest || null;
  }
}