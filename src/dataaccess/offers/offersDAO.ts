import { CouponEntity } from './../../models/offers/coupon.model';
import { EOfferStatus } from './../../models/offers/offers.model';
import { Response } from 'express';

import { BaseDAO } from "../baseDAO";
import { OffersEntity } from '../../models/offers/offers.model';
import { OwnerEntity } from '../../models/owner/ownerEntity';
import { DbConnection } from '../../config/dbConnection';

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
    private searchOffersByCityQuery: string = `SELECT O.* FROM OFFERS O
                                                WHERE O.STATUS = 1
                                                AND O.STARTDATE <= SYSDATE()
                                                AND (O.ENDDATE IS NULL OR O.ENDDATE >= SYSDATE())
                                                AND EXISTS (SELECT 1 FROM OWNER OW
                                                                        WHERE OW.ID = O.OWNER_ID
                                                                            AND OW.ONDE_IR_CITY = ?)`;
    private getUserOfferCoupomQuery: string = `SELECT C.ID, O.ID AS OFFER_ID, C.USER_ID, C.COUPON_LINK, C.IS_VALID, O.TITLE, O.STARTDATE, 
                                                      O.ENDDATE, O.TYPE, O.DISCOUNT, O.REWARD, O.DESCRIPTION, O.RESTRICTIONS, O.OWNER_ID
                                                FROM COUPONS C, OFFERS O
                                            WHERE C.OFFER_ID = O.ID
                                                AND C.OFFER_ID = ?
                                                AND EXISTS (SELECT 1 FROM USERS U
                                                            WHERE U.ID = C.USER_ID
                                                                AND U.ONDE_IR_ID = ?)`;
    private createCouponQuery: string = `INSERT INTO COUPONS SET ?`;
    private updateCouponQuery: string = `UPDATE COUPONS SET ? WHERE ID = ?`;
    private listUserCouponsQuery: string = `SELECT C.ID AS COUPON_ID, OF.ID, OF.TITLE, OF.STARTDATE, OF.ENDDATE, OF.TYPE, OF.DISCOUNT, OF.REWARD,
                                                    OF.DESCRIPTION, OF.RESTRICTIONS, OF.QR_HASH
                                                FROM COUPONS C, OFFERS OF
                                                WHERE C.OFFER_ID = OF.ID
                                                AND C.IS_VALID = 0
                                                AND EXISTS (SELECT 1 FROM USERS U
                                                            WHERE U.ID = C.USER_ID
                                                            AND U.ONDE_IR_ID = ?)`;
    private getUserOfferHashQuery: string = `SELECT O.ID, O.TITLE, O.STARTDATE, O.ENDDATE, O.TYPE, O.DISCOUNT, O.REWARD, 
                                                    O.DESCRIPTION, O.RESTRICTIONS, O.OWNER_ID, OW.TITLE, OW.REGISTER_DATE, OW.OWNER_NAME,
                                                    OW.EMAIL, OW.CELLPHONE, OW.LOGO
                                                FROM COUPONS C, OFFERS O, OWNER OW
                                                WHERE C.OFFER_ID = O.ID
                                                AND O.OWNER_ID = OW.ID
                                                AND O.QR_HASH = ?
                                                AND EXISTS (SELECT 1 FROM USERS U
                                                        WHERE U.ID = C.USER_ID
                                                            AND U.ONDE_IR_ID = ?)`;

    constructor() {
        super();
    }

    /**
     * List all offer of owner in database
    */
    public ListOffers = (ownerId: number, res: Response, callback) => {
        DbConnection.connectionPool.query(this.listByOwnerQuery, ownerId, (error, results) => {
            if (!error) {
                let list: Array<OffersEntity>;
                list = results.map(item => {
                    let ownerItem = new OffersEntity();
                    ownerItem.fromMySqlDbEntity(item);

                    return ownerItem;
                });

                return callback(res, error, list);
            }

            return callback(res, error, results);
        });
    }

    /**
     * List all offer of owner filtered by status in database
    */
    public ListOffersStatus = (ownerId: number, status: number, res: Response, callback) => {
        
        DbConnection.connectionPool.query(this.listByOwnerStatusQuery, [status, ownerId], (error, results) => {
            if (!error) {
                let list: Array<OffersEntity>;
                list = results.map(item => {
                    let ownerItem = new OffersEntity();
                    ownerItem.fromMySqlDbEntity(item);

                    return ownerItem;
                });

                return callback(res, error, list);
            }

            return callback(res, error, results);
        });

            
    }

    /**
     * Return an offer entity from database
    */
    public GetOffer(id: number, res: Response,  callback) {
        
        DbConnection.connectionPool.query(this.getOffersQuery, id, (error, results) => {
            if (!error && results.length > 0) {
                
                let ownerItem = new OffersEntity();
                ownerItem.fromMySqlDbEntity(results[0]);
                
                return callback(res, error, ownerItem);
                
            } else {
                return callback(res, error, null);
            }
        });
            
    }

    /**
     * Create a new offer in database
     */
    public Create = (offer: OffersEntity, callback)  => { 
        
        const dbEntity = offer.toMysqlDbEntity(true);

        DbConnection.connectionPool.query(this.insertQuery, dbEntity, (error, results) => { 
            return callback(error, results);
        });
            
    }

    /**
     * Update an offer in database
     */
    public Update = (offer: OffersEntity, callback)  => { 
        
        const dbEntity = offer.toMysqlDbEntity(true);

        DbConnection.connectionPool.query(this.updateQuery, [dbEntity, offer.id], (error, results) => { 
            return callback(error, results);
        });
            
    }

    /**
     * Remove an offer entity from database
    */
    public DeleteOffer = (id: number, callback, res?: Response) => {
        
        DbConnection.connectionPool.query(this.deleteOffersQuery, id, (error, results) => {
            if (!error) {
                if (callback)                        
                    return callback(error, results);
            } else {
                if (callback)
                    return callback(error, null);
            }
        });

            
    }

    /**
     * Update the status of an offer
     */
    public UpdateOfferStatus = (loyaltyId: number, status: EOfferStatus, callback) => {
        
        DbConnection.connectionPool.query(this.changeStatusQuery, [status, loyaltyId], (error, results) => {
            callback(error, results);
        });
            
    }

    public SearchOffersByCity = (cityId: number, res: Response, callback) => {
        
        DbConnection.connectionPool.query(this.searchOffersByCityQuery, cityId, (error, results) => {
            if (!error && results.length > 0) { 
                let list: Array<OffersEntity>;

                list = results.map(item => {
                    let offerItem = new OffersEntity();
                    offerItem.fromMySqlDbEntity(item);

                    return offerItem;
                });

                return callback(res, error, list);
            } else {
                return callback(res, error, null);
            }
        });
            
    }

    /** Data for User Coupons and Discounts */
    public GetUserCouponOffer = (userId: number, offerId: number, callback) => {
        
        DbConnection.connectionPool.query(this.getUserOfferCoupomQuery, [offerId, userId], (error, results) => {
            if (!error) { 
                if (results.length === 0) {
                    return callback(null, null);
                } else {
                    let list: Array<CouponEntity>;

                    list = results.map(item => {
                        let couponItem = new CouponEntity();
                        couponItem.fromMySqlDbEntity(item);
                        couponItem.offer = OffersEntity.getInstance();
                        couponItem.offer.fromMySqlDbEntity(item);

                        return couponItem;
                    });

                    return callback(error, list);
                }
            } else {
                return callback(error, null);
            }
        });
            
    }

    public GetUserCouponOfferHash = (qrHash: string, userId: number, res: Response, callback) => {
        
        DbConnection.connectionPool.query(this.getUserOfferHashQuery, [qrHash, userId], (error, results) => {
            if (!error) { 
                if (results.length === 0) {
                    return callback(null, null);
                } else {
                    let offerItem = OffersEntity.getInstance();
                    offerItem.fromMySqlDbEntity(results[0]);
                    offerItem.owner = OwnerEntity.getInstance();
                    offerItem.owner.fromMySqlDbEntity(results[0]);
                    
                    return callback(res, error, offerItem);
                }
            } else {
                return callback(error, null);
            }
        });
            
    }


    public CreateCoupon = (coupon: CouponEntity, callback) => {
        
        const dbEntity = coupon.toMysqlDbEntity(true);

        DbConnection.connectionPool.query(this.createCouponQuery, dbEntity, (error, results) => {
            return callback(error, results);
        });
            
    }

    public ListUserCoupons = (userId: number, res: Response, callback) => {
        
        DbConnection.connectionPool.query(this.listUserCouponsQuery, userId, (error, results) => {
            if (!error && results.length > 0) { 
                let list: Array<OffersEntity>;

                list = results.map(item => {
                    let offerItem = new OffersEntity();
                    offerItem.fromMySqlDbEntity(item);

                    return offerItem;
                });

                return callback(res, error, list);
            } else {
                return callback(res, error, null);
            }
        });
           
    }

    public UseCoupon = (coupon: CouponEntity, res: Response, callback) => {
        const dbEntity = coupon.toMysqlDbEntity(false);

        DbConnection.connectionPool.query(this.updateCouponQuery, [dbEntity, coupon.id], (error, results) => {
            return callback(res, error, results);
        });
           
    }
 }