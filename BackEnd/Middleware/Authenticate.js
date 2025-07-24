import jwt from 'jsonwebtoken';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).send('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Attach user ID to request
    next();
  } catch (error) {
    res.status(401).send('Invalid token');
  }
};
