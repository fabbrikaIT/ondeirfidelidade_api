import { LoyaltyPointsEntity } from './loyaltyPoints';
import { BaseEntity } from '../base.model';
import { IToMysqlDbEntity } from '../iToMysqlDbEntity';

export class LoyaltyProgramEntity extends BaseEntity implements IToMysqlDbEntity {
    
    public Id: number = 0;
    public UserId: number = 0;
    public LoyaltyId: number = 0;
    public RegisterDate: Date = new Date();
    public Discharges: number = 0;
    public CardLink: string = "";
    public Points: Array<LoyaltyPointsEntity>;

    public static GetInstance(): LoyaltyProgramEntity {
        const instance: LoyaltyProgramEntity = new LoyaltyProgramEntity();
        instance.Points = new Array<LoyaltyPointsEntity>();
        instance.RegisterDate = new Date();

        return instance;
    }

    toMysqlDbEntity(isNew: boolean) {
        if (isNew) {
            return {
                USER_ID: this.UserId,
                LOYALTY_ID: this.LoyaltyId,
                REGISTER_DATE: this.RegisterDate,
                DISCHARGE: 0,
                CARD_LINK: this.CardLink
            }
        } else {
            return {
                DISCHARGE: this.Discharges,
                CARD_LINK: this.CardLink
            }
        }
    }
    fromMySqlDbEntity(dbentity: any) {
        this.Id = dbentity.ID;
        this.CardLink = dbentity.CARD_LINK;
        this.Discharges = dbentity.DISCHARGE;
        this.RegisterDate = dbentity.REGISTER_DATE;
        this.LoyaltyId = dbentity.LOYALTY_ID;
        this.UserId = dbentity.USER_ID;
    }
}