import { BaseEntity } from "../base.model";
import { IToMysqlDbEntity } from "../iToMysqlDbEntity";

export enum EOfferStatus {
    Active = 1,
    Inative = 2
}

export class OffersEntity extends BaseEntity implements IToMysqlDbEntity { 
    
    public id: number;
    public ownerId: number;
    public title: string;
    public description: string;
    public startDate: Date;
    public endDate: Date;
    public type: number;
    public discount: number;
    public reward: string;
    public qrHash: string;
    public status: EOfferStatus;
    public restriction: string;

    public static getInstance(): OffersEntity { 
        const instance = new OffersEntity();
        instance.status = EOfferStatus.Active;
        instance.discount = 0;
        instance.reward = "";
        instance.description = "";
        instance.restriction = "";

        return instance;
    }

    toMysqlDbEntity(isNew: boolean) {
        if (isNew) {
            return {
                TITLE: this.title,
                STARTDATE: this.startDate,
                ENDDATE: this.endDate,
                TYPE: this.type,
                OWNER_ID:  this.ownerId,
                DISCOUNT: this.discount,
                REWARD: this.reward,
                STATUS: this.status,
                QR_HASH: this.qrHash,
                DESCRIPTION: this.description,
                RESTRICTIONS: this.restriction
            }
        } else {
            return {
                NAME: this.title,
                STARTDATE: this.startDate,
                ENDDATE: this.endDate,
                TYPE: this.type,
                DISCOUNT: this.discount,
                REWARD: this.reward,
                DESCRIPTION: this.description,
                RESTRICTIONS: this.restriction
            }
        }
    }
    fromMySqlDbEntity(dbentity: any) {
        this.id = dbentity.ID;
        this.title = dbentity.TITLE;
        this.startDate = dbentity.STARTDATE;
        this.endDate = dbentity.ENDDATE;
        this.type = dbentity.TYPE;
        this.ownerId = dbentity.OWNER_ID;
        this.discount = dbentity.DISCOUNT;
        this.reward = dbentity.REWARD;
        this.status = dbentity.STATUS;
        this.qrHash = dbentity.QR_HASH;
        this.description = dbentity.DESCRIPTION;
        this.restriction = dbentity.RESTRICTIONS;
    }
}