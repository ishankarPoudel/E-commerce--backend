import { AppDataSource } from "../../data-source";
import { UserEntity } from "../../entities/user/user.entity";
import { ApiError } from "../../utils/apiError";
import { Tokens } from "../../utils/token.util";
import { RegisterUserDto } from "./../../validators/registerUser.validator";
import bcrypt from "bcrypt";

export class AuthService {
  private userRepo = AppDataSource.getRepository(UserEntity);

  async registerUser(user: RegisterUserDto) {
    const existingUser = await this.userRepo.findOne({
      where: {
        email: user.email,
      },
    });
    if (existingUser)
      throw new ApiError(409, "User with this email already exists");

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = this.userRepo.create({
      fullName: user.fullName,
      email: user.email,
      password: hashedPassword,
    });
    await this.userRepo.save(newUser);
    return this.generateTokens(newUser);
  }

  async loginUser(email: string, password: string) {
    const user = await this.userRepo.findOne({
      where: {
        email,
      },
    });
    if (!user) throw new ApiError(404, "User not found");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

    return this.generateTokens(user);
  }

  async generateTokens(user: UserEntity) {
    const payload = { userId: user.id };
    const accessToken = new Tokens().signAccessToken(payload);
    const refreshToken = new Tokens().signRefreshToken(payload);

    return { accessToken, refreshToken };
  }
}
