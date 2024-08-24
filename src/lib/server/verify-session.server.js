import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '$env/static/private';

export const verifySession = async (token) => {

    if (!token) return {auth: false}

    try {
        jwt.verify(token, SECRET_KEY);
        return {auth: true}
    } catch (error) {
        return {auth: false}
    }
};