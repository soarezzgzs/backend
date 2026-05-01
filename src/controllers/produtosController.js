import connection from '../database/connection.js';

class ProdutosController {
  async index(request, response) {
    const { page = 1, limit = 5, artista } = request.query

    let produtosQuery = connection('produtos')
      .where({ user_id: request.userId })
      .select('*')

    if (artista) {
      produtosQuery = produtosQuery.where('artista', 'like', `${artista}`)
    }

    const produtos = await produtosQuery
      .limit(limit)
      .offset((page - 1) * limit)

    const [{ count }] = await connection('produtos')
      .where({ user_id: request.userId })
      .count('id as count')

    return response.json({
      total: count,
      page: Number(page),
      limit: Number(limit),
      data: produtos
    });
  }

  async create(request, response) {
  const { nome, artista, preco } = request.body;

  if (!nome || !artista || !preco) {
    return response.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  if (preco < 0) {
    return response.status(400).json({ error: 'O preço não pode ser negativo' });
  }

  try {
    const newProdutos = await connection('produtos')
      .insert({
        nome,
        artista,
        preco,
        user_id: request.userId
      })
      .returning(['id', 'nome', 'artista', 'preco', 'user_id']);

    const produto = newProdutos[0]; // pega o primeiro objeto retornado

    return response.status(201).json(produto);
  } catch (err) {
    console.error('Erro ao criar produto:', err);
    return response.status(500).json({ error: 'Erro ao criar produto', detalhe: err.message });
  }
}


  async update(request, response) {
    const { id } = request.params;
    const { nome, artista, preco } = request.body;

    const produto = await connection('produtos')
      .where({ id, user_id: request.userId })
      .first();

    if (!produto) {
      return response.status(404).json({ error: 'Produto não encontrado' });
    }

    await connection('produtos')
      .where({ id, user_id: request.userId })
      .update({
        nome,
        artista,
        preco
      })

    return response.json({ sucess: true });
  }

  async delete(request, response) {
    const { id } = request.params;

    const produto = await connection('produtos')
      .where({ id, user_id: request.userId })
      .first();

    if (!produto) {
      return response.status(404).json({ error: 'Produto não encontrado' });
    }

    await connection('produtos')
      .where({ id, user_id: request.userId })
      .delete();

    return response.json({ sucess: true });
  }

}

export { ProdutosController };