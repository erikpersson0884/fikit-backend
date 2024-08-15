import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import authRouter from './routes/AuthRouter'
import commiteeRouter from './routes/CommiteeRouter';
import peopleRouter from './routes/PeopleRouter';
import postRouter from './routes/PostRouter'

dotenv.config();

const app = express();
app.use(express.static('public'));
const corsOrigins = process.env.CORS_ORIGINS?.split(',') || [];

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,    
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/people/', peopleRouter)
app.use('/api/posts/', postRouter)
app.use('/api/auth/', authRouter)
app.use('/api/commitee/', commiteeRouter)



app.get('/', (req: Request, res: Response) => {
    res.send('Hello, TypeScript with Node.js!');
});

if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

export default app;