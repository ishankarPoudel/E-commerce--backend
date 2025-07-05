import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { AppDataSource } from "../data-source/data-source";
import { UserEntity } from "../../entities/user/user.entity";

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
        let user = await userRepo.findOne({ where: { id: profile.id } });

        if (!user) {
          user = userRepo.create({
            id: profile.id,
            email: profile.emails?.[0]?.value,
            fullName: profile.displayName,
            isOauth: true,
            provider: "google",
          });
          await userRepo.save(user);
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);
export default passport;
