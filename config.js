module.exports = {
  server: {
    port: process.env.NODE_PORT || process.env.PORT || 8884
  },
  mongo: {
    host: process.env.MONGO_HOST || '127.0.0.1',
    port: process.env.MONGO_PORT || 27017,
    database: process.env.MONGO_DB || 'devops303'
  }
}