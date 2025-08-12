import { Router } from 'express';
import passport from 'passport';
import { crearTokenJWT } from '../middlewares/jwt.js';
import docente from '../models/docente.js';

const router = Router();

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    console.log("Usuario autenticado en callback:", req.user);
    if (!req.user) {
      console.error("No se recibió usuario en el callback");
      return res.redirect(`${process.env.URL_FRONTEND}login?google=fail`);
    }
    const token = crearTokenJWT(req.user._id, req.user.rolDocente);
    res.redirect(`${process.env.URL_FRONTEND}login-success?name=${encodeURIComponent(req.user.nombreDocente)}&email=${encodeURIComponent(req.user.emailDocente)}&token=${token}&id=${req.user._id}&rol=${req.user.rolDocente}`);
  }
);

export default router;