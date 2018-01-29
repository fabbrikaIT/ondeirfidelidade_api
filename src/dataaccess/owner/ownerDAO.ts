import { Sequelize } from 'sequelize';
import { Response } from 'express';

import { DbConnection } from '../../config/dbConnection';
import { BaseDAO } from '../baseDAO';
import { DataAccessResult } from '../dataAccess.result';
import { OwnerEntity } from '../../models/owner/ownerEntity';

export class OwnerDAO extends BaseDAO {

    // private insertQuery: string = "INSERT INTO OWNER (ONDE_IR_ID, TITLE, REGISTER_DATE, OWNER_NAME, EMAIL, CELLPHONE, LOGO, ONDE_IR_CITY, PASSWORD) VALUES ?";
    private insertQuery: string = "INSERT INTO OWNER SET ?";
    private listQuery: string = "SELECT * FROM OWNER";
    private getOwnerQuery: string = "SELECT * FROM OWNER WHERE ID = ?";
    private deleteOwnerQuery: string = "DELETE FROM OWNER WHERE ID = ?";

    constructor() {
        super();
    }

    /**
     * List all owners in database
    */
    public ListOwners = (res: Response, callback) => {
        this.connDb.Connect(
            connection => {

                const query = connection.query(this.listQuery, (error, results) => {
                    if (!error) {
                        let list: Array<OwnerEntity>;
                        list = results.map(item => {
                            let ownerItem = new OwnerEntity();
                            ownerItem.fromMySqlDbEntity(item);

                            return ownerItem;
                        });

                        return callback(res, error, list);
                    }

                    callback(res, error, results);
                });

                console.log(query.sql);
            }, 
            error => {
                callback(res, error, null);
            }
        );
    }

    /**
     * Return an owner entity from database
    */
    public getOwner(id: number, res: Response,  callback) {
        this.connDb.Connect(
            connection => {

                const query = connection.query(this.getOwnerQuery, id, (error, results) => {
                    if (!error && results.length > 0) {
                       
                        let ownerItem = new OwnerEntity();
                        ownerItem.fromMySqlDbEntity(results[0]);

                        return callback(res, error, ownerItem);
                    }

                    callback(res, error, results);
                });

                console.log(query.sql);
            }, 
            error => {
                callback(res, error, null);
            }
        );
    }

    /**
     * Remove an owner entity from database
    */
    public deleteOwner(id: number, res: Response,  callback) {
        this.connDb.Connect(
            connection => {

                const query = connection.query(this.deleteOwnerQuery, id, (error, results) => {
                    if (!error && results.length > 0) {
                       
                        let ownerItem = new OwnerEntity();
                        ownerItem.fromMySqlDbEntity(results[0]);

                        return callback(res, error, ownerItem);
                    }

                    callback(res, error, null);
                });

                console.log(query.sql);
            }, 
            error => {
                callback(res, error, null);
            }
        );
    }

    /**
     * Create a new owner
     */
    public Create = (owner: OwnerEntity, callback)  => {
        this.connDb.Connect(
            connection => {
                const dbEntity = owner.toMysqlDbEntity();

                const query = connection.query(this.insertQuery, dbEntity, (error, results) => {
                    callback(error, results);
                });

                console.log(query.sql);
            }, 
            error => {
                callback(error, null);
            }
        );
    }

    
}