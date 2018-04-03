import { BaseDAO } from '../baseDAO';
import { UserEntity } from '../../models/users/userEntity';
import * as http from 'https';

export class OndeIrDAO extends BaseDAO {

    constructor() {
        super();
    }

    public GetUser = (userId:number, callback) => {
        const serviceUrl =  `https://appondeir.com.br/sistema/rest/get_user.php?user_id=${userId}`;

        http.get(serviceUrl, 
            res => {
                if (res.statusCode === 200) {
                    let data = '';
 
                    // A chunk of data has been recieved.
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    
                    // The whole response has been received. Print out the result.
                    res.on('end', () => {
                        const serviceResult = JSON.parse(data);

                        if (serviceResult && serviceResult.user_info) {
                            // Usuário integrado do App
                            const user = UserEntity.GetInstance();
                            user.Name = serviceResult.user_info.full_name;
                            user.OndeIrCity = 21; // Curitiba
                            user.Email = serviceResult.user_info.email;
                            user.OndeIrId = serviceResult.user_info.user_id;

                            callback(null, user);
                        } else {
                            callback(null, null)
                        }
                    });

                    
                } else {
                    callback(res.statusMessage, null);
                }
            }
        );

        
    }
}