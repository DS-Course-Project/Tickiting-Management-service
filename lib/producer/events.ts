export class TicketCommentAddedEvent {
  constructor(public ticketId: string, public comment: string, public userId: string, public createdAt: Date) {}
}

export class TicketCreatedEvent {
  constructor(
    public ticketId: string,
    public title: string,
    public description: string,
    public priority: string,
    public status: string,
    public createdAt: Date
  ) {}
}

export class TicketStatusChangedEvent {
  constructor(public ticketId: string, public status: string, public userId: string, public createdAt: Date) {}
}
