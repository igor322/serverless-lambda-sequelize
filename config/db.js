const Sequelize = require('sequelize')
const UserModel = require('../models/User')
var pg = require('pg')

const sequelize = new Sequelize(process.env.DB_NAME,process.env.DB_USER,process.env.DB_PASSWORD, {
    dialect: 'postgres',
    dialectModule: pg,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    logging: false,
    pool: {
        max: 5,
        min: 0,
        idle: 20000,
        handleDisconnects: true
    }
})


const User = UserModel(sequelize, Sequelize)
const Models = { User }
const connection = {}

module.exports = async () => {
  
  await sequelize.sync()
  await sequelize.authenticate()
  console.log('=> Created a new connection.')

  return Models
}