import { BaseEntity } from '../base.model';

export class AdminEntity extends BaseEntity {
    public name: string = "";
    public email: string = "";
    public city: string = "";
    public password: string = "";    
}