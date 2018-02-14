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
            return;
        }
    }

    public GetOffersNumber = (req: Request, res: Response) => {
        const ownerId = this.GetOwnerId(req, res);

        if (ownerId >= 0) {
            return this.dataAccess.GetOffersNumber(ownerId, res, this.processDefaultResult);
        } else {
            return;
        }
    }

    public GetClientsNumber = (req: Request, res: Response) => {

    }

    public GetCouponsNumber = (req: Request, res: Response) => {

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