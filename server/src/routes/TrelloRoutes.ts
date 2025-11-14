/* eslint-disable n/no-process-env */
import { OAuth } from "oauth";
import url from "url";
import express from "express";
import { RouteError } from "@src/common/util/route-errors";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import TrelloService from "@src/services/TrelloService";
import { getExpirationMs } from "@src/common/util/utility-fn";

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

// You should have {"token": "tokenSecret"} pairs in a real application
// Storage should be more permanent (redis would be a good choice)
// Temporary in-memory store for token secrets
const oauthSecrets: Record<string, string> = {};

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
const login: express.RequestHandler = (
  request: express.Request,
  response: express.Response
) => {
  oauth.getOAuthRequestToken(function (error, token, tokenSecret) {
    if (error) {
      throw new RouteError(
        HttpStatusCodes.NOT_FOUND,
        "OAuth Request Token failed"
      );
    }
    oauthSecrets[token] = tokenSecret;

    const redirectUrl = new URL(authorizeURL);
    redirectUrl.searchParams.append("oauth_token", token);
    redirectUrl.searchParams.append("name", appName);
    redirectUrl.searchParams.append("scope", scope);
    redirectUrl.searchParams.append("expiration", expiration);

    response.redirect(redirectUrl.toString());
  });
};

/**
 * Get OAuth access token
 */
const callback: express.RequestHandler = (
  req: express.Request,
  res: express.Response
) => {
  // eslint-disable-next-line n/no-deprecated-api
  const query = url.parse(req.url, true).query;
  const token = query.oauth_token as string;
  const verifier = query.oauth_verifier as string;
  const tokenSecret = oauthSecrets[token];

  if (!token || !verifier || !tokenSecret) {
    return res.status(400).json({ error: "Invalid OAuth callback" });
  }

  oauth.getOAuthAccessToken(
    token,
    tokenSecret,
    verifier,
    (error, accessToken, accessTokenSecret) => {
      if (error) {
        return res.status(500).json({ error: "Access token failed" });
      }

      /**
       * Store access token in memory temporarily
       */
      oauthAccessToken = accessToken;

      const expirationInMiliSec = String(getExpirationMs(expiration));

      const redirectUrl = new URL("http://localhost:5173");
      redirectUrl.searchParams.append("accessToken", accessToken);
      redirectUrl.searchParams.append("accessTokenSecret", accessTokenSecret);
      redirectUrl.searchParams.append("expiresIn", expirationInMiliSec);

      res.redirect(redirectUrl.toString());
    }
  );
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
                                Export default
******************************************************************************/

export default {
  login,
  callback,
  boards,
  me,
} as const;
