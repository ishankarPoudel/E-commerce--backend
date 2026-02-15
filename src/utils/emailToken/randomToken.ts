export class GenerateRandomToken {
  mailToken = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // e.g., 6-digit OTP
  };
}
