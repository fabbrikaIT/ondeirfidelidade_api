import { BaseEntity } from "../base.model";

export class AuthUserEntity extends BaseEntity {
    public user: string;
    public password: string;
}