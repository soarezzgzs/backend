export function up(knex) {
  return knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table.string('nome').notNullable();
    table.string('email').unique().notNullable();
    table.string('senha').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTable('users');
}