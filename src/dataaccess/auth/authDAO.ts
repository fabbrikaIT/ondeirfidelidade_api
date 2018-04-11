import { DbConnection } from '../../config/dbConnection';
import { BaseDAO } from '../baseDAO';
import { DataAccessResult } from '../dataAccess.result';

export class AuthDAO extends BaseDAO {
    
    /**
     * Login
     */
    public Login = (email: string, password: string, callback)  => {
        this.connDb.Connect(
            connection => {
                const query: string = 'SELECT * FROM OWNER WHERE EMAIL = ? AND PASSWORD = ?';

                connection.query(query, [email, password], (error, results) => {
                    connection.release();
                    callback(results, error);
                });
            }, 
            error => {
                callback(null, error);
            }
        );
    }
}