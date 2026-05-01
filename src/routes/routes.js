import { Router } from 'express';
import { ProdutosController } from '../controllers/produtosController.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/connection.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const routes = Router();
const produtosController = new ProdutosController();

// Rotas públicas
routes.post('/register', async (req, res) => {
  const { email, nome, senha } = req.body;

  if (!email || !nome || !senha) {
    return res.status(400).json({ error: 'Email, nome e senha obrigatórios' });
  }

  try {
    const hash = await bcrypt.hash(senha, 8);

    const newUsers = await db('users')
      .insert({ nome, email, senha: hash })
      .returning(['id', 'email', 'nome']);

    const user = newUsers[0]; // pega o primeiro objeto retornado

    console.log('Usuário criado:', user);

    return res.status(201).json(user);
  } catch (err) {
    console.error('Erro ao registrar:', err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    return res.status(500).json({ error: 'Erro no cadastro', detalhe: err.message });
  }
});

routes.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  const user = await db('users').where({ email }).first();
  if (!user) return res.status(400).json({ error: 'Usuário não encontrado.' });

  const senhaValida = await bcrypt.compare(senha, user.senha);
  if (!senhaValida) return res.status(400).json({ error: 'Senha inválida.' });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'segredo', {
    expiresIn: '1d',
  });

  return res.json({ token });
});

// Middleware para verificar token
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // formato: "Bearer token"

  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, process.env.JWT_SECRET || 'segredo', (err, usuario) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.usuario = usuario; // payload do token (id)
    next();
  });
}

// Rota /me
routes.get('/me', autenticarToken, async (req, res) => {
  try {
    // Buscar usuário pelo id do token
    const usuario = await db('users').where({ id: req.usuario.id }).first();

    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

    // Buscar vinis do usuário
    const vinis = await db('produtos').where({ user_id: usuario.id });

    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      vinis: vinis || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar perfil' });
  }
});

// Rota /share
routes.post('/share', autenticarToken, async (req, res) => {
  const usuarioId = req.usuario.id;
  const urlPublica = `${process.env.FRONTEND_URL || 'https://frontend-puce-ten-47.vercel.app'}/public/${usuarioId}`;
  res.json({ url: urlPublica });
});


// Rota /public/:id
routes.get('/public/:id', async (req, res) => {
  try {
    const usuarioId = req.params.id;

    const usuario = await db('users').where({ id: usuarioId }).first();
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

    const produtos = await db('produtos').where({ user_id: usuarioId });

    res.json({
      nome: usuario.nome,
      email: usuario.email,
      produtos
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar coleção pública' });
  }
});



// Rotas privadas (protege com middleware)
routes.get('/vinis', authMiddleware, produtosController.index);
routes.post('/vinis', authMiddleware, produtosController.create);
routes.put('/vinis/:id', authMiddleware, produtosController.update);
routes.delete('/vinis/:id', authMiddleware, produtosController.delete);

export { routes };
