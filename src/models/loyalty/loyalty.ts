import { LoyaltyValidity } from './loyaltyValidity';
import { BaseEntity } from "../base.model";
import { IToMysqlDbEntity } from "../iToMysqlDbEntity";
import { LoyaltyUsageType } from './loyaltyUsageType';

export enum ELoyaltyStatus {
  Pendent = 1,
  Active = 2,
  Cancelled = 3,
  Finish = 4
}

export class LoyaltyEntity extends BaseEntity implements IToMysqlDbEntity {

  public id: number;
  public name: string;
  public startDate: Date;
  public endDate: Date;
  public type: number;
  public ownerId: number;
  public dayLimit: number;
  public usageLimit: number;
  public status: ELoyaltyStatus;
  public validity: Array<LoyaltyValidity>;
  public usageType: LoyaltyUsageType;

  public static getInstance(): LoyaltyEntity {
    const instance = new LoyaltyEntity();
    instance.status = ELoyaltyStatus.Pendent;
    instance.validity = new Array<LoyaltyValidity>();
    instance.type = 1;
    instance.usageType = LoyaltyUsageType.getInstance();

    return instance;
  }

  toMysqlDbEntity(isNew: boolean) {
    if (isNew) {
        return {
            NAME: this.name,
            START_DATE: this.startDate,
            END_DATE: this.endDate,
            TYPE: this.type,
            OWNER_ID:  this.ownerId,
            DAY_LIMIT: this.dayLimit,
            USAGE_LIMIT: this.usageLimit,
            STATUS: this.status
        }
    } else {
        return {
            NAME: this.name,
            START_DATE: this.startDate,
            END_DATE: this.endDate,
            TYPE: this.type,
            DAY_LIMIT: this.dayLimit,
            USAGE_LIMIT: this.usageLimit
        }
    }
    
  }
  fromMySqlDbEntity(dbentity: any) {
    this.id = dbentity.ID,
    this.name = dbentity.NAME,
    this.startDate = dbentity.START_DATE,
    this.endDate = dbentity.END_DATE,
    this.type = dbentity.TYPE,
    this.ownerId = dbentity.OWNER_ID,
    this.dayLimit = dbentity.DAY_LIMIT,
    this.usageLimit = dbentity.USAGE_LIMIT,
    this.status = dbentity.STATUS
  }
}
