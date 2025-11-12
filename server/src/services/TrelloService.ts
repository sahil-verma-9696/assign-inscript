import { OAuth } from "oauth";
import url from "url";
import express from "express";
import { RouteError } from "@src/common/util/route-errors";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";

/******************************************************************************
                                Constants
******************************************************************************/
const requestURL = "https://trello.com/1/OAuthGetRequestToken";
const accessURL = "https://trello.com/1/OAuthGetAccessToken";
const authorizeURL = "https://trello.com/1/OAuthAuthorizeToken";
const appName = "Trello OAuth Example";
const scope = "read";
const expiration = "1hour";

const key = process.env.TRELLO_API_KEY as string;
const secret = process.env.TRELLO_SECRET as string;

const loginCallback = `http://localhost:3000/api/auth/callback`;

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

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Login with OAuth to Trello
 */
const login: express.RequestHandler = (
  request: express.Request,
  response: express.Response
) => {
  oauth.getOAuthRequestToken(function (error, token, tokenSecret, results) {
    if (error) {
      throw new RouteError(
        HttpStatusCodes.NOT_FOUND,
        "OAuth Request Token failed"
      );
    }
    oauthSecrets[token] = tokenSecret;
    response.redirect(
      `${authorizeURL}?oauth_token=${token}&name=${appName}&scope=${scope}&expiration=${expiration}`
    );
  });
};

const callback: express.RequestHandler = (
  req: express.Request,
  res: express.Response
) => {
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
        console.error("Error getting access token:", error);
        return res.status(500).json({ error: "Access token failed" });
      }

      // Optional: Fetch the Trello user to verify success
      oauth.getProtectedResource(
        "https://api.trello.com/1/members/me",
        "GET",
        accessToken,
        accessTokenSecret,
        (error, data) => {
          if (error) {
            console.error("Error fetching user data:", error);
            return res.status(500).json({ error: "User fetch failed" });
          }

          // ✅ Send back the access token and user data
          res.json({
            message: "OAuth Success ✅",
            accessToken,
            accessTokenSecret,
            user: JSON.parse(data as string),
          });
        }
      );
    }
  );
};

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  login,
  callback,
} as const;
