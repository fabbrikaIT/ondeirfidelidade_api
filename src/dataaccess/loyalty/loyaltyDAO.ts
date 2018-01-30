import { Sequelize } from 'sequelize';
import { Response } from 'express';

import { DbConnection } from '../../config/dbConnection';
import { BaseDAO } from '../baseDAO';
import { DataAccessResult } from '../dataAccess.result';
import { LoyaltyEntity } from '../../models/loyalty/loyalty';
import { LoyaltyValidity } from '../../models/loyalty/loyaltyValidity';
import { LoyaltyUsageType } from '../../models/loyalty/loyaltyUsageType';

export class LoyaltyDAO extends BaseDAO {

    private insertQuery: string = "INSERT INTO LOYALTY SET ?";
    private insertUsageQuery: string = "INSERT INTO LOYALTY_USAGE_TYPE SET ?";
    private listQuery: string = "SELECT * FROM LOYALTY";
    private listByOwnerQuery: string = "SELECT * FROM LOYALTY WHERE OWNER_ID = ?";
    private listByOwnerStatusQuery: string = "SELECT * FROM LOYALTY WHERE STATUS = ? AND OWNER_ID = ?";
    private getLoyaltyQuery: string = "SELECT L.*, LU.* FROM LOYALTY L, LOYALTY_USAGE_TYPE LU WHERE L.ID = ? AND L.ID = LU.ID";
    private getLoyaltyValidity: string = "SELECT * FROM LOYALTY_VALIDITY WHERE LOYALTY_ID = ?";
    private deleteLoyaltyQuery: string = "DELETE FROM LOYALTY WHERE ID = ?";
    private updateQuery: string = "UPDATE LOYALTY SET ? WHERE ID= ?"

    constructor() {
        super();
    }

    /**
     * List all loyalty in database
    */
    public ListLoyalty = (ownerId: number, res: Response, callback) => {
        this.connDb.Connect(
            connection => {

                const query = connection.query(this.listQuery, ownerId, (error, results) => {
                    if (!error) {
                        let list: Array<LoyaltyEntity>;
                        list = results.map(item => {
                            let ownerItem = new LoyaltyEntity();
                            ownerItem.fromMySqlDbEntity(item);

                            return ownerItem;
                        });

                        connection.release();
                        return callback(res, error, list);
                    }

                    connection.release();
                    return callback(res, error, results);
                });

            }, 
            error => {
                callback(res, error, null);
            }
        );
    }

    /**
     * Return an loyalty entity from database
    */
    public GetLoyalty(id: number, res: Response,  callback) {
        this.connDb.Connect(
            connection => {

                const query = connection.query(this.getLoyaltyQuery, id, (error, results) => {
                    if (!error && results.length > 0) {
                       
                        let ownerItem = new LoyaltyEntity();
                        ownerItem.fromMySqlDbEntity(results[0]);
                        ownerItem.usageType = LoyaltyUsageType.getInstance();
                        ownerItem.usageType.fromMySqlDbEntity(results[0]);
                        
                        connection.query(this.getLoyaltyValidity, id, (err, result) => {
                            if (!error && result.length > 0) { 
                                ownerItem.validity = result.map(item => {
                                    let validity = LoyaltyValidity.getInstance();
                                    validity.fromMySqlDbEntity(item);
                                });

                                connection.release();
                                return callback(res, err, ownerItem);
                            } else {
                                connection.release();
                                return callback(res, err, ownerItem);
                            }
                        })

                        
                    } else {
                        connection.release();
                        return callback(res, error, results);
                    }
                });
            }, 
            error => {
                return callback(res, error, null);
            }
        );
    }

    /**
     * Remove an loyalty entity from database
    */
    public DeleteOwner(id: number, res: Response,  callback) {
        this.connDb.Connect(
            connection => {

                const query = connection.query(this.deleteLoyaltyQuery, id, (error, results) => {
                    if (!error && results.length > 0) {
                       
                        let ownerItem = new LoyaltyEntity();
                        ownerItem.fromMySqlDbEntity(results[0]);

                        connection.release();
                        return callback(res, error, ownerItem);
                    } else {
                        connection.release();
                        return callback(res, error, null);
                    }
                });

            }, 
            error => {
                callback(res, error, null);
            }
        );
    }

    /**
     * Create a new loyalty
     */
    public Create = (owner: LoyaltyEntity, callback)  => {
        this.connDb.Connect(
            connection => {
                const dbEntity = owner.toMysqlDbEntity(true);

                const query = connection.query(this.insertQuery, dbEntity, (error, results) => {
                    if (!error) {
                        owner.usageType.id = results.insertId;
                        const dbUsage = owner.usageType.toMysqlDbEntity(true);

                        connection.query(this.insertUsageQuery, dbUsage, (err, result) => {
                            connection.release();
                            return callback(error, results);
                        });
                    } else {    
                        connection.release();
                        return callback(error, results);
                    }
                });
            }, 
            error => {
                return callback(error, null);
            }
        );
    }

    /**
     * Update a loyalty data from it ID
     */
    public UpdateOwner = (owner: LoyaltyEntity, res: Response, callback) => {
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