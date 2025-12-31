import { drizzle } from "drizzle-orm/node-postgres";
import { Kafka, Producer } from "kafkajs";

interface GlobalObjects {
  kafka: Kafka | null;
  db: ReturnType<typeof drizzle> | null;
  producer: Producer | null;
}

const globalObjects: GlobalObjects = {
  kafka: null,
  db: null,
  producer: null,
};

export default globalObjects;
