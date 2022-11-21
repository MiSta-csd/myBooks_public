import { Sequelize } from 'sequelize';

/* const sequelize = new Sequelize( // course git code
    {
        host: 'localhost',
        port: 5432,
        database: 'postgres',
        schema: 'booklist',
        dialect: 'postgres',
        username: 'booklistuser',
        password: 'booklistuser',
        logging: false,
        define: {
            timestamps: false,
            freezeTableName: true
        }
    }); */

const sequelize = new Sequelize({   // my local creds
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    username: 'postgres',
    password: 'admin',
    database: "ourBooks1",
    logging: false,
    define: {
        timestamps: false,
        freezeTableName: true
    }

});

export default sequelize