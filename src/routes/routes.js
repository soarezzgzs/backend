import { Router } from 'express';
import { ProdutosController } from '../controllers/produtosController.js';

const routes = Router();

const produtosController = new ProdutosController();

routes.get('/vinis', produtosController.index);
routes.post('/vinis', produtosController.create);
routes.put('/vinis/:id', produtosController.update);
routes.delete('/vinis/:id', produtosController.delete);

export { routes };