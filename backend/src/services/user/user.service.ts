import AppDataSource from "../../config/data-source/data-source";
import { UserEntity } from "../../entities/user/userInfo/user.userInfo.entity";
import { ApiError } from "../../utils/apiError";
import { UpdateUserDto } from "../../validators/user/updateUserValidator";

export class UserService {
  private userRepo = AppDataSource.getRepository(UserEntity);

  async getUserById(userId: string) {
    const user = await this.userRepo.findOneBy({
      id: userId,
    });
    if (!user) throw new ApiError(404, "User not found");
    const userInfo = {
      email: user.email,
      fullName: user.fullName,
      isEmailVerified: user.isEmailVerified,
      isOauth: user.isOauth,
      provider: user.provider,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return userInfo;
  }

  async updateUserById(userId: string, user: UpdateUserDto) {
    const userExists = await this.userRepo.findOneBy({ id: userId });
    if (!userExists) throw new ApiError(404, "User not found");
    const updatedUser = await this.userRepo.create({
      ...userExists,
      ...user,
    });
    await this.userRepo.save(updatedUser);
    return {
      fullName: updatedUser.fullName,
    };
  }
}
