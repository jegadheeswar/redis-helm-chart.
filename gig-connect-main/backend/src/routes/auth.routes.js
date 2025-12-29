// backend/src/routes/auth.routes.js
import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js'; // Import only register and login

const router = Router();

router.post('/register', register);
router.post('/login', login);
// No OTP routes here anymore

export default router;