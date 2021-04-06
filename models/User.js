module.exports = (sequelize, type) => {
    return sequelize.define('users', {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: type.STRING,
        allowNull: false
      },
      email: {
          type: type.STRING,
          allowNull: false
      },
      password: {
        type: type.STRING,
        allowNull: false        
      }
    },{
      timestamps: false
  })
}