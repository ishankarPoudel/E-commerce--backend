import bcrypt from "bcrypt";
import AppDataSource from "../config/data-source/data-source";
import {
  UserEntity,
  UserRole,
} from "../entities/user/userInfo/user.userInfo.entity";

export async function seedInitialAdmin() {
  const userRepo = AppDataSource.getRepository(UserEntity);

  const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
  const adminName = process.env.INITIAL_ADMIN_NAME || "Super Admin";

  if (!adminEmail || !adminPassword) {
    console.log("⚠️  No initial admin credentials in environment variables");
    return;
  }

  // Check if admin already exists
  const existingAdmin = await userRepo.findOne({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("✅ Initial admin already exists");
    return;
  }

  // Create initial admin
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = userRepo.create({
    email: adminEmail,
    fullName: adminName,
    password: hashedPassword,
    role: UserRole.ADMIN,
    isEmailVerified: true,
    isOauth: false,
    provider: "local",
  });

  await userRepo.save(admin);
  console.log("✅ Initial admin account created successfully");
}
