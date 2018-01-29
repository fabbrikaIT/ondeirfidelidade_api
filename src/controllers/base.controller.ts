import { Response } from "express";

import { ServiceResult } from '../models/serviceResult.model';

export abstract class BaseController {
  protected processDefaultResult(res: Response, error, dataResult) {
    if (error){
        return res.json(ServiceResult.HandlerError(error));
    }

    const serviceResult: ServiceResult = new ServiceResult();
    serviceResult.Executed = true;
    serviceResult.Result = dataResult;

    return res.json(serviceResult);
  }
}
