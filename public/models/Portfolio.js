const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('postgres://default:ShoBm12iDkxK@ep-purple-recipe-a43d60u8-pooler.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require', {
  // host: '127.0.0.1',
  dialect: 'postgres',
});

const Portfolio = sequelize.define(
    'Portfolios',
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      years: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      item: {
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
     }
  )


//  同步資料表
// async function asyncDB() {
//   try {
//       await Portfolio.sync({ force: true });
//       console.log( "資料表同步成功！")
//   } catch (error) {
//       console.error(error,"資料表同步失敗！")
//   }
// } 
// asyncDB();