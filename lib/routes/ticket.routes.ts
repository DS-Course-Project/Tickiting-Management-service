import { Router } from "express";
import { ticketController } from "../controllers/ticket.controller.js";
import { requireRole } from "../middleware/rbac.js";

const router = Router();

// Public / User Routes
router.post("/", ticketController.createTicket);
router.get("/", ticketController.listTickets);
router.get("/:id", ticketController.getTicket);
router.patch("/:id", ticketController.updateTicket); // Basic update, could be refined
router.patch("/:id/status", ticketController.changeStatus);
router.post("/:id/comments", ticketController.addComment);
router.get("/:id/comments", ticketController.listComments);

// Admin Only Routes
router.delete("/:id", requireRole("ADMIN"), ticketController.deleteTicket);
router.patch("/:id/assign", requireRole("ADMIN"), ticketController.assignTicket);

export const ticketRoutes: Router = router;
