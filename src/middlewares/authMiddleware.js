import jwt from "jsonwebtoken"

export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ erro: 'Token não fornecido!' })

    const [, token] = authHeader.split(' ')

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo')
        req.userId = decoded.id
        return next()
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' })
    }
}