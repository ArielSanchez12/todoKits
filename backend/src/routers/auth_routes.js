import { Router } from 'express';
import { authenticate } from 'passport';

const router = Router();

router.get('/google',
  authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Autenticación exitosa
    res.send("Inicio de sesión con Google exitoso");
  }
);

export default router;