import { ITopicConfig, Kafka, Partitioners } from "kafkajs";
import globalObjects from "../global-objects";
import { ticketTopics } from "./constants";

export function getKafka() {
  if (!globalObjects.kafka) {
    globalObjects.kafka = new Kafka({
      clientId: "notification-service",
      brokers: ["localhost:9092"],
    });
  }
  return globalObjects.kafka;
}

async function createTopics(topics: string[]) {
  const kafka = getKafka();
  const admin = kafka.admin();
  await admin.connect();

  const topicsList = await admin.listTopics();
  topics.forEach((topic) => {
    if (topicsList.includes(topic)) return;
    admin.createTopics({
      topics: [{ topic, numPartitions: 1 }],
    });
  });
}

export async function getProducer() {
  if (!globalObjects.producer) {
    await createTopics([ticketTopics.CREATED, ticketTopics.COMMENT_ADDED, ticketTopics.STATUS_CHANGED]);
    const kafka = getKafka();
    const producer = kafka.producer({
      createPartitioner: Partitioners.DefaultPartitioner,
    });
    await producer.connect();
    globalObjects.producer = producer;
  }

  return globalObjects.producer;
}

export async function stopKafka() {
  const kafka = getKafka();
  const producer = kafka.producer();
  await producer.disconnect();
}
