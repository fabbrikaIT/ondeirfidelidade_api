import { Sequelize } from 'sequelize';
import { Response } from 'express';

import { DbConnection } from '../../config/dbConnection';
import { BaseDAO } from '../baseDAO';
import { DataAccessResult } from '../dataAccess.result';
import { LoyaltyEntity } from '../../models/loyalty/loyalty';
import { LoyaltyValidity } from '../../models/loyalty/loyaltyValidity';
import { LoyaltyUsageType } from '../../models/loyalty/loyaltyUsageType';
import { ELoyaltyStatus } from './../../models/loyalty/loyalty';
import { LoyaltyProgramEntity } from '../../models/loyalty/loyaltyProgram';
import { LoyaltyPointsEntity } from '../../models/loyalty/loyaltyPoints';

export class LoyaltyDAO extends BaseDAO {
    // Query de acesso aos dados
    private insertQuery: string = "INSERT INTO LOYALTY SET ?";
    private insertUsageQuery: string = "INSERT INTO LOYALTY_USAGE_TYPE SET ?";
    private insertValidityQuery: string = "INSERT INTO LOYALTY_VALIDITY (LOYALTY_ID, WEEKDAY, STARTTIME, ENDTIME) VALUES ?";
    private listQuery: string = "SELECT * FROM LOYALTY";
    private listByOwnerQuery: string = "SELECT * FROM LOYALTY WHERE OWNER_ID = ?";
    private listByOwnerStatusQuery: string = "SELECT * FROM LOYALTY WHERE STATUS = ? AND OWNER_ID = ?";
    private getLoyaltyQuery: string = "SELECT L.*, LU.* FROM LOYALTY L, LOYALTY_USAGE_TYPE LU WHERE L.ID = ? AND L.ID = LU.ID";
    private getLoyaltyQrHashQuery: string = "SELECT L.*, LU.* FROM LOYALTY L, LOYALTY_USAGE_TYPE LU WHERE L.QR_HASH = ? AND L.ID = LU.ID";
    private getLoyaltyValidity: string = "SELECT * FROM LOYALTY_VALIDITY WHERE LOYALTY_ID = ?";
    private deleteLoyaltyQuery: string = "DELETE FROM LOYALTY WHERE ID = ?";
    private deleteLoyaltyValidityQuery: string = "DELETE FROM LOYALTY_VALIDITY WHERE LOYALTY_ID = ?";
    private updateQuery: string = "UPDATE LOYALTY SET ? WHERE ID= ?"
    private updateUsageQuery: string = "UPDATE LOYALTY_USAGE_TYPE SET ? WHERE ID = ?";    
    private changeStatusQuery: string = "UPDATE LOYALTY SET STATUS = ? WHERE ID = ?";
    private getLoyaltyProgramQuery: string = `SELECT L.ID, L.REGISTER_DATE, L.DISCHARGE, L.CARD_LINK, P.POINTS_DATE, L.LOYALTY_ID, L.USER_ID
                                                FROM LOYALTY_PROGRAMS L 
                                                LEFT JOIN LOYALTY_POINTS P ON L.ID = P.PROGRAM_ID
                                                WHERE L.LOYALTY_ID = ?
                                                AND EXISTS (SELECT 1 FROM USERS U
                                                            WHERE U.ID = L.USER_ID
                                                                AND U.ONDE_IR_ID = ?)`;
    private getLoyaltyProgramByIdQuery: string = `SELECT L.ID, L.REGISTER_DATE, L.DISCHARGE, L.CARD_LINK, P.POINTS_DATE, L.LOYALTY_ID, L.USER_ID
                                                FROM LOYALTY_PROGRAMS L, LOYALTY_POINTS P
                                                WHERE L.ID = P.PROGRAM_ID
                                                AND L.ID = ?`;
    private subscribeUserLoyaltyProgramQuery: string = "INSERT INTO LOYALTY_PROGRAMS SET ?";
    private addLoyaltyProgramPointQuery: string = "INSERT INTO LOYALTY_POINTS SET ?";
    private updateLoyaltyProgramQuery: string = "UPDATE LOYALTY_PROGRAMS SET ? WHERE ID = ?";
    private clearLoyaltyProgramPointsQuery: string = "DELETE FROM LOYALTY_POINTS WHERE PROGRAM_ID = ?";
    private searchLoyaltyByCityQuery: string = `SELECT L.*, LU.* FROM LOYALTY L, LOYALTY_USAGE_TYPE LU
                                                WHERE L.ID = LU.ID
                                                AND STATUS = 2
                                                AND START_DATE <= SYSDATE()
                                                AND (END_DATE IS NULL OR END_DATE >= SYSDATE())
                                                AND EXISTS (SELECT 1 FROM OWNER O
                                                                        WHERE O.ID = L.OWNER_ID
                                                                            AND O.ONDE_IR_CITY = ?)`;
    private listUserLoyaltyQuery: string = `SELECT LP.ID AS PROGRAM_ID,L.ID, L.NAME, L.START_DATE, L.END_DATE, L.TYPE, L.DAY_LIMIT, L.USAGE_LIMIT, L.QR_HASH,
                                                    LU.USAGE_GOAL, LU.USAGE_REWARD
                                                FROM LOYALTY_PROGRAMS LP, LOYALTY L, LOYALTY_USAGE_TYPE LU
                                                WHERE LP.LOYALTY_ID = L.ID
                                                AND L.ID = LU.ID
                                                AND EXISTS (SELECT 1 FROM USERS U
                                                            WHERE U.ID = LP.USER_ID
                                                            AND U.ONDE_IR_ID = ?)`;

    constructor() {
        super();
    }

    /**
     * List all loyalty in database
    */
    public ListLoyalty = (ownerId: number, res: Response, callback) => {
        this.connDb.Connect(
            connection => {

                const query = connection.query(this.listByOwnerQuery, ownerId, (error, results) => {
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
    public GetLoyalty = (id: number, res: Response,  callback) => {
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
     * Return an loyalty entity from database by the qrHash
    */
   public GetLoyaltyByHash(qrHash: string, callback) {
    this.connDb.Connect(
        connection => {

            const query = connection.query(this.getLoyaltyQrHashQuery, qrHash, (error, results) => {
                if (!error && results.length > 0) {
                   
                    let ownerItem = new LoyaltyEntity();
                    ownerItem.fromMySqlDbEntity(results[0]);
                    ownerItem.usageType = LoyaltyUsageType.getInstance();
                    ownerItem.usageType.fromMySqlDbEntity(results[0]);
                    
                    connection.query(this.getLoyaltyValidity, ownerItem.id, (err, result) => {
                        if (!error && result.length > 0) { 
                            ownerItem.validity = result.map(item => {
                                let validity = LoyaltyValidity.getInstance();
                                validity.fromMySqlDbEntity(item);

                                return validity;
                            });

                            connection.release();
                            return callback(err, ownerItem);
                        } else {
                            connection.release();
                            return callback(err, ownerItem);
                        }
                    })

                    
                } else {
                    connection.release();
                    return callback(error, null);
                }
            });
        }, 
        error => {
            return callback(error, null);
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
                                } else {
                                    connection.release();
                                    return callback(err, results);
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
                connection.query(this.changeStatusQuery, [status, loyaltyId], (error, results) => {
                    connection.release();
                    callback(error, results);
                });
            },
            error => {
                callback(error, null);
            }
        );
    }

    public GetUserLoyaltyProgram = (userId: number, loyaltyId: number, callback) => {
        this.connDb.Connect(
            connection => {
                connection.query(this.getLoyaltyProgramQuery, [loyaltyId, userId], (error, results) => {
                    if (error || results.length == 0) {
                        connection.release();
                        return callback(error, null);
                    }

                    const program: LoyaltyProgramEntity = LoyaltyProgramEntity.GetInstance();
                    program.fromMySqlDbEntity(results[0]);

                    results.forEach(element => {
                        if (element.POINTS_DATE) {
                            let point: LoyaltyPointsEntity = LoyaltyPointsEntity.GetInstance();
                            point.fromMySqlDbEntity(element);

                            program.Points.push(point);
                        }
                    });

                    connection.release();
                    return callback(error, program);
                });
            }, 
            error => {
                return callback(error, null);
            }
        );
    }

    public GetLoyaltyProgram = (programId: number, callback) => {
        this.connDb.Connect(
            connection => {
                connection.query(this.getLoyaltyProgramByIdQuery, programId, (error, results) => {
                    if (error || results.length == 0) {
                        connection.release();
                        return callback(error, null);
                    }

                    const program: LoyaltyProgramEntity = LoyaltyProgramEntity.GetInstance();
                    program.fromMySqlDbEntity(results[0]);

                    results.forEach(element => {
                        let point: LoyaltyPointsEntity = LoyaltyPointsEntity.GetInstance();
                        point.fromMySqlDbEntity(element);

                        program.Points.push(point);
                    });

                    connection.release();
                    return callback(error, program);
                });
            }, 
            error => {
                return callback(error, null);
            }
        );
    }

    /** Atualiza o número de resgates e limpa as pontuações de um programa */
    public RedeemLoyaltyAward = (program: LoyaltyProgramEntity, res: Response, callback) => {
        this.connDb.Connect(
            connection => {
                const dbEntity = program.toMysqlDbEntity(false);

                connection.query(this.clearLoyaltyProgramPointsQuery, program.Id, (error, results) => {
                    if (error) {
                        connection.release();
                        return callback(res, error, null);
                    }

                    connection.query(this.updateLoyaltyProgramQuery, [dbEntity, program.Id], (err, ret) => {
                        connection.release();
                        return callback(res, err, ret);
                    });
                });
            }, 
            error => {
                return callback(res, error, null);
            }
        );
    }

    /** Cria uma nova inscrição em um programa de fidelidade */
    public SubscribeUserLoyaltyProgram = (program: LoyaltyProgramEntity, callback)  => {
        this.connDb.Connect(
            connection => {
                const dbEntity = program.toMysqlDbEntity(true);

                const query = connection.query(this.subscribeUserLoyaltyProgramQuery, dbEntity, (error, results) => {
                    connection.release();
                    return callback(error, results);
                });
            }, 
            error => {
                return callback(error, null);
            }
        );
    }

    /** realiza a pontuação em um programa de fidelidade */
    public AddLoyaltyProgramPoint = (point: LoyaltyPointsEntity, callback)  => {
        this.connDb.Connect(
            connection => {
                const dbEntity = point.toMysqlDbEntity(true);

                const query = connection.query(this.addLoyaltyProgramPointQuery, dbEntity, (error, results) => {
                    connection.release();
                    return callback(error, results);
                });
            }, 
            error => {
                callback(error, null);
            }
        );
    }

    /** Buscas de programas de fidelidade - Usuários */
    public SearchLoyaltyByCity = (cityId: number, res: Response, callback) => {
        this.connDb.Connect(
            connection => {
                connection.query(this.searchLoyaltyByCityQuery, cityId, (error, results) => {
                    if (!error && results.length > 0) { 
                        let list: Array<LoyaltyEntity>;

                        list = results.map(item => {
                            let loyaltyItem = new LoyaltyEntity();
                            loyaltyItem.fromMySqlDbEntity(item);
                            loyaltyItem.usageType = LoyaltyUsageType.getInstance();
                            loyaltyItem.usageType.fromMySqlDbEntity(item);

                            return loyaltyItem;
                        });

                        connection.release();
                        return callback(res, error, list);
                    } else {
                        connection.release();
                        return callback(res, error, null);
                    }
                });
            }, 
            error => {
                return callback(res, error, null);
            }
        );
    }

    /** Busca os programas de fidelidade de um usuário */
    public ListUserLoyalty = (userId: number, res: Response, callback) => {
        this.connDb.Connect(
            connection => {
                connection.query(this.listUserLoyaltyQuery, userId, (error, results) => {
                    if (!error && results.length > 0) { 
                        let list: Array<LoyaltyEntity>;

                        list = results.map(item => {
                            let loyaltyItem = new LoyaltyEntity();
                            loyaltyItem.fromMySqlDbEntity(item);
                            loyaltyItem.usageType = LoyaltyUsageType.getInstance();
                            loyaltyItem.usageType.fromMySqlDbEntity(item);

                            return loyaltyItem;
                        });

                        connection.release();
                        return callback(res, error, list);
                    } else {
                        connection.release();
                        return callback(res, error, null);
                    }
                });
            }, 
            error => {
                return callback(res, error, null);
            }
        );
    }
}