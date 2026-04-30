export function up(knex) {
  return knex.schema.createTable('produtos', table => {
    table.increments('id').primary();
    table.string('nome').notNullable();
    table.string('artista').notNullable();
    table.decimal('preco', 10, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTable('produtos');
}