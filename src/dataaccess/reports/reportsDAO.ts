import { Sequelize } from 'sequelize';
import { Response } from 'express';

import { DbConnection } from '../../config/dbConnection';
import { BaseDAO } from '../baseDAO';
import { DataAccessResult } from '../dataAccess.result';
import { OwnerEntity } from '../../models/owner/ownerEntity';

export class ReportsDAO extends BaseDAO {

    private getLoyaltiesNumberQuery = "SELECT COUNT(1) AS ITEMS FROM LOYALTY";
    private getOffersNumberQuery = "SELECT COUNT(1) AS ITEMS FROM OFFERS";
    private getCouponsNumberQuery = `SELECT COUNT(1) AS ITEMS FROM COUPONS C, OFFERS O
                                    WHERE C.OFFER_ID = O.ID`;
    private getClientsNumberQuery = `SELECT COUNT(1) AS ITEMS FROM LOYALTY_PROGRAMS LP, LOYALTY L
                                    WHERE LP.LOYALTY_ID = L.ID`;
    private listLoyaltyProgramsQuery = `SELECT L.NAME AS LOYALTY, U.NAME AS USER, LP.REGISTER_DATE, LP.DISCHARGE, COUNT(LPT.POINTS_DATE) AS POINTS
                                        FROM LOYALTY_PROGRAMS LP LEFT JOIN LOYALTY_POINTS LPT ON LPT.PROGRAM_ID = LP.ID, LOYALTY L, USERS U, OWNER O
                                        WHERE LP.LOYALTY_ID = L.ID
                                        AND LP.USER_ID = U.ID
                                        AND L.OWNER_ID = O.ID`;
    private listCouponsQuery = `SELECT O.TITLE, O.TYPE, U.NAME AS USER, C.IS_VALID, C.VALID_DATE
                                FROM COUPONS C, OFFERS O, USERS U, OWNER OW
                                WHERE C.OFFER_ID = O.ID
                                AND C.USER_ID = U.ID
                                AND O.OWNER_ID = OW.ID`;
    private listClientsQuery = `SELECT * FROM USERS U
                                WHERE EXISTS (SELECT 1 FROM LOYALTY_PROGRAMS LP, LOYALTY L
                                            WHERE LP.LOYALTY_ID = L.ID AND LP.USER_ID = U.ID AND L.OWNER_ID = ?)
                                OR EXISTS (SELECT 1 FROM COUPONS C, OFFERS O 
                                            WHERE C.OFFER_ID = O.ID AND C.USER_ID = U.ID AND O.OWNER_ID = ?)`;
    private listCityClientsQuery = `SELECT * FROM USERS U
                                WHERE EXISTS (SELECT 1 FROM LOYALTY_PROGRAMS LP, LOYALTY L, OWNER OW
                                            WHERE LP.LOYALTY_ID = L.ID AND LP.USER_ID = U.ID AND L.OWNER_ID = OW.ID AND OW.ONDE_IR_CITY = ?)
                                OR EXISTS (SELECT 1 FROM COUPONS C, OFFERS O , OWNER OW
                                            WHERE C.OFFER_ID = O.ID AND C.USER_ID = U.ID AND O.OWNER_ID = OW.ID  AND OW.ONDE_IR_CITY = ?)`;
    private listAllClientsQuery = `SELECT * FROM USERS U`;

    constructor() {
        super();
    }

    public ListLoyaltyPrograms = (ownerId: number, cityId: number, res: Response, callback) => {
        this.connDb.Connect(
            connection => {
                let query = this.listLoyaltyProgramsQuery;
                let where = ownerId;

                if (ownerId > 0) {
                    query = query + ` AND L.OWNER_ID = ? GROUP BY LP.ID`;
                } else {
                    if (cityId > 0) {
                        query = query + ` AND O.ONDE_IR_CITY = ? GROUP BY LP.ID`;
                        where = cityId;
                    } else {
                        query = query + ` GROUP BY LP.ID`;
                    }
                }

                connection.query(query, where, (error, results) => {
                    if (!error && results && results.length > 0) {
                        connection.release();
                        return callback(res, error, results);
                    }

                    connection.release();
                    callback(res, error, results);
                });
            }, 
            error => {
                callback(res, error, null);
            }
        );
    }

    public ListCoupons = (ownerId: number, cityId: number, res: Response, callback) => {
        this.connDb.Connect(
            connection => {
                let query = this.listCouponsQuery;
                let where = ownerId;

                if (ownerId > 0) {
                    query = query + ` AND O.OWNER_ID = ?`;
                } else {
                    if (cityId > 0) {
                        query = query + ` AND OW.ONDE_IR_CITY = ?`;
                        where = cityId;
                    } 
                }

                connection.query(query, where, (error, results) => {
                    if (!error && results && results.length > 0) {
                        connection.release();
                        return callback(res, error, results);
                    }

                    connection.release();
                    callback(res, error, results);
                });
            }, 
            error => {
                callback(res, error, null);
            }
        );
    }

    public ListClients = (ownerId: number, cityId: number, res: Response, callback) => {
        this.connDb.Connect(
            connection => {
                let query = this.listAllClientsQuery;

                if (ownerId > 0) {
                    query = this.listClientsQuery;
                } else {
                    if (cityId > 0) {
                        query = this.listCityClientsQuery;
                        ownerId = cityId;
                    } 
                }

                connection.query(query, [ownerId, ownerId], (error, results) => {
                    if (!error && results && results.length > 0) {
                        connection.release();
                        return callback(res, error, results);
                    }

                    connection.release();
                    callback(res, error, results);
                });
            }, 
            error => {
                callback(res, error, null);
            }
        );
    }

    public GetLoyaltyNumber = (ownerId: number, res: Response, callback) => {
        this.connDb.Connect(
            connection => {
                let query = this.getLoyaltiesNumberQuery;
                if (ownerId > 0) {
                    query = query + " WHERE OWNER_ID = ?";
                }

                connection.query(query, ownerId, (error, results) => {
                    if (!error && results && results.length > 0) {
                        connection.release();
                        return callback(res, error, results[0].ITEMS);
                    }

                    connection.release();
                    callback(res, error, results);
                });
            }, 
            error => {
                callback(res, error, null);
            }
        );
    }

    public GetOffersNumber = (ownerId: number, res: Response, callback) => {
        this.connDb.Connect(
            connection => {

                let query = this.getOffersNumberQuery;
                if (ownerId > 0) {
                    query = query + " WHERE OWNER_ID = ?";
                }

                connection.query(query, ownerId, (error, results) => {
                    if (!error && results && results.length > 0) {
                        connection.release();
                        return callback(res, error, results[0].ITEMS);
                    }

                    connection.release();
                    callback(res, error, results);
                });
            }, 
            error => {
                callback(res, error, null);
            }
        );
    }

    public GetProgramsNumber = (ownerId: number, res: Response, callback) => {
        this.connDb.Connect(
            connection => {

                let query = this.getClientsNumberQuery;
                if (ownerId > 0) {
                    query = query + " AND L.OWNER_ID = ?";
                }

                connection.query(query, ownerId, (error, results) => {
                    connection.release();
                    if (!error && results && results.length > 0) {
                        return callback(res, error, results[0].ITEMS);
                    }

                    callback(res, error, results);
                });
            }, 
            error => {
                callback(res, error, null);
            }
        );
    }

    public GetCouponsNumber = (ownerId: number, res: Response, callback) => {
        this.connDb.Connect(
            connection => {

                let query = this.getCouponsNumberQuery;
                if (ownerId > 0) {
                    query = query + " AND O.OWNER_ID = ?";
                }

                connection.query(query, ownerId, (error, results) => {
                    connection.release();
                    if (!error && results && results.length > 0) {
                        return callback(res, error, results[0].ITEMS);
                    }

                    callback(res, error, results);
                });
            }, 
            error => {
                callback(res, error, null);
            }
        );
    }
}