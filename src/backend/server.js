import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_, res) => res.json({ ok: true, payment: 'disabled' }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
