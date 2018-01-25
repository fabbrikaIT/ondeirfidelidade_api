import { NetworkLog } from './../log/network-log.model';
import { Request, Response } from "express";

import { GenericErrorsProvider, EGenericErrors } from "../../config/errors/genericErrors";
import logProvider from '../log/log-provider';

class TrafficControl {
    public CheckPostBody(req: Request, res: Response, next: any) {
        if (req.method === "POST") {

            if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
                res.json(GenericErrorsProvider.GetError(EGenericErrors.InvalidRequestBody));
                res.end();
            } else {
                next();
            }
        } else {
            next();
        }
    }
    
    public LogRequest(req: Request, res: Response, next: any) {
        if (process.env.NETWORK_LOG !== undefined && process.env.NETWORK_LOG === "Y"){
            const log: NetworkLog = new NetworkLog(req);

            logProvider.SaveNetworkLog(log);
            
            next();
        }
    }
}

export default new TrafficControl();