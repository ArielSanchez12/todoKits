import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import passport from 'passport'
import docente from '../models/docente.js'
import { crearTokenJWT } from '../middlewares/jwt.js'

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://kitsbackend.vercel.app/api/auth/google/callback"
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      let user = await docente.findOne({ emailDocente: email });

      if (!user) {
        // Generar contraseña temporal y cifrarla
        const passwordTemp = "KITS" + Math.random().toString(36).slice(-8).toUpperCase();
        const hashedPassword = await docente.prototype.encryptPassword(passwordTemp);

        // Crear nuevo docente
        user = new docente({
          nombreDocente: profile.name.givenName || profile.displayName,
          apellidoDocente: profile.name.familyName || "Google",
          emailDocente: email,
          passwordDocente: hashedPassword,
          avatarDocente: profile.photos?.[0]?.value,
          confirmEmailDocente: true,
          rolDocente: "Docente"
        });

        await user.save();
      }

      return done(null, user);
    } catch (err) {
      console.error("Error en autenticación con Google:", err);
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id); // Solo guardar el ID
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await docente.findById(id).select("-passwordDocente");
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});