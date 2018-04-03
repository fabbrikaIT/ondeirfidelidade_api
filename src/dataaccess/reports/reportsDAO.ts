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

    constructor() {
        super();
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

    public GetOffersNumber = (ownerId: number, res: Response, callback) => {
        this.connDb.Connect(
            connection => {

                let query = this.getOffersNumberQuery;
                if (ownerId > 0) {
                    query = query + " WHERE OWNER_ID = ?";
                }

                connection.query(query, ownerId, (error, results) => {
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

    public GetProgramsNumber = (ownerId: number, res: Response, callback) => {
        this.connDb.Connect(
            connection => {

                let query = this.getClientsNumberQuery;
                if (ownerId > 0) {
                    query = query + " AND L.OWNER_ID = ?";
                }

                connection.query(query, ownerId, (error, results) => {
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