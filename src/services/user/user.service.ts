import { Brackets } from "typeorm";
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

  // admin fn to get all users
  async getAllUsers(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    sortBy: "name" | "joinedAt" = "name",
    order: "asc" | "desc" = "asc"
  ) {
    const qb = this.userRepo
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.deviceInfo", "deviceInfo")
      .select([
        "user.id",
        "user.email",
        "user.fullName",
        "user.isEmailVerified",
        "user.isOauth",
        "user.provider",
        "user.isBanned",
        "user.createdAt",
        "user.updatedAt",
        "deviceInfo.os",
        "deviceInfo.browser",
        "deviceInfo.device",
        "deviceInfo.location",
        "deviceInfo.createdAt",
        "deviceInfo.updatedAt",
      ]);

    // Search
    if (search) {
      qb.andWhere(
        new Brackets((qb2) => {
          qb2
            .where("user.email ILIKE :search", { search: `%${search}%` })
            .orWhere("user.fullName ILIKE :search", { search: `%${search}%` });
        })
      );
    }

    // Sorting logic
    const sortMap: Record<string, string> = {
      name: "user.fullName",
      joinedAt: "user.createdAt",
    };

    qb.orderBy(sortMap[sortBy], order.toUpperCase() as "ASC" | "DESC");

    // Pagination
    if (page) {
      qb.skip((page - 1) * pageSize).take(pageSize);
    }

    const [users, total] = await qb.getManyAndCount();

    return {
      data: users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
