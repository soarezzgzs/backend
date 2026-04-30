import connection from '../database/connection.js';

class ProdutosController {
  async index(request, response) {
    const { page = 1, limit = 5, artista } = request.query

    let produtosQuery = connection('produtos').select('*')

    if (artista) {
      produtosQuery = produtosQuery.where('artista', 'like', `${artista}`)
    }

    const produtos = await produtosQuery
      .limit(limit)
      .offset((page - 1) * limit)

    const [{ count }] = await connection('produtos')
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
      return response.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (preco < 0) {
      return response.status(400).json({ error: 'O preço não pode ser negativo' });
    }

    const [id] = await connection('produtos').insert({
      nome,
      artista,
      preco
    });

    return response.json({ id, nome, artista, preco });
  }

  async update(request, response) {
    const { id } = request.params;
    const { nome, artista, preco } = request.body;

    const produto = await connection('produtos')
      .where('id', id).first();

    if (!produto) {
      return response.status(400).json({ error: 'Produto não encontrado' });
    }

    await connection('produtos')
      .where('id', id)
      .update({
        nome,
        artista,
        preco
      })

    return response.status(204).send();
  }

  async delete(request, response) {
    const { id } = request.params;

    const produto = await connection('produtos')
      .where('id', id).first();

    if (!produto) {
      return response.status(400).json({ error: 'Produto não encontrado' });
    }

    await connection('produtos').where('id', id).delete();

    return response.status(204).send();
  }

}

export { ProdutosController };