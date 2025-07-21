import { Column, Entity } from "typeorm";
import { CommonEntity } from "../../common/common.entity";

@Entity()
export class DeviceInfoEntity extends CommonEntity {
  @Column({ nullable: true })
  os: string;

  @Column({ nullable: true })
  browser: string;

  @Column({ nullable: true })
  device: string;
}
