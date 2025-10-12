import cron from "node-cron";

import { UserEntity } from "../entities/user/userInfo/user.userInfo.entity";
import { LessThan } from "typeorm";
import AppDataSource from "../config/data-source/data-source";

cron.schedule("*/10 * * * * *", async () => {
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
