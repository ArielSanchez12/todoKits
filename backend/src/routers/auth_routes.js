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
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Redirige al frontend con el token
    const token = req.user.token;
    res.redirect(`https://kitsfrontend.vercel.app/dashboard?token=${token}`);
  }
);

export default router;