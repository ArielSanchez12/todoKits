import { Router } from 'express';
import passport from 'passport';
import { crearTokenJWT } from '../middlewares/jwt.js';
import docente from '../models/docente.js';

const router = Router();

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Genera el token
    const token = crearTokenJWT(req.user._id, req.user.rolDocente);
    // Redirige al frontend con los datos necesarios
    res.redirect(`${process.env.URL_FRONTEND}login-success?name=${encodeURIComponent(req.user.nombreDocente)}&email=${encodeURIComponent(req.user.emailDocente)}&token=${token}`);
  }
);

export default router;