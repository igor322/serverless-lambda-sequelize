const connectToDatabase = require('../config/db')
const Joi = require('joi')

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
    
    const userSchema = Joi.object().keys({
      name: Joi.string().min(3).required(),
      email: Joi.string().email().required()
    })

    const{ error, value } = userSchema.validate(JSON.parse(event.body))
    if(error) {
      return {
        statusCode: 422,
        body: JSON.stringify(error)
      }
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
    const user = await User.findAll()
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
    const input = JSON.parse(event.body)
    const { User } = await connectToDatabase()
    const user = await User.findByPk(event.pathParameters.id)
    if (!user) throw new HTTPError(404, `User with id: ${event.pathParameters.id} was not found`)
    if (input.name) user.name = input.name
    if (input.email) user.email = input.email
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