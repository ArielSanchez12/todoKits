import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Autenticación exitosa
    res.send("Inicio de sesión con Google exitoso");
  }
);

export default router;