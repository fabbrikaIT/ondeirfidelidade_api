import { BaseEntity } from '../base.model';

export class UserEntity extends BaseEntity {
    public Id: number;
    public OndeIrId: number;
    public Name: string;
    public Email: string;
    public City: string;
    public Password: string;
}
