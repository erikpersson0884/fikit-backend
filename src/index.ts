import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { initiateDataFiles } from './util';
initiateDataFiles();

import authRouter from './routes/AuthRouter'
import commiteeRouter from './routes/CommiteeRouter';
import peopleRouter from './routes/PeopleRouter';
import postRouter from './routes/PostRouter'
import RecipeRouter from './routes/RecipeRouter';

dotenv.config();

const app = express();


// app.use(auth({
//     idpLogout: true,
//     authRequired: false,
//     authorizationParams: { scope: "openid profile", response_type: "code" },
//     clientAuthMethod: "client_secret_basic",
//     routes: { callback: "/api/callback" },

//     afterCallback: async (req, res, session, decodedState) => {
//         export const authRequest = async (endpoint: string, access_token?: string) => {
//             const headers = {
//               "Authorization": access_token ? `Bearer ${access_token}` : `pre-shared ${process.env.API_KEY}`
//             }
//             return (await axios.get(`${process.env.ISSUER_BASE_URL}${endpoint}`, {headers})).data
//           } 
//       return {
//         ...session,
//       };
//     }
// }));


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
app.use('/api/recipes/', RecipeRouter)



app.get('/', (req: Request, res: Response) => {
    res.send('Hello from Göken');
});

if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

export default app;