import { Router } from "express";
import { ticketController } from "../controllers/ticket.controller";
import { requireRole } from "../middleware/rbac";

const router = Router();

// Public / User Routes
router.post("/", ticketController.createTicket);
router.get("/", ticketController.listTickets);
router.put("/:id/status", ticketController.changeStatus);
router.post("/:id/comments", ticketController.addComment);
router.get("/:id/comments", ticketController.listComments);
router.put("/:id", ticketController.updateTicket); // Basic update, could be refined
router.get("/:id", ticketController.getTicket);

// Admin Only Routes
router.delete("/:id", requireRole("ADMIN"), ticketController.deleteTicket);
router.put("/:id/assign", requireRole("ADMIN"), ticketController.assignTicket);

export const ticketRoutes: Router = router;
