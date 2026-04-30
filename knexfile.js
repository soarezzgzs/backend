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
  },

  production: {
    client: process.env.DB_CLIENT || 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './src/database/migrations'
    }
  }
};
