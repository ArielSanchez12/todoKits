import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import docente from '../models/docente.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.URL_BACKEND}/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    // Busca o crea el usuario en tu base de datos
    let user = await docente.findOne({ googleId: profile.id });
    if (!user) {
      user = await docente.create({
        googleId: profile.id,
        nombreDocente: profile.displayName,
        apellidoDocente: profile.name.familyName || "Google", // <-- Si no tiene apellido en su cuenta de google, se le asigna "Google User" 
        emailDocente: profile.emails[0].value,
        avatarDocente: profile.photos?.[0]?.value || "", // <-- FOTO DE GOOGLE
        confirmEmailDocente: true,
        loginGoogle: true
      });
    }
    return done(null, user);
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await docente.findById(id);
  done(null, user);
});