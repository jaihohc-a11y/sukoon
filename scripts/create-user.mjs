import dns from "dns";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Ensure DNS resolution on Windows for Atlas SRV
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // ignore
}

// Load .env or .env.local if present
const envFiles = [".env.local", ".env"];
let mongoUri = process.env.MONGODB_URI;

for (const file of envFiles) {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    const lines = fs.readFileSync(fullPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*MONGODB_URI\s*=\s*(.*)\s*$/);
      if (match && !mongoUri) {
        mongoUri = match[1].trim().replace(/^['"]|['"]$/g, "");
      }
    }
  }
}

const args = process.argv.slice(2);
const email = args[0] || process.env.ADMIN_EMAIL || "admin@sukoon.com.au";
const password = args[1] || process.env.ADMIN_PASSWORD;
const name = args[2] || "Sukoon Administrator";

if (!password) {
  console.error("Usage: node scripts/create-user.mjs <email> <password> [name]");
  console.error("Example: node scripts/create-user.mjs admin@sukoon.com.au mySecurePass123 'Sukoon Admin'");
  process.exit(1);
}

if (!mongoUri || mongoUri.includes("<password>")) {
  console.error("Error: MONGODB_URI is not properly configured in .env or .env.local");
  process.exit(1);
}

async function run() {
  console.log(`Connecting to MongoDB Atlas...`);
  await mongoose.connect(mongoUri, {
    dbName: "sukoon",
    serverSelectionTimeoutMS: 8000,
  });

  const db = mongoose.connection.db;
  const usersCollection = db.collection("users");

  const cleanEmail = email.trim().toLowerCase();
  const hashedPassword = await bcrypt.hash(password.trim(), 10);

  const existing = await usersCollection.findOne({ email: cleanEmail });

  if (existing) {
    await usersCollection.updateOne(
      { email: cleanEmail },
      {
        $set: {
          name: name.trim(),
          password: hashedPassword,
          role: "admin",
          updatedAt: new Date(),
        },
      }
    );
    console.log(`[Success] Updated existing admin user: ${cleanEmail}`);
  } else {
    await usersCollection.insertOne({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: "admin",
      avatar: "/images/people.png",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`[Success] Created new admin user: ${cleanEmail}`);
  }

  await mongoose.disconnect();
  console.log("Database connection closed.");
}

run().catch((err) => {
  console.error("Error creating user:", err.message);
  process.exit(1);
});
