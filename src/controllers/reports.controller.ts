import { Request, Response } from "express";

import { ServiceResult } from '../models/serviceResult.model';
import { BaseController } from './base.controller';
import { EGenericErrors, GenericErrorsProvider } from '../config/errors/genericErrors';
import { ReportsDAO } from "../dataaccess/reports/reportsDAO";

export class ReportsController extends BaseController {
    private dataAccess: ReportsDAO = new ReportsDAO();

    constructor() {
        super();
      }

    public GetLoyaltiesNumber = (req: Request, res: Response) => {
        const ownerId = this.GetOwnerId(req, res);

        if (ownerId >= 0) {
            return this.dataAccess.GetLoyaltyNumber(ownerId, res, this.processDefaultResult);
        } else {
            return res.json(ServiceResult.HandlerError("Owner Not Found"));
        }
    }

    public GetOffersNumber = (req: Request, res: Response) => {
        const ownerId = this.GetOwnerId(req, res);

        if (ownerId >= 0) {
            return this.dataAccess.GetOffersNumber(ownerId, res, this.processDefaultResult);
        } else {
            return res.json(ServiceResult.HandlerError("Owner Not Found"));
        }
    }

    public GetClientsNumber = (req: Request, res: Response) => {
        const ownerId = this.GetOwnerId(req, res);

        if (ownerId >= 0) {
            return this.dataAccess.GetProgramsNumber(ownerId, res, this.processDefaultResult);
        } else {
            return res.json(ServiceResult.HandlerError("Owner Not Found"));
        }
    }

    public GetCouponsNumber = (req: Request, res: Response) => {
        const ownerId = this.GetOwnerId(req, res);

        if (ownerId >= 0) {
            return this.dataAccess.GetCouponsNumber(ownerId, res, this.processDefaultResult);
        } else {
            return res.json(ServiceResult.HandlerError("Owner Not Found"));
        }
    }

    // Metodos de apoio
    private GetOwnerId = (req: Request, res: Response): number => {
        req.checkParams("ownerId").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            res.json(GenericErrorsProvider.GetError(EGenericErrors.InvalidArguments));
            return -1;
        }

        return req.params["ownerId"];
    }
}