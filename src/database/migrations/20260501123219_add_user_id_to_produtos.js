export function up(knex) {
  return knex.schema.table('produtos', table => {
    table.integer('user_id').unsigned()
      .references('id').inTable('users')
      .onDelete('CASCADE');
  });
}

export function down(knex) {
  return knex.schema.table('produtos', table => {
    table.dropColumn('user_id');
  });
}
