// Borrowed from Patrick Hill's lecture code

const MongoClient = require('mongodb').MongoClient;

const mongoConfig = {
  serverUrl: 'mongodb://localhost:27017/',
  database: 'cs-546-final-project'
};

let _connection = undefined;
let _db = undefined;

module.exports = {
  connectToDb: async () => {
    if (!_connection) {
      _connection = await MongoClient.connect(mongoConfig.serverUrl);
      _db = await _connection.db(mongoConfig.database);
    }

    return _db;
  },
  closeConnection: () => {
    _connection.close();
  }
};