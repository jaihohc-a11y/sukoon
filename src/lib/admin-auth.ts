import { cookies } from "next/headers";
import { connectToDatabase } from "./mongodb";
import { UserModel, hashPassword } from "@/models/User";

export const ADMIN_COOKIE_NAME = "sukoon_admin_session";

const SECRET_SALT = process.env.ADMIN_SECRET || "sukoon-culinary-secret-key-2026";

export function generateSessionToken(email: string): string {
  const timestamp = Date.now();
  const payload = `${email}:${timestamp}:${SECRET_SALT}`;
  return Buffer.from(payload).toString("base64");
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length < 3) return false;
    const [email, , salt] = parts;
    return salt === SECRET_SALT && email.length > 0;
  } catch {
    return false;
  }
}

/**
 * Checks how many admin users currently exist in MongoDB.
 */
export async function getAdminUserCount(): Promise<number> {
  const conn = await connectToDatabase();
  if (!conn) return 0;
  try {
    return await UserModel.countDocuments();
  } catch (err) {
    console.warn("Failed checking admin user count:", err);
    return 0;
  }
}

/**
 * Creates an admin user in MongoDB with bcrypt hashed password.
 */
export async function createAdminUser(params: {
  email: string;
  password: string;
  name?: string;
  role?: "admin" | "editor";
}): Promise<{ success: boolean; user?: { email: string; name: string; role: string }; error?: string }> {
  const conn = await connectToDatabase();
  if (!conn) {
    return { success: false, error: "Database connection could not be established." };
  }

  const cleanEmail = params.email.trim().toLowerCase();
  const cleanPass = params.password.trim();

  if (!cleanEmail || !cleanPass) {
    return { success: false, error: "Email and password are required." };
  }

  if (cleanPass.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  try {
    const existing = await UserModel.findOne({ email: cleanEmail });
    if (existing) {
      return { success: false, error: "A user with this email already exists." };
    }

    const hashedPassword = await hashPassword(cleanPass);
    const user = await UserModel.create({
      name: params.name?.trim() || "Administrator",
      email: cleanEmail,
      password: hashedPassword,
      role: params.role || "admin",
      avatar: "/images/people.png",
    });

    return {
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  } catch (err) {
    console.error("Failed creating admin user:", err);
    return { success: false, error: "Failed to create user in database." };
  }
}

/**
 * Authenticates user credentials STRICTLY against MongoDB UserModel.
 * No dummy or static passwords.
 */
export async function authenticateAdmin(
  email?: string,
  password?: string
): Promise<{ success: boolean; user?: { email: string; name: string; role: string }; error?: string }> {
  if (!email || !password) {
    return { success: false, error: "Please enter both email and password." };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  const conn = await connectToDatabase();
  if (!conn) {
    return {
      success: false,
      error: "Database not connected. Please verify MongoDB connection in .env.",
    };
  }

  try {
    const user = await UserModel.findOne({ email: cleanEmail });
    if (!user) {
      return { success: false, error: "No account found with this email." };
    }

    const isMatch = await user.comparePassword(cleanPass);
    if (!isMatch) {
      return { success: false, error: "Incorrect password." };
    }

    return {
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  } catch (err) {
    console.error("Authentication query error:", err);
    return { success: false, error: "Database query error during authentication." };
  }
}

export async function checkIsAdminServer(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    return verifySessionToken(token);
  } catch {
    return false;
  }
}
