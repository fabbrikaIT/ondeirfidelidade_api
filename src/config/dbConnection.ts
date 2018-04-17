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

    public static connectionPool: any = null;
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
            database        : this._dbName,
            multipleStatements : true
        };

        if (DbConnection.connectionPool === null) {        
            if (this.CONNECTION_CONFIG.host === undefined || this.CONNECTION_CONFIG.database === undefined) {
                DbConnection.connectionPool = null;
            } else {
                DbConnection.connectionPool = mysql.createPool(this.CONNECTION_CONFIG);
            }
        }
    }

    public DestroyPool = () => {
        if (DbConnection.connectionPool !== null) {
            DbConnection.connectionPool.end( err => {
                
            });
        }
    }

    public Connect = (successCallback, errorCallback) => {
        if (DbConnection.connectionPool == null){
            this.CreateConnection();
        }

        DbConnection.connectionPool.getConnection(function(poolError, connection) { 
            if (poolError) {
                errorCallback(poolError);

                return;
            }

            successCallback(connection);
        });
    }
}
