import { db } from '@/drizzle/db';
import { events, participationRequests, users } from '@/drizzle/schema';
import { and, eq, like, gte, lte, sql, desc, asc } from 'drizzle-orm';
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
  async createEvent(data: CreateEventInput & { organizerId: string }): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values({
        ...data,
        date: new Date(data.date),
        organizerId: data.organizerId,
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
        organizer: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .where(eq(events.id, id))
      .limit(1);

    if (!result[0]) {
      throw new Error('Event not found');
    }

    return result[0] as Event;
  }

  async getEvents(filters: EventFilters): Promise<EventsResponse> {
    const { category, location, dateFrom, dateTo, search, page, limit } = filters;
    const offset = (page - 1) * limit;

    const conditions = [];

    // Only show active events by default
    conditions.push(eq(events.status, 'active'));

    if (category) {
      conditions.push(eq(events.category, category));
    }

    if (location) {
      conditions.push(like(events.location, `%${location}%`));
    }

    if (dateFrom) {
      conditions.push(gte(events.date, new Date(dateFrom)));
    }

    if (dateTo) {
      conditions.push(lte(events.date, new Date(dateTo)));
    }

    if (search) {
      conditions.push(
        sql`(${events.title} ILIKE ${`%${search}%`} OR ${events.description} ILIKE ${`%${search}%`})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [eventsResult, countResult] = await Promise.all([
      db
        .select({
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
        .orderBy(desc(events.date))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(events)
        .where(whereClause),
    ]);

    const total = countResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      events: eventsResult as Event[],
      total,
      page,
      totalPages,
    };
  }

  async updateEvent(id: string, data: Partial<UpdateEventInput>): Promise<Event> {
    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }
    updateData.updatedAt = new Date();

    await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id));

    return this.getEventById(id);
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    const result = await db
      .select({
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
      })
      .from(events)
      .where(eq(events.organizerId, organizerId))
      .orderBy(desc(events.createdAt));

    return result as Event[];
  }

  // Participation request operations
  async createParticipationRequest(
    data: CreateParticipationRequestInput & { userId: string }
  ): Promise<ParticipationRequest> {
    // Check if user already has a request for this event
    const existing = await db
      .select()
      .from(participationRequests)
      .where(
        and(
          eq(participationRequests.eventId, data.eventId),
          eq(participationRequests.userId, data.userId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new Error('You have already requested to participate in this event');
    }

    const [request] = await db
      .insert(participationRequests)
      .values(data)
      .returning();

    return this.getParticipationRequestById(request.id);
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
      .where(eq(participationRequests.id, id))
      .limit(1);

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

    await db
      .update(participationRequests)
      .set(updateData)
      .where(eq(participationRequests.id, id));

    // If accepting a request, increment current participants
    if (data.status === 'accepted') {
      const request = await this.getParticipationRequestById(id);
      await db
        .update(events)
        .set({
          currentParticipants: sql`${events.currentParticipants} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(events.id, request.eventId));
    }

    return this.getParticipationRequestById(id);
  }

  async getUserParticipationStatus(eventId: string, userId: string): Promise<ParticipationRequest | null> {
    const result = await db
      .select()
      .from(participationRequests)
      .where(
        and(
          eq(participationRequests.eventId, eventId),
          eq(participationRequests.userId, userId)
        )
      )
      .limit(1);

    return result[0] as ParticipationRequest || null;
  }
}