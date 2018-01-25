import { ServiceResult } from './../../models/serviceResult.model';
import { NetworkLog } from './network-log.model';
import { ApplicationLog, ELogType } from './app-log.model';
import { DbConnection } from '../../config/dbConnection';

class LogProvider {
    public SaveNetworkLog(log: NetworkLog) {
        const connDb = new DbConnection(process.env.DB_FIDELIDADE);

        connDb.Connect(
            connection => {
                const query: string = 'INSERT INTO NETWORK_LOGS SET ?';

                connection.query(query, log, (error, results) => {
                    connection.release();
                });
            }, 
            error => {
                console.log(error);
            }
        );
    }

    public SaveApplicationLog(log: ApplicationLog) {
        const connDb = new DbConnection(process.env.DB_FIDELIDADE);

        connDb.Connect(
            connection => {
                const query: string = 'INSERT INTO APPLICATION_LOG SET ?';

                connection.query(query, log, (error, results) => {
                    connection.release();
                });
            }, 
            error => {
                console.log(error);
            }
        );
    }

    public SetErrorLog(errorResult: ServiceResult) {
        const log: ApplicationLog = new ApplicationLog();
        log.date = new Date();
        log.type = ELogType.Error;
        log.source = errorResult.ErrorCode;
        log.message = errorResult.ErrorMessage;

        this.SaveApplicationLog(log);
    }

    public SetFatalLog(errorResult: ServiceResult) {
        const log: ApplicationLog = new ApplicationLog();
        log.date = new Date();
        log.type = ELogType.Fatal;
        log.source = errorResult.ErrorCode;
        log.message = errorResult.ErrorMessage;

        this.SaveApplicationLog(log);
    }
}

export default new LogProvider();