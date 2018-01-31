import { ELoyaltyStatus } from './../../models/loyalty/loyalty';
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
    private insertValidityQuery: string = "INSERT INTO LOYALTY_VALIDITY (LOYALTY_ID, WEEKDAY, STARTTIME, ENDTIME) VALUES ?";
    private listQuery: string = "SELECT * FROM LOYALTY";
    private listByOwnerQuery: string = "SELECT * FROM LOYALTY WHERE OWNER_ID = ?";
    private listByOwnerStatusQuery: string = "SELECT * FROM LOYALTY WHERE STATUS = ? AND OWNER_ID = ?";
    private getLoyaltyQuery: string = "SELECT L.*, LU.* FROM LOYALTY L, LOYALTY_USAGE_TYPE LU WHERE L.ID = ? AND L.ID = LU.ID";
    private getLoyaltyValidity: string = "SELECT * FROM LOYALTY_VALIDITY WHERE LOYALTY_ID = ?";
    private deleteLoyaltyQuery: string = "DELETE FROM LOYALTY WHERE ID = ?";
    private deleteLoyaltyValidityQuery: string = "DELETE FROM LOYALTY_VALIDITY WHERE LOYALTY_ID = ?";
    private updateQuery: string = "UPDATE LOYALTY SET ? WHERE ID= ?"
    private updateUsageQuery: string = "UPDATE LOYALTY_USAGE_TYPE SET ? WHERE ID = ?";    
    private changeStatusQuery: string = "UPDATE LOYALTY SET STATUS = ? WHERE ID = ?";

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
     * List all loyalty in database
    */
    public ListLoyaltyStatus = (ownerId: number, status: ELoyaltyStatus, res: Response, callback) => {
        this.connDb.Connect(
            connection => {

                const query = connection.query(this.listByOwnerStatusQuery, [status, ownerId], (error, results) => {
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

                                    return validity;
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
    public DeleteLoyalty(id: number, callback, res?: Response) {
        this.connDb.Connect(
            connection => {

                const query = connection.query(this.deleteLoyaltyQuery, id, (error, results) => {
                    if (!error) {
                        connection.release();
                        if (callback)
                            return callback(error, results);
                    } else {
                        connection.release();
                        if (callback)
                            return callback(error, null);
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
    public Create = (loyalty: LoyaltyEntity, callback)  => {
        this.connDb.Connect(
            connection => {
                const dbEntity = loyalty.toMysqlDbEntity(true);

                const query = connection.query(this.insertQuery, dbEntity, (error, results) => {
                    if (!error) {
                        loyalty.usageType.id = results.insertId;
                        const dbUsage = loyalty.usageType.toMysqlDbEntity(true);

                        connection.query(this.insertUsageQuery, dbUsage, (err, result) => {
                            if (!err) {
                                if (loyalty.validity && loyalty.validity.length > 0) {
                                    const dbValidities = new Array<any>();

                                    loyalty.validity.forEach(item => {
                                        item.loyaltyId = results.insertId;

                                        dbValidities.push(
                                            [
                                                item.loyaltyId,
                                                item.weekday,
                                                item.startTime, 
                                                item.endTime
                                            ]
                                        );
                                    });

                                    const qi = connection.query(this.insertValidityQuery, [dbValidities], (e, ret) => { 
                                        if (e) {
                                            this.DeleteLoyalty(results.insertId, null);
                                        }
                                        
                                        connection.release();
                                        return callback(e, results);
                                    });
                                }          
                            } else {
                                this.DeleteLoyalty(results.insertId, null);

                                connection.release();
                                return callback(err, results);
                            }                
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
    public UpdateLoyalty = (loyalty: LoyaltyEntity, callback) => {
        this.connDb.Connect(
            connection => {
                const dbLoyalty = loyalty.toMysqlDbEntity(false);

                const query = connection.query(this.updateQuery, [dbLoyalty, loyalty.id], (error, results) => {
                    if (!error) {
                        const dbUsage = loyalty.usageType.toMysqlDbEntity(false);

                        connection.query(this.updateUsageQuery, [dbUsage, loyalty.usageType.id], (err, result) => {
                            if (!err) {
                                if (loyalty.validity && loyalty.validity.length > 0){
                                    //LIMPA AS VIGENCIAS ATUAIS
                                    connection.query(this.deleteLoyaltyValidityQuery, loyalty.id, (er, rest) => {
                                        if (!er) {
                                            //INSERE VIGENCIAS ATUALIZADAS
                                            const dbValidities = new Array<any>();

                                            loyalty.validity.forEach(item => {
                                                dbValidities.push(
                                                    [
                                                        item.loyaltyId,
                                                        item.weekday,
                                                        item.startTime, 
                                                        item.endTime
                                                    ]
                                                );
                                            });

                                            const qi = connection.query(this.insertValidityQuery, [dbValidities], (e, ret) => { 
                                                connection.release();
                                                return callback(e, results);
                                            });
                                        } else {
                                            connection.release();
                                            return callback(er, results);
                                        }
                                    })
                                } else {
                                    connection.release();
                                    return callback(err, results);
                                }
                            } else {
                                connection.release();
                                return callback(err, results);
                            }
                        });

                    } else {
                        connection.release();
                        return callback(error, results);
                    }
                });
            },
            error => {
                callback(error, null);
            }
        );
    }

    /**
     * Update the status of a loyalty program
     */
    public UpdateLoyaltyStatus = (loyaltyId: number, status: ELoyaltyStatus, callback) => {
        this.connDb.Connect(
            connection => {
                const query = connection.query(this.changeStatusQuery, [status, loyaltyId], (error, results) => {
                    callback(error, results);
                });
            },
            error => {
                callback(error, null);
            }
        );
    }
}