import express from "express";
import cors from "cors";
import { ticketRoutes } from "./lib/routes/ticket.routes";
import { extractUser } from "./lib/middleware/rbac";
import { getProducer } from "./lib/producer/kafka";

const app = express();
app.use(express.json()); // Support JSON bodies
const port = process.env.PORT || 3002;

app.use(cors());

// Middleware
app.use(extractUser);

// Routes
app.use("/tickets", ticketRoutes);

app.use((req, res, next) => {
  console.log(req.ip, req.originalUrl);
  next();
});
// app.use(
//   cors({
//     origin: "http://your-frontend-domain.com",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  await getProducer();
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception thrown:", err);
});
