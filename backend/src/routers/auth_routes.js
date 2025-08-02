// authRoutes.js
import { Router } from 'express';
import passport from 'passport';

const router = Router();

// Iniciar la autenticación con Google
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Ruta de callback (¡esta es la que importa!)
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Autenticación exitosa
    // Aquí puedes redirigir a tu frontend, por ejemplo:
    const { displayName, emails } = req.user;
    const email = emails?.[0]?.value ?? '';
    const name = displayName ?? '';

    // Redirige con los datos al frontend (URL de tu frontend real)
    res.redirect(`https://kitsfrontend.vercel.app/login-success?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`);
  }
);

export default router;