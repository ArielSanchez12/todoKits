import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { use, serializeUser, deserializeUser } from 'passport';

// Aquí puedes usar tu modelo de usuario si deseas guardar los datos en la BDD
// const Admin = require('../models/admin'); // Ejemplo

use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},
(accessToken, refreshToken, profile, done) => {
  // Aquí puedes guardar el perfil en la base de datos si deseas
  console.log("Perfil de Google:", profile);
  return done(null, profile);
}));

serializeUser((user, done) => {
  done(null, user);
});

deserializeUser((user, done) => {
  done(null, user);
});