import "reflect-metadata";
import AppDataSource from "../config/data-source/data-source";
import { AdminService } from "../services/admin/admin.service";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function createAdmin() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("✅ Database connected");

    // Get admin details
    const email = await question("Enter admin email: ");
    const fullName = await question("Enter admin full name: ");
    const password = await question("Enter admin password: ");
    const confirmPassword = await question("Confirm password: ");

    if (password !== confirmPassword) {
      console.error("❌ Passwords do not match");
      process.exit(1);
    }

    // Create admin
    const adminService = new AdminService();
    const admin = await adminService.createAdminAccount({
      email,
      fullName,
      password,
    });

    console.log("✅ Admin account created successfully:");
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.fullName}`);
    console.log(`   Role: ${admin.role}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();
