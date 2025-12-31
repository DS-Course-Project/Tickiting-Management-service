import { Request, Response } from "express";
import { ticketService } from "../tickets";
import { ticketEventProducers } from "../producer/ticket-events-producers";
import { Ticket } from "../db/schema";

export const ticketController = {
  createTicket: async (req: Request, res: Response) => {
    try {
      const { title, description, priority } = req.body;
      const userId = req.user?.id; // Get from RBAC middleware

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (!title || !description) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const ticket = await ticketService.createTicket({ title, description, userId, priority });

      if (ticket) {
        await ticketEventProducers.createTicketAddedEvent(ticket);
      }

      res.status(201).json(ticket);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create ticket" });
    }
  },

  listTickets: async (req: Request, res: Response) => {
    try {
      const userRole = req.user?.role;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const priority = req.query.priority as string;
      const userId = req.query.userId as string;

      let tickets: Ticket[] = [];
      if (userRole?.toLowerCase() === "admin") {
        tickets = await ticketService.listTickets(page, limit, { status, priority, userId });
      } else {
        tickets = await ticketService.listTickets(page, limit, { status, priority, userId: req.user?.id ?? "" });
      }
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: "Failed to list tickets" });
    }
  },

  getTicket: async (req: Request, res: Response) => {
    try {
      const ticket = await ticketService.getTicket(req.params.id ?? "");
      if (!ticket) {
        res.status(404).json({ error: "Ticket not found" });
        return;
      }
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to get ticket" });
    }
  },

  updateTicket: async (req: Request, res: Response) => {
    try {
      const oldTicket = await ticketService.getTicket(req.params.id ?? "");
      if (!oldTicket) {
        res.status(404).json({ error: "Ticket not found" });
        return;
      }
      const updated = await ticketService.updateTicket(oldTicket.id, req.body);
      if (!updated) {
        res.status(404).json({ error: "Ticket not found" });
        return;
      }

      if (oldTicket.status !== updated.status) {
        await ticketEventProducers.createTicketStatusChangedEvent(updated);
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update ticket" });
    }
  },

  deleteTicket: async (req: Request, res: Response) => {
    try {
      await ticketService.deleteTicket(req.params.id ?? "");
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete ticket" });
    }
  },

  assignTicket: async (req: Request, res: Response) => {
    try {
      const { assignedTo } = req.body;
      if (!assignedTo) {
        res.status(400).json({ error: "Missing assignedTo field" });
        return;
      }
      const updated = await ticketService.assignTicket(req.params.id ?? "", assignedTo);
      if (!updated) {
        res.status(404).json({ error: "Ticket not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to assign ticket" });
    }
  },

  changeStatus: async (req: Request, res: Response) => {
    try {
      console.log(req.body);
      const { status } = req.body;
      if (!status) {
        res.status(400).json({ error: "Missing status field" });
        return;
      }
      const oldTicket = await ticketService.getTicket(req.params.id ?? "");
      if (!oldTicket) {
        res.status(404).json({ error: "Ticket not found" });
        return;
      }

      const updated = await ticketService.changeStatus(req.params.id ?? "", status);
      if (!updated) {
        res.status(404).json({ error: "Ticket not found" });
        return;
      }

      if (updated.status !== oldTicket.status) {
        await ticketEventProducers.createTicketStatusChangedEvent(updated);
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to change status" });
    }
  },

  addComment: async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      if (!content) {
        res.status(400).json({ error: "Missing content" });
        return;
      }
      const comment = await ticketService.addComment(req.params.id ?? "", userId, content);

      if (comment) {
        await ticketEventProducers.createTicketCommentAddedEvent(comment);
      }

      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to add comment" });
    }
  },

  listComments: async (req: Request, res: Response) => {
    try {
      const comments = await ticketService.listComments(req.params.id ?? "");
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to list comments" });
    }
  },
};
