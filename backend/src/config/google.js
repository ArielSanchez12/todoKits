import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import docente from '../models/docente.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.URL_BACKEND}/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log("Google profile:", profile);
      let user = await docente.findOne({ googleId: profile.id });
      if (!user) {
        user = await docente.create({
          googleId: profile.id,
          nombreDocente: profile.displayName,
          apellidoDocente: profile.name?.familyName || "Google",
          emailDocente: profile.emails[0].value,
          avatarDocente: profile.photos?.[0]?.value || "",
          confirmEmailDocente: true,
          loginGoogle: true
        });
        console.log("Usuario creado:", user);
      } else {
        console.log("Usuario encontrado:", user);
      }
      return done(null, user);
    } catch (err) {
      console.error("Error en estrategia Google:", err);
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await docente.findById(id);
  done(null, user);
});