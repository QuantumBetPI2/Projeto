import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const isModerator = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { isModerator: boolean };

        if (!decoded.isModerator) {
            return res.status(403).json({ message: 'Acesso restrito a moderadores.' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
};
