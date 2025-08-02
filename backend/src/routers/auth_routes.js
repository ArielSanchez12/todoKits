// authRoutes.js
import { Router } from 'express';
import passport from 'passport';

const router = Router();

// Iniciar la autenticación con Google
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Ruta de callback (¡esta es la que importa!)
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  async (req, res) => {
    const user = req.user;
    const tokenJWT = crearTokenJWT(user._id, user.rolDocente);
    
    // Redirige al frontend con el token
    res.redirect(`${process.env.FRONTEND_URL}/login-success?token=${tokenJWT}&name=${encodeURIComponent(user.nombreDocente)}&email=${user.emailDocente}`);
  }
);

export default router;