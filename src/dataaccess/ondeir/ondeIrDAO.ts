import { BaseDAO } from '../baseDAO';
import { UserEntity } from '../../models/users/userEntity';

export class OndeIrDAO extends BaseDAO {

    constructor() {
        super();
    }

    public GetUser = (userId:number, callback) => {
        // Usuário Fake para testes
        const user = UserEntity.GetInstance();
        user.Name = "Usuário Teste";
        user.OndeIrCity = 21; // Curitiba
        user.Email = "teste@ondeir.com.br";
        user.OndeIrId = 1;
        
        callback(null, user);
    }
}