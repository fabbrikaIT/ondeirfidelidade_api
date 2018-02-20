import { BaseEntity } from '../base.model';
import { IToMysqlDbEntity } from '../iToMysqlDbEntity';

export class LoyaltyPointsEntity extends BaseEntity implements IToMysqlDbEntity {    
    public Id: number = 0;
    public ProgramId:number = 0;
    public PointDate: Date = new Date();

    public static GetInstance(): LoyaltyPointsEntity {
        const instance: LoyaltyPointsEntity = new LoyaltyPointsEntity();
        instance.PointDate = new Date();

        return instance;
    }

    toMysqlDbEntity(isNew: boolean) {
        return {
            PROGRAM_ID: this.ProgramId,
            POINTS_DATE: this.PointDate
        }
    }
    fromMySqlDbEntity(dbentity: any) {
        this.Id = dbentity.ID;
        this.PointDate = dbentity.POINTS_DATE;
        this.ProgramId = dbentity.PROGRAM_ID;
    }
}