const Sequelize = require('sequelize');

const connection = new Sequelize('blog', 'root', '123', {
  host: 'localhost',
  dialect: 'mysql',
  timezone: '-03:00'
});

module.exports = connection;