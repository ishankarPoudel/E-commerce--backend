import { Column, Entity, OneToOne } from "typeorm";
import { CommonEntity } from "../../common/common.entity";
import { UserEntity } from "../userInfo/user.userInfo.entity";

@Entity()
export class DeviceInfoEntity extends CommonEntity {
  @Column({ nullable: true })
  os: string;

  @Column({ nullable: true })
  browser: string;

  @Column({ nullable: true })
  device: string;

  @Column({ nullable: true })
  location: string;

  @OneToOne(() => UserEntity, (user) => user.deviceInfo)
  user: UserEntity;
}
