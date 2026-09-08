import app from "./app.js";
import config from "./app/config/index.js";
import { transporter } from "./app/lib/nodemailer.js";
import { prisma } from "./app/lib/prisma.js";

const PORT = config.port;

const main = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully.");

    await transporter.verify();
    console.log("✅ SMTP server is ready");

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    server.on("error", (error) => {
      console.error("❌ Server error:", error);
    });

    server.on("close", () => {
      console.log("⚠️ Server closed");
    });
  } catch (error) {
    console.error("❌ Error starting the server:", error);

    await prisma.$disconnect();

    process.exit(1);
  }
};

main();

