import { Sequelize } from 'sequelize-typescript';

import config from './config';

export class Database {
  sequelize: Sequelize;

  init(callback: () => void): void {
    /* Connecting to our app SQL Server */
    console.log('Trying to connect to postgres...');
    console.log('Note: If it takes too long there might be an issue with the communication to Postgres');
    this.sequelize = new Sequelize(config.PG_DB_URI,
      {
        dialect: 'postgres',
        modelPaths: [__dirname + '/db-models' ],
        logging: false,
        dialectOptions: {
          ssl: true
        }
      }
    );
     
    this.sequelize.authenticate()
       .then(() => {
         console.log(
           'Connection to database has been established successfully.'
         );
         callback();
       })
       .catch(err => {
         console.error('Unable to connect to the database: ', err);
       });
  }

}

export default new Database();
