export default {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './src/database/database.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './src/database/migrations'
    }
  }
};