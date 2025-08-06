import express from 'express';
import authenticateToken from './authmiddleware.js'

const protectedRouter = express.Router();


protectedRouter.get('/anime-list', authenticateToken, (req, res) => {
  res.json({ message: 'Welcome to the protected anime list!', user: req.user });
});

export default protectedRouter;
