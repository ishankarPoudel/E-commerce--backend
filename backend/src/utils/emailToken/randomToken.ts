import { randomUUID } from "crypto";

export class GenerateRandomToken {
  mailToken = () => {
    return randomUUID();
  };
}
