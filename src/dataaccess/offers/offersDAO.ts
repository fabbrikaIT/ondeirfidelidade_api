import { EOfferStatus } from './../../models/offers/offers.model';
import { Response } from 'express';

import { BaseDAO } from "../baseDAO";
import { OffersEntity } from '../../models/offers/offers.model';

export class OffersDAO extends BaseDAO {
    // Query de acesso aos dados
    private insertQuery: string = "INSERT INTO OFFERS SET ?";
    private listQuery: string = "SELECT * FROM OFFERS";
    private listByOwnerQuery: string = "SELECT * FROM OFFERS WHERE OWNER_ID = ?";
    private listByOwnerStatusQuery: string = "SELECT * FROM OFFERS WHERE STATUS = ? AND OWNER_ID = ?";
    private getOffersQuery: string = "SELECT O.* FROM OFFERS O WHERE O.ID = ?";
    private deleteOffersQuery: string = "DELETE FROM OFFERS WHERE ID = ?";
    private updateQuery: string = "UPDATE OFFERS SET ? WHERE ID= ?"
    private updateUsageQuery: string = "UPDATE OFFERS_USAGE_TYPE SET ? WHERE ID = ?";    
    private changeStatusQuery: string = "UPDATE OFFERS SET STATUS = ? WHERE ID = ?";

    constructor() {
        super();
    }

    /**
     * List all offer of owner in database
    */
    public ListOffers = (ownerId: number, res: Response, callback) => {
        this.connDb.Connect(
            connection => {

                const query = connection.query(this.listByOwnerQuery, ownerId, (error, results) => {
                    if (!error) {
                        let list: Array<OffersEntity>;
                        list = results.map(item => {
                            let ownerItem = new OffersEntity();
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
     * List all offer of owner filtered by status in database
    */
    public ListOffersStatus = (ownerId: number, status: number, res: Response, callback) => {
        this.connDb.Connect(
            connection => {

                const query = connection.query(this.listByOwnerStatusQuery, [status, ownerId], (error, results) => {
                    if (!error) {
                        let list: Array<OffersEntity>;
                        list = results.map(item => {
                            let ownerItem = new OffersEntity();
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
     * Return an offer entity from database
    */
    public GetOffer(id: number, res: Response,  callback) {
        this.connDb.Connect(
            connection => {

                const query = connection.query(this.getOffersQuery, id, (error, results) => {
                    if (!error && results.length > 0) {
                       
                        let ownerItem = new OffersEntity();
                        ownerItem.fromMySqlDbEntity(results[0]);
                        
                        connection.release();
                        return callback(res, error, ownerItem);
                        
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
     * Create a new offer in database
     */
    public Create = (offer: OffersEntity, callback)  => { 
        this.connDb.Connect(
            connection => { 
                const dbEntity = offer.toMysqlDbEntity(true);

                const query = connection.query(this.insertQuery, dbEntity, (error, results) => { 
                    connection.release();
                    return callback(error, results);
                });
            },
            error => {
                callback(error, null);
            }
        );
    }

    /**
     * Update an offer in database
     */
    public Update = (offer: OffersEntity, callback)  => { 
        this.connDb.Connect(
            connection => { 
                const dbEntity = offer.toMysqlDbEntity(true);

                const query = connection.query(this.updateQuery, [dbEntity, offer.id], (error, results) => { 
                    connection.release();
                    return callback(error, results);
                });
            },
            error => {
                callback(error, null);
            }
        );
    }

    /**
     * Remove an offer entity from database
    */
    public DeleteOffer = (id: number, callback, res?: Response) => {
        this.connDb.Connect(
            connection => {

                const query = connection.query(this.deleteOffersQuery, id, (error, results) => {
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
     * Update the status of an offer
     */
    public UpdateOfferStatus = (loyaltyId: number, status: EOfferStatus, callback) => {
        this.connDb.Connect(
            connection => {
                const query = connection.query(this.changeStatusQuery, [status, loyaltyId], (error, results) => {
                    connection.release();
                    callback(error, results);
                });
            },
            error => {
                callback(error, null);
            }
        );
    }
 }