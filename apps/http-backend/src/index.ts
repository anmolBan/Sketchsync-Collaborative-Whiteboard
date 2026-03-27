import express from "express";
import cors from "cors";
import { HTTP_PORT } from "@repo/backend_common";
import userRoutes from "./routes/userRoutes/index.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = HTTP_PORT || 3002;
app.use('/api', userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});