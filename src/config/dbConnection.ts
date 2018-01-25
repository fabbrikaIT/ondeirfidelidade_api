/*
 * Data access (MySql)
 *
 * Copyright(c) 2018 Fabbrika
 * Author: 2018-01-09 | Eduardo Sans
 */
import * as mysql from "mysql";

export class DbConnection {
    private CONNECTION_CONFIG: any;
    private _dbName: string;

    private connectionPool: any;
    constructor(dbName: string) {
        this._dbName = dbName;

        this.CreateConnection();
    }

    private CreateConnection() {
        this.CONNECTION_CONFIG = {
            connectionLimit : process.env.DB_POOL_LIMIT,
            host            : process.env.DB_HOST,
            user            : process.env.DB_USER,
            password        : process.env.DB_PASS,
            database        : this._dbName
        };

        if (this.CONNECTION_CONFIG.host === undefined || this.CONNECTION_CONFIG.database === undefined) {
            this.connectionPool = null;
        } else {
            this.connectionPool = mysql.createPool(this.CONNECTION_CONFIG);
        }
    }

    public Connect = (successCallback, errorCallback) => {
        if (this.connectionPool == null){
            this.CreateConnection();
        }

        this.connectionPool.getConnection(function(poolError, connection) { 
            if (poolError) {
                errorCallback(poolError);

                return;
            }

            successCallback(connection);
        });
    }
}
