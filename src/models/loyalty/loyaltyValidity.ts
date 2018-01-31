import { BaseEntity } from '../base.model';
import { IToMysqlDbEntity } from '../iToMysqlDbEntity';

export enum EWeekDay {
    Monday = 1,
    Tusday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6,
    Sunday = 7
  }

export class LoyaltyValidity extends BaseEntity implements IToMysqlDbEntity {
    
    public id: number;
    public loyaltyId: number;
    public weekday: EWeekDay;
    public startTime: Date;
    public endTime: Date;

    public static getInstance(): LoyaltyValidity {
        const instance = new LoyaltyValidity();
    
        return instance;
      }

    toMysqlDbEntity(isNew: boolean) {
        if (isNew) {
            return {
                ID: this.id,
                LOYALTY_ID:  this.loyaltyId,
                WEEKDAY: this.weekday,
                STARTTIME: this.startTime,
                ENDTIME: this.endTime
            }
        } else {
            return {
                WEEKDAY: this.weekday,
                STARTTIME: this.startTime,
                ENDTIME: this.endTime
            }
        }
    }
    fromMySqlDbEntity(dbentity: any) {
        this.id = dbentity.ID;
        this.loyaltyId = dbentity.LOYALTY_ID;
        this.weekday = dbentity.WEEKDAY;
        this.startTime = dbentity.STARTTIME;
        this.endTime = dbentity.ENDTIME;
    }
}