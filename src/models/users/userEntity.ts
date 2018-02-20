import { BaseEntity } from '../base.model';
import { IToMysqlDbEntity } from '../iToMysqlDbEntity';

export class UserEntity extends BaseEntity implements IToMysqlDbEntity {    
    public Id: number = 0;
    public OndeIrId: number = 0;
    public Name: string = "";
    public Email: string = "";
    public OndeIrCity: number = 0;

    public static GetInstance(): UserEntity {
        const instance: UserEntity = new UserEntity();

        return instance;
    }

    toMysqlDbEntity(isNew: boolean) {
        if (isNew){
            return {
                ONDE_IR_ID: this.OndeIrId,
                NAME: this.Name,
                E_MAIL: this.Email,
                ONDE_IR_CITY: this.OndeIrCity
            }
        } else {
            return {
                NAME: this.Name,
                E_MAIL: this.Email,
                ONDE_IR_CITY: this.OndeIrCity
            }
        }
    }
    fromMySqlDbEntity(dbentity: any) {
        this.Id = dbentity.ID;
        this.Name = dbentity.NAME;
        this.Email = dbentity.E_MAIL;
        this.OndeIrId = dbentity.ONDE_IR_ID;
        this.OndeIrCity = dbentity.ONDE_IR_CITY;
    }
}