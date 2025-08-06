import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { dirname } from 'path';
import { createReadStream, statSync } from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import protectedRouter from './routes/Protectedrouter.js';


const app = express()
app.use(express.json())
dotenv.config();
const allowedOrigins = [
  'http://localhost:5173',
  'https://anime-streaming-website-cyzpqmi9k-vishals-projects-05b27564.vercel.app',
  'https://anime-streaming-website-s6koa4p16-vishals-projects-05b27564.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(cookieParser());
app.use('/', authRoutes);
app.use('/api/protected', protectedRouter);


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get('/api/anime', async (req, res) => {
  const response = await fetch('https://api.jikan.moe/v4/top/anime');
  const data = await response.json();
  res.json(data);
});


app.get('/video', (req, res) => {
  const filepath = `${__dirname}/public/Demon Slayer： Kimetsu no Yaiba Infinity Castle ｜ MAIN TRAILER.mp4`;

  const range = req.headers.range;
  const stat = statSync(filepath);
  const fileSize = stat.size;

  if (!range) {
    return res.status(400).send("Requires Range header");
  }

  const CHUNK_SIZE = 10 ** 6; //1MB chunk
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, fileSize - 1);

  const fileStream = createReadStream(filepath, {
    start,
    end,
  });

  const contentLength = end - start + 1;

  const headers = {
    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  res.writeHead(206, headers);
  fileStream.pipe(res);
});

app.listen(process.env.PORT, () => {
  console.log('Server is running on port', process.env.PORT)
})