import { BaseEntity } from '../base.model';

export class AuthEntity extends BaseEntity {
    public loginAccept: boolean;
    public userName: string;
    public authenticationToken: string;
}