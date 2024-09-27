import { Router } from "express";
import express from "express";
import session from "express-session";
import redis from "redis";
const RedisStore = require("connect-redis")(session);
import { auth } from "express-openid-connect";
import { UserInfo } from "../models/user";
import axios from "axios";

const gammaRouter = Router();

export const authRequest = async (endpoint: string, access_token?: string) => {
    const headers = {
        "Authorization": access_token ? `Bearer ${access_token}` : `pre-shared ${process.env.API_KEY}`
    }
    return (await axios.get(`${process.env.ISSUER_BASE_URL}${endpoint}`, {headers})).data
} 
export const setupRoutes = (app: express.Application, tools: Tools) => {
    setupGraphql(app, tools);
    const frontend_url = process.env.FRONTEND_URL || "http://localhost:3001";
    app.use("/", proxy(frontend_url));
  };


const session_store = new RedisStore({
    client: redis.createClient({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASS,
      db: 1,
    }),
  })
  
  gammaRouter.use(
    session({
      secret: String(process.env.SESSION_SECRET),
      store: session_store,
      resave: false,
      saveUninitialized: false,
    }),
  );
  
  gammaRouter.use(
    auth({
      idpLogout: true,
      authRequired: true,
      authorizationParams: { scope: "openid profile", response_type: "code" },
      clientAuthMethod: "client_secret_basic",
      routes: { callback: "/api/callback" },
      session: {
        store: session_store,
      },
      afterCallback: async (req, res, session, decodedState) => {
        const userInfo: UserInfo = await authRequest("/oauth2/userinfo", session.access_token)
        const authorities: string[] = await authRequest(`/api/client/v1/authorities/for/${userInfo.sub}`)
        const groups: any[] = await authRequest(`/api/client/v1/groups/for/${userInfo.sub}`)
        return {
          ...session,
          is_admin: authorities.includes("admin"),
          groups: groups
            .map((group) => group?.superGroup)
            .filter(group => group?.type !== "alumni")
            .map(group => group?.name)
        };
      }
    }),
  );