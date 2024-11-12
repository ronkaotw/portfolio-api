const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('aaron_portfolio', 'postgres', 'postgres', {
  host: '127.0.0.1',
  dialect: 'postgres',
});

const resume = sequelize.define(
    'Resume',
    {
      Name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Education: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Years: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      linkRel: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      linkHref: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      linkAction: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expCpTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expYears: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pjTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pjDoSomething: {
        type: DataTypes.STRING,
        allowNull: false,
      },
     }
  )


//  同步資料表
// async function asyncDB() {
//   try {
//       await resume.sync({ force: true });
//       console.log( "資料表同步成功！")
//   } catch (error) {
//       console.error(error,"資料表同步失敗！")
//   }
// } 
// asyncDB();