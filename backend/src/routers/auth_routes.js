// authRoutes.js
import { Router } from 'express';
import passport from 'passport';
import { crearTokenJWT } from '../middlewares/jwt.js';
import docente from '../models/docente.js';

const router = Router();

// Iniciar la autenticación con Google
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Ruta de callback (¡esta es la que importa!)
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.URL_FRONTEND}/login`, session: false }),
  (req, res) => {
    const user = req.user;
    const tokenJWT = crearTokenJWT(user._id, user.rolDocente);

    res.redirect(`${process.env.URL_FRONTEND}/login-success?token=${tokenJWT}&name=${encodeURIComponent(user.nombreDocente)}&email=${user.emailDocente}`);
  }
);

export default router;