import { db } from "./db/index.js";
import { ticket, comment, ticketStatusEnum, ticketPriorityEnum } from "./db/schema.js";
import { eq, desc, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export const ticketService = {
    createTicket: async (data: { title: string; description: string; userId: string; priority?: "LOW" | "MEDIUM" | "HIGH" }) => {
        const [newTicket] = await db.insert(ticket).values({
            id: nanoid(),
            title: data.title,
            description: data.description,
            userId: data.userId,
            priority: data.priority || "MEDIUM",
        }).returning();
        return newTicket;
    },

    getTicket: async (id: string) => {
        const result = await db.select().from(ticket).where(eq(ticket.id, id));
        return result[0] || null;
    },

    listTickets: async (page: number = 1, limit: number = 10, filters?: { status?: string; priority?: string; userId?: string }) => {
        const offset = (page - 1) * limit;

        let conditions = undefined;
        const filterArray = [];
        if (filters?.status) filterArray.push(eq(ticket.status, filters.status as any));
        if (filters?.priority) filterArray.push(eq(ticket.priority, filters.priority as any));
        if (filters?.userId) filterArray.push(eq(ticket.userId, filters.userId));

        if (filterArray.length > 0) {
            conditions = and(...filterArray);
        }

        const tickets = await db.select().from(ticket)
            .where(conditions)
            .limit(limit)
            .offset(offset)
            .orderBy(desc(ticket.createdAt));

        return tickets;
    },

    updateTicket: async (id: string, data: Partial<typeof ticket.$inferInsert>) => {
        const [updatedTicket] = await db.update(ticket)
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
        const [updated] = await db.update(ticket)
            .set({ status, updatedAt: new Date() })
            .where(eq(ticket.id, id))
            .returning();
        return updated;
    },

    assignTicket: async (id: string, assignedTo: string) => {
        const [updated] = await db.update(ticket)
            .set({ assignedTo, updatedAt: new Date() })
            .where(eq(ticket.id, id))
            .returning();
        return updated;
    },

    // Comments
    addComment: async (ticketId: string, userId: string, content: string) => {
        const [newComment] = await db.insert(comment).values({
            id: nanoid(),
            ticketId,
            userId,
            content,
        }).returning();
        return newComment;
    },

    listComments: async (ticketId: string) => {
        return await db.select().from(comment)
            .where(eq(comment.ticketId, ticketId))
            .orderBy(desc(comment.createdAt));
    }
};
