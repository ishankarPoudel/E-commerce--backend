import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { UserEntity } from "../../entities/user/userInfo/user.userInfo.entity";
import AppDataSource from "../data-source/data-source";

const userRepo = AppDataSource.getRepository(UserEntity);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user in the database
        console.log("Google profile:", profile);
        let user = await userRepo.findOne({ where: { googleId: profile.id } });

        if (!user) {
          user = userRepo.create({
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            fullName: profile.displayName,
            isOauth: true,
            provider: "google",
            isEmailVerified: true, // Google OAuth users are considered verified
          });
          await userRepo.save(user);
        }

        return done(null, user);
      } catch (error) {
        console.error("Error in Google strategy:", error);
        return done(error, false);
      }
    }
  )
);
export default passport;
