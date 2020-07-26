const config = require('config');

const migrateMongoConfig = {
  mongodb: {
    url: config.mongo.uri,

    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },

  migrationsDir: "migrations",

  changelogCollectionName: "changelog",

  migrationFileExtension: ".js"
};

module.exports = migrateMongoConfig;
