import { ServiceResult } from './../../models/serviceResult.model';
import { Request, Response } from "express";

import { GenericErrorsProvider, EGenericErrors } from "../../config/errors/genericErrors";
import logProvider from '../log/log-provider';
import { NetworkLog } from './../log/network-log.model';

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
        }

        next();
    }

    /**
     * Set the correct status code for response
     */
    public SetStatusCode(req, res, next) {
        var send = res.send;

        res.send = function(data) {
            let body;
            
            try {
                body = JSON.parse(data);    
            } catch (error) {
                // send.call(this, data);
                // next();
                // return;
            }

            if (body && body.ErrorCode !== undefined && body.ErrorCode !== "") {
                switch (body.ErrorCode) {
                    case "ERR999":
                        res.status(500);
                        break;
                
                    default:
                        res.status(422);
                        break;
                }
            }

            send.call(this, data);
        }

        next();
    }
}

export default new TrafficControl();