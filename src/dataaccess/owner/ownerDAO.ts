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
    private getOwnerByEmailQuery: string = "SELECT * FROM OWNER WHERE EMAIL = ?";
    private deleteOwnerQuery: string = "DELETE FROM OWNER WHERE ID = ?";
    private updatePasswordQuery: string = "UPDATE OWNER SET PASSWORD=? WHERE ID=?"
    private updateQuery: string = "UPDATE OWNER SET ? WHERE ID= ?"

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
            }, 
            error => {
                callback(res, error, null);
            }
        );
    }

    /**
     * Return an owner entity from database
    */
    public GetOwner(id: number, res: Response,  callback) {
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
            }, 
            error => {
                callback(res, error, null);
            }
        );
    }

    public GetOwnerByEmail(email: string, callback) {
        this.connDb.Connect(
            connection => {
                const query = connection.query(this.getOwnerByEmailQuery, email, (error, results) => {
                    if (!error && results.length > 0) {
                       
                        let ownerItem = new OwnerEntity();
                        ownerItem.fromMySqlDbEntity(results[0]);

                        return callback(error, ownerItem);
                    }

                    callback(error, null);
                });

                console.log(query.sql);
            }, 
            error => {
                callback(error, null);
            }
        );
    }

    /**
     * Remove an owner entity from database
    */
    public DeleteOwner(id: number, res: Response,  callback) {
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
                const dbEntity = owner.toMysqlDbEntity(true);

                const query = connection.query(this.insertQuery, dbEntity, (error, results) => {
                    callback(error, results);
                });
            }, 
            error => {
                callback(error, null);
            }
        );
    }

    /**
     * UpdatePassword
     */
    public UpdatePassword = (memberId: number, password: string, res: Response, callback) => {
        this.connDb.Connect(
            connection => {
                const query = connection.query(this.updatePasswordQuery, [password, memberId], (error, results) => {
                    callback(res, error, null);
                });

                console.log(query);
            },
            error => {
                callback(res, error, null);
            }
        );
    }

    /**
     * Update Owner
     */
    public UpdateOwner = (owner: OwnerEntity, res: Response, callback) => {
        this.connDb.Connect(
            connection => {
                const dbOwner = owner.toMysqlDbEntity(false);

                const query = connection.query(this.updateQuery, [dbOwner, owner.id], (error, results) => {
                    callback(res, error, results);
                });

                console.log(query);
            },
            error => {
                callback(res, error, null);
            }
        );
    }
}