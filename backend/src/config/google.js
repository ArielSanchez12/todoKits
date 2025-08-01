import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://kitsbackend.vercel.app/auth/google/callback"
},
(accessToken, refreshToken, profile, done) => {
  console.log("Perfil de Google:", profile);
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});