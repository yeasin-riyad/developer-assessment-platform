import config from "../config/index.js";

export const getBkashIdToken = async (): Promise<string> => {
  try {
    const response = await fetch(
      `${config.bkash_base_url}/tokenized/checkout/token/grant`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          username: config.bkash_username as string,
          password: config.bkash_password as string,
        },
        body: JSON.stringify({
          app_key: config.bkash_app_key,
          app_secret: config.bkash_app_secret,
        }),
      },
    );
    if (!response.ok) {
      const errorResult = await response.text();
      throw new Error(`bKash Access Token Grant Failed: ${errorResult}`);
    }
    const result = await response.json();
    if (!result?.id_token) {
      throw new Error("bKash ID Token Not Found In Response");
    }
    return result.id_token as string;
  } catch (error: any) {
    throw new Error(error?.message || "Failed To Get bKash ID Token");
  }
};
