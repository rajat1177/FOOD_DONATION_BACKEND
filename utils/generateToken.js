import jwt from 'jsonwebtoken'
import { SECRET_KEY } from '../config/config.js'
export const generateToken = (userId) => {
    const token = jwt.sign(  
        {userId},
        SECRET_KEY,
        {expiresIn: "12h"}
    )
    return token;
}