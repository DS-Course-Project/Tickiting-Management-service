import { Ticket } from "../db/schema";
import { ticketTopics } from "./constants";
import { TicketCommentAddedEvent, TicketCreatedEvent, TicketStatusChangedEvent } from "./events";
import { getProducer } from "./kafka";

const createTicketAddedEvent = async (ticket: Ticket) => {
  console.log("Trying to create ticket added event");
  const event: TicketCreatedEvent = {
    createdAt: ticket.createdAt,
    ticketId: ticket.id,
    title: ticket.title,
    description: ticket.description,
    priority: ticket.priority,
    status: ticket.status,
  };

  const producer = await getProducer();

  await producer.send({
    topic: ticketTopics.CREATED,
    messages: [{ value: JSON.stringify(event), key: ticket.id }],
  });

  console.log("Ticket added event created");

  return event;
};

const createTicketCommentAddedEvent = async (ticket: Ticket) => {
  console.log("Trying to create ticket comment added event");
  if (!ticket.comment) return;
  const event: TicketCommentAddedEvent = {
    createdAt: ticket.createdAt,
    ticketId: ticket.id,
    comment: ticket.comment || "",
    userId: ticket.userId,
  };

  const producer = await getProducer();

  await producer.send({
    topic: ticketTopics.COMMENT_ADDED,
    messages: [{ value: JSON.stringify(event), key: ticket.id }],
  });

  console.log("Ticket comment added event created");

  return event;
};

const createTicketStatusChangedEvent = async (ticket: Ticket) => {
  console.log("Trying to create ticket status changed event");
  const event: TicketStatusChangedEvent = {
    createdAt: ticket.createdAt,
    ticketId: ticket.id,
    status: ticket.status,
    userId: ticket.userId,
  };

  const producer = await getProducer();

  await producer.send({
    topic: ticketTopics.STATUS_CHANGED,
    messages: [{ value: JSON.stringify(event), key: ticket.id }],
  });

  console.log("Ticket status changed event created");

  return event;
};

export const ticketEventProducers = {
  createTicketAddedEvent,
  createTicketCommentAddedEvent,
  createTicketStatusChangedEvent,
};
