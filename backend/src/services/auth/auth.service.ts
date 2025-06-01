import { AppDataSource } from "../../data-source";
import { UserEntity } from "../../entities/user/user.entity";

export class AuthService {
  private userRepo = AppDataSource.getRepository(UserEntity);

  //  need dto first for registering the user
}
