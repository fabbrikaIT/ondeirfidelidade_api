import { BaseEntity } from '../base.model';
import { IToMysqlDbEntity } from '../iToMysqlDbEntity';

export class OwnerEntity extends BaseEntity implements IToMysqlDbEntity {
    
    public id: number;
    public ondeIrId: number;
    public title: string;
    public registerDate: Date;
    public ownerName: string;
    public email: string;
    public cellphone: string;
    public logo: string;
    public city: number;
    public password: string;

    public static getInstance(): OwnerEntity {
        const instance = new OwnerEntity();

        instance.registerDate = new Date();

        return instance;
    }

    /** Mapeamento da entidade para o Banco */
    public toMysqlDbEntity = (): any => {
        return {
            ONDE_IR_ID: this.ondeIrId,
            TITLE: this.title,
            REGISTER_DATE: this.registerDate,
            OWNER_NAME: this.ownerName,
            EMAIL: this.email,
            CELLPHONE: this.cellphone,
            LOGO: this.logo,
            ONDE_IR_CITY: this.city,
            PASSWORD: this.password
        }
    }

    public fromMySqlDbEntity = (dbEntity: any) => {
        this.id = dbEntity.ID,
        this.ondeIrId = dbEntity.ONDE_IR_ID
        this.title = dbEntity.TITLE,
        this.registerDate = dbEntity.REGISTER_DATE,
        this.ownerName = dbEntity.OWNER_NAME,
        this.email = dbEntity.EMAIL,
        this.cellphone = dbEntity.CELLPHONE,
        this.logo = dbEntity.LOGO,
        this.city = dbEntity.ONDE_IR_CITY

    }
}