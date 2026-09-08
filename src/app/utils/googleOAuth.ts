import { OAuth2Client } from "google-auth-library";
import config from "../config/index.js";
import { AppError } from "./AppError.js";


export type GoogleUserProfile = {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
};

const googleOauthClient = new OAuth2Client(
  config.googleClientId,
  config.googleClientSecret,
  config.googleRedirectUrl,
);

export function getGoogleAuthUrl(): string {
  return googleOauthClient.generateAuthUrl({
    access_type: "online",
    scope: [
      "openid",
      "email",
      "profile",
    ],
    prompt: "select_account",
  });
}

export async function getGoogleUserFromAuthCode(
  code: string,
): Promise<GoogleUserProfile> {
  if (!code) {
    throw new AppError(
      400,
      "Google authorization code is required",
    );
  }

  const { tokens } =
    await googleOauthClient.getToken(code);

  if (!tokens.id_token) {
    throw new AppError(
      401,
      "Google login failed: ID token missing",
    );
  }

  const ticket =
    await googleOauthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: config.googleClientId,
    });

  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email) {
    throw new AppError(
      401,
      "Google login failed: invalid profile",
    );
  }

  return {
    googleId: payload.sub,
    email: payload.email
      .toLowerCase()
      .trim(),

    name:
      payload.name ??
      payload.email.split("@")[0],

    picture: payload.picture,
  };
}