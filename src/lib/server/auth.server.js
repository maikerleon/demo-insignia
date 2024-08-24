import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '$env/static/private';

export const verifyToken = (token) => {
    const secretKey = SECRET_KEY;
    if (!token) {
      return {
        auth: false,
        data: {}
      };
    }
  
    try {
      const decodedToken = jwt.verify(token, secretKey);
  
      return {
        auth: true,
        data: decodedToken
      };
    } catch (error) {
      return {
        auth: false,
        data: {}
      };
    }
};