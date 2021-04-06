const connectToDatabase = require('../config/db')
const Joi = require('joi')
const bcrypt = require('bcrypt')

const saltRounds = 10

function HTTPError (statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

module.exports.healthCheck = async () => {
  await connectToDatabase()
  console.log('Connection successful.')
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Connection successful.' })
  }
}

module.exports.create = async (event) => {
  try {
    const { User } = await connectToDatabase()

    const emailExists = await User.findAll({
      where:{
        email: JSON.parse(event.body).email.toLowerCase()
      }  
    })

    const userSchema = Joi.object().keys({
      name: Joi.string().min(3).required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      confirmPassword: Joi.string().required()
    })

    const{ error, value } = await userSchema.validate(JSON.parse(event.body))
    if(error) {
      return {
        statusCode: 422,
        body: JSON.stringify(error)
      }
    }

    if(emailExists.length) {
      return {
        statusCode: 409,
        headers: { 'Content-Type': 'text/plain' },
        body: "Email already exists"
      }
    }

    if(value.password != value.confirmPassword){
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'text/plain' },
        body: "ConfirmPassword must be the same as password"
      }
    }

    if(value.email){
      value.email = value.email.toLowerCase()
    }

    if(value.password) {
      const salt = bcrypt.genSaltSync(saltRounds)
      const hash = bcrypt.hashSync(value.password, salt)
      value.password = hash
    }

    const user = await User.create(value)
    return {
      statusCode: 200,
      body: JSON.stringify(user)
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could not create the user.'
    }
  }
}

module.exports.getOne = async (event) => {
  try {
    const { User } = await connectToDatabase()
    const user = await User.findByPk(event.pathParameters.id)
    if (!user) throw new HTTPError(404, `User with id: ${event.pathParameters.id} was not found`)
    return {
      statusCode: 200,
      body: JSON.stringify(user)
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: err.message || 'Could not fetch the User.'
    }
  }
}

module.exports.getAll = async () => {
  try {
    const { User } = await connectToDatabase()
    const user = await User.findAll({order: [['id', 'ASC']]})
    return {
      statusCode: 200,
      body: JSON.stringify(user)
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could not fetch the Users.'
    }
  }
}

module.exports.update = async (event) => {
  try {
    const { User } = await connectToDatabase()
    const searchEmail = JSON.parse(event.body).email ? JSON.parse(event.body).email.toLowerCase() : null

    const user = await User.findByPk(event.pathParameters.id)
    if(!user) throw new HTTPError(404, `User with id: ${event.pathParameters.id} was not found`)
    const mail = await User.findAll({where: {email: searchEmail}})
    if(mail.length) throw new HTTPError(400, `User with email: ${JSON.parse(event.body).email.toLowerCase()} already exists`)

    const userUpdateSchema = Joi.object().keys({
      name: Joi.string().min(3),
      email: Joi.string().email(),
      password: Joi.string(),
      confirmPassword: Joi.string()
    })

    const{ error, value } = userUpdateSchema.validate(JSON.parse(event.body))
    if(error) {
      return {
        statusCode: 422,
        body: JSON.stringify(error)
      }
    }

    if(value.password != value.confirmPassword){
      return {
        statusCode: 400,
        body: "confirmPassword must be equal to password"
      }
    }
    
    if(value.name) user.name = value.name
    if(value.email) user.email = value.email.toLowerCase()
    if(value.password) {
      const salt = bcrypt.genSaltSync(saltRounds)
      const hash = bcrypt.hashSync(value.password, salt)
      user.password = hash
    }

    await user.save()
    return {
      statusCode: 200,
      body: JSON.stringify(user)
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: err.message || 'Could not update the User.'
    }
  }
}

module.exports.destroy = async (event) => {
  try {
    const { User } = await connectToDatabase()
    const user = await User.findByPk(event.pathParameters.id)
    if (!user) throw new HTTPError(404, `User with id: ${event.pathParameters.id} was not found`)
    await user.destroy()
    return {
      statusCode: 200,
      body: JSON.stringify(user)
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: err.message || 'Could not destroy the User.'
    }
  }
}