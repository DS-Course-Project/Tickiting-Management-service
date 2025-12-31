import { db } from "./db";
import { ticket, ticketStatusEnum, ticketPriorityEnum } from "./db/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";

export const ticketService = {
  createTicket: async (data: {
    title: string;
    description: string;
    userId: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
  }) => {
    const [newTicket] = await db
      .insert(ticket)
      .values({
        title: data.title,
        description: data.description,
        userId: data.userId,
        priority: data.priority || "MEDIUM",
      })
      .returning();
    return newTicket;
  },

  getTicket: async (id: string) => {
    const result = await db.select().from(ticket).where(eq(ticket.id, id));
    return result[0] || null;
  },

  listTickets: async (
    page: number = 1,
    limit: number = 10,
    filters?: { status?: string; priority?: string; userId?: string }
  ) => {
    const offset = (page - 1) * limit;

    let conditions = undefined;
    const filterArray = [];
    if (filters?.status) filterArray.push(eq(ticket.status, filters.status as any));
    if (filters?.priority) filterArray.push(eq(ticket.priority, filters.priority as any));
    if (filters?.userId) filterArray.push(eq(ticket.userId, filters.userId));

    if (filterArray.length > 0) {
      conditions = and(...filterArray);
    }

    const tickets = await db
      .select()
      .from(ticket)
      .where(conditions)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(ticket.createdAt));

    return tickets;
  },

  updateTicket: async (id: string, data: Partial<typeof ticket.$inferInsert>) => {
    const [updatedTicket] = await db
      .update(ticket)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(ticket.id, id))
      .returning();
    return updatedTicket;
  },

  deleteTicket: async (id: string) => {
    await db.delete(ticket).where(eq(ticket.id, id));
    return true;
  },

  changeStatus: async (id: string, status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED") => {
    const [updated] = await db
      .update(ticket)
      .set({ status, updatedAt: new Date() })
      .where(eq(ticket.id, id))
      .returning();
    return updated;
  },

  assignTicket: async (id: string, assignedTo: string) => {
    const [updated] = await db
      .update(ticket)
      .set({ assignedTo, updatedAt: new Date() })
      .where(eq(ticket.id, id))
      .returning();
    return updated;
  },

  // Comments
  addComment: async (ticketId: string, userId: string, content: string) => {
    const [newComment] = await db
      .update(ticket)
      .set({ comment: content, updatedAt: new Date() })
      .where(eq(ticket.id, ticketId))
      .returning();
    return newComment;
  },

  listComments: async (ticketId: string) => {
    return await db.select().from(ticket).where(eq(ticket.id, ticketId)).orderBy(desc(ticket.createdAt));
  },

  getStatsOverview: async () => {
    const byStatus = await db
      .select({
        status: ticket.status,
        count: count(),
      })
      .from(ticket)
      .groupBy(ticket.status);

    const byPriority = await db
      .select({
        priority: ticket.priority,
        count: count(),
      })
      .from(ticket)
      .groupBy(ticket.priority);

    return { byStatus, byPriority };
  },
};
