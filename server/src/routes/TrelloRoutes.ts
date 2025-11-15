/* eslint-disable n/no-process-env */
import { OAuth } from "oauth";
import url from "url";
import express from "express";
import { RouteError } from "@src/common/util/route-errors";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import TrelloService from "@src/services/TrelloService";
import { getExpirationMs } from "@src/common/util/utility-fn";
import redisClient from "@src/redis";

/******************************************************************************
                                Constants
******************************************************************************/
const requestURL = "https://trello.com/1/OAuthGetRequestToken";
const accessURL = "https://trello.com/1/OAuthGetAccessToken";
const authorizeURL = "https://trello.com/1/OAuthAuthorizeToken";
const appName = "Trello OAuth Example";
const scope = "read";
const expiration = "1hour";

const key = process.env.TRELLO_API_KEY!;
const secret = process.env.TRELLO_SECRET!;

const loginCallback = "http://localhost:3000/api/auth/callback";

const oauth = new OAuth(
  requestURL,
  accessURL,
  key,
  secret,
  "1.0A",
  loginCallback,
  "HMAC-SHA1"
);

export let oauthAccessToken: null | string = null;

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Get OAuth token
 */
const login: express.RequestHandler = async (request, response, next) => {
  try {
    // Promise wrapper around OAuth request token
    const getOAuthRequestToken = () =>
      new Promise<{ token: string; tokenSecret: string }>((resolve, reject) => {
        oauth.getOAuthRequestToken((error, token, tokenSecret) => {
          if (error) return reject(error);
          resolve({ token, tokenSecret });
        });
      });

    const { token, tokenSecret } = await getOAuthRequestToken();

    /****************************************
     * Store token & secret in Redis
     * - Use SETNX (set if not exists) pattern
     ****************************************/
    const redisKey = `trello:oauth:${token}`;

    const existing = await redisClient.get(redisKey);

    if (!existing) {
      // Store secret with expiration (optional)
      await redisClient.set(redisKey, tokenSecret, {
        EX: 60 * 10, // 10 minutes (Trello request token short-lived)
      });
    }

    // Build Trello authorize redirect
    const redirectUrl = new URL(authorizeURL);
    redirectUrl.searchParams.append("oauth_token", token);
    redirectUrl.searchParams.append("name", appName);
    redirectUrl.searchParams.append("scope", scope);
    redirectUrl.searchParams.append("expiration", expiration);

    return response.redirect(redirectUrl.toString());
  } catch (error: any) {
    return next(
      new RouteError(
        HttpStatusCodes.NOT_FOUND,
        error?.message || "OAuth Request Token failed"
      )
    );
  }
};


/**
 * Get OAuth access token
 */
const callback: express.RequestHandler = async (req, res, next) => {
  try {
    // Parse OAuth callback query
    const query = url.parse(req.url, true).query;
    const token = query.oauth_token as string;
    const verifier = query.oauth_verifier as string;

    if (!token || !verifier) {
      return res.status(400).json({ error: "Invalid OAuth callback" });
    }

    // Retrieve token secret from Redis
    const redisKey = `trello:oauth:${token}`;
    const tokenSecret = await redisClient.get(redisKey);

    if (!tokenSecret) {
      return res.status(400).json({ error: "OAuth token secret not found or expired" });
    }

    // Wrap OAuth getAccessToken in a promise
    const getOAuthAccessToken = () =>
      new Promise<{
        accessToken: string;
        accessTokenSecret: string;
      }>((resolve, reject) => {
        oauth.getOAuthAccessToken(
          token,
          tokenSecret,
          verifier,
          (error, accessToken, accessTokenSecret) => {
            if (error) return reject(error);
            resolve({ accessToken, accessTokenSecret });
          }
        );
      });

    // Exchange request token → access token
    const { accessToken, accessTokenSecret } = await getOAuthAccessToken();

    // (Optional) Store access token securely in Redis instead of memory
    // expires in 1 hour or whatever Trello allows
    const accessKey = `trello:access:${accessToken}`;
    await redisClient.set(accessKey, accessTokenSecret, {
      EX: getExpirationMs(expiration) / 1000, // convert milliseconds → seconds
    });

    // Also store globally (if you need it across service)
    oauthAccessToken = accessToken;

    // Build client redirect URL
    const expirationInMiliSec = String(getExpirationMs(expiration));

    const redirectUrl = new URL(process.env.CLIENT_BASE_URL!);
    redirectUrl.searchParams.append("accessToken", accessToken);
    redirectUrl.searchParams.append("accessTokenSecret", accessTokenSecret);
    redirectUrl.searchParams.append("expiresIn", expirationInMiliSec);

    return res.redirect(redirectUrl.toString());
  } catch (error: any) {
    return next(
      new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        error?.message || "OAuth Access Token failed"
      )
    );
  }
};


/**
 * Get all boards
 */
const boards: express.RequestHandler = async (
  req: express.Request,
  res: express.Response
) => {
  if (!oauthAccessToken) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, "Not logged in");
  }
  const boards = await TrelloService.getAllBoards({ token: oauthAccessToken });
  res.status(HttpStatusCodes.OK).json({ boards });
};

/**
 * Get User
 */

const me: express.RequestHandler = async (
  req: express.Request,
  res: express.Response
) => {
  // extract header
  const auth = req?.headers?.authorization;

  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const accessToken = auth.split(" ")[1]; // token from frontend
  const apiKey = process.env.TRELLO_API_KEY!; // stored safely in backend

  const trelloUrl = new URL(
    `https://api.trello.com/1/tokens/${accessToken}/member`
  );
  trelloUrl.searchParams.append("key", apiKey);
  trelloUrl.searchParams.append("token", accessToken);

  try {
    // eslint-disable-next-line n/no-unsupported-features/node-builtins
    const response = await fetch(trelloUrl);
    if (!response.ok) {
      const err = await response.text();
      return res
        .status(response.status)
        .json({ error: "Failed to fetch Trello user", detail: err });
    }

    const user = await response.json();
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching trello user info:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
/******************************************************************************
                                Webhook
******************************************************************************/



/******************************************************************************
                                Export default
******************************************************************************/

export default {
  login,
  callback,
  boards,
  me,
} as const;
