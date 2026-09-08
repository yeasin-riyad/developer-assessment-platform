import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || "15m",

  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  frontend_url: process.env.FRONTEND_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,

  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret:process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUrl:process.env.GOOGLE_REDIRECT_URL, 
  smtp_user: process.env.SMTP_USER,
  smtp_password: process.env.SMTP_PASSWORD,
  email_sender: process.env.EMAIL_SENDER,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  bkash_base_url: process.env.BKASH_BASE_URL,
  bkash_username: process.env.BKASH_USERNAME,
  bkash_password: process.env.BKASH_PASSWORD,
  bkash_app_key: process.env.BKASH_APP_KEY,
  bkash_app_secret: process.env.BKASH_APP_SECRET,
  bkash_callback_url: process.env.BKASH_CALLBACK_URL,
};
