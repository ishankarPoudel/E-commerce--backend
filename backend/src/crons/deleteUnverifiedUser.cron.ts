import cron from "node-cron";
import { AppDataSource } from "../config/data-source/data-source";
import { UserEntity } from "../entities/user/user.entity";
import { LessThan } from "typeorm";

cron.schedule("*/10 * * * * *", async () => {
  console.log("Cron job triggered!");
  const userRepo = AppDataSource.getRepository(UserEntity);
  const cutOff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const usersToDelete = await userRepo.find({
    where: {
      isEmailVerified: false,
      createdAt: LessThan(cutOff),
    },
  });
  if (usersToDelete.length > 0) {
    await userRepo.remove(usersToDelete);
    console.log(`Deleted ${usersToDelete.length} unverified users.`);
  }
});
