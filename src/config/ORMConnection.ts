import { Sequelize } from "sequelize";

export class ORMConnection {
    public sequelize: Sequelize;
    private _dbName: string;

    constructor(dbName: string) {
        this._dbName = dbName;

        this.CreateConnection();
    }

    private CreateConnection() {
        this.sequelize = new Sequelize(
            this._dbName, 
            process.env.DB_USER,
            process.env.DB_PASS,
            {
                host: process.env.DB_HOST,
                dialect: 'mysql',
                pool: {
                    max: process.env.DB_POOL_LIMIT,
                    min: 0,
                    acquire: 30000,
                    idle: 10000
                },
                operatorsAliases: false
            }
        );
    }

    public testConnection = (result) => {
        this.sequelize.authenticate()
            .then(() => {
                result(true);
            })
            .catch(err => {
                result(false)
            });
    }
}
