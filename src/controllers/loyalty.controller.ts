import { Request, Response } from 'express';

import { LoyaltyDAO } from './../dataaccess/loyalty/loyaltyDAO';
import { BaseController } from "./base.controller";
import {ServiceResult} from '../models/serviceResult.model';
import { LoyaltyErrorsProvider, ELoyaltyErrors } from '../config/errors/loyaltyErrors';
import { LoyaltyEntity } from '../models/loyalty/loyalty';
import { LoyaltyUsageType } from './../models/loyalty/loyaltyUsageType';

export class LoyaltyController extends BaseController {
    private dataAccess = new LoyaltyDAO();

    constructor() {
        super();
    }

    /**
     *  ListLoyalty
     */
    public ListLoyalty = (req: Request, res: Response) => {
        req.checkParams("owner").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            return res.json(LoyaltyErrorsProvider.GetErrorDetails(ELoyaltyErrors.InvalidOwnerId, errors));
        }

        const ownerId = req.params["owner"];

        this.dataAccess.ListLoyalty(ownerId, res, this.processDefaultResult);
    }   

    /**
     * GetLoyalty
     */
    public GetLoyalty = (req: Request, res: Response) => {
        req.checkParams("id").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            return res.json(LoyaltyErrorsProvider.GetErrorDetails(ELoyaltyErrors.InvalidOwnerId, errors));
        }

        const id = req.params["id"];

        this.dataAccess.GetLoyalty(id, res, this.processDefaultResult);
    }

    /**
     * CreateLoyalty
     */
    public CreateLoyalty = (req: Request, res: Response) => {
        // validações do corpo recebido
        req.checkBody({
            name: {
                notEmpty: true,
                errorMessage: "Nome do programa de fidelidade é Obrigatório"
            },
            startDate: {
                notEmpty: true,
                errorMessage: "Data de inicio do programa de fidelidade é obrigatória"
            },
            type: {
                isNumeric: true,
                // custom: (value => {
                //     return value === 1 || value === 2;
                // }),
                errorMessage: "Tipo de programa inválido"
            },
            ownerId: {
                isNumeric: true,
                errorMessage: "Código de cliente inválido"
            },
            usageType: {
                exists: true,
                errorMessage: "Dados de recompensa de fidelidade inválidos"
            }
        });

        const errors = req.validationErrors();
        if (errors) {
            return res.json(LoyaltyErrorsProvider.GetErrorDetails(ELoyaltyErrors.InvalidLoyaltyRequiredParams, errors));
        }

        let loyalty: LoyaltyEntity = LoyaltyEntity.getInstance();
        loyalty.Map(req.body);
        loyalty.usageType = LoyaltyUsageType.getInstance();
        loyalty.usageType.Map(req.body.usageType);

        if (loyalty.type !== 1 && loyalty.type !== 2) {
            return res.json(LoyaltyErrorsProvider.GetErrorDetails(ELoyaltyErrors.InvalidLoyaltyType, errors));
        }

        // Tratamento para o programa de fidelidade do tipo PONTUAÇÃO que não foi implementado até o momento
        // Retirar futuramente
        if (loyalty.type == 2) {
            return res.json(LoyaltyErrorsProvider.GetErrorDetails(ELoyaltyErrors.NotImplementedLoyaltyType, errors));
        }

        // Inserindo o cliente no banco
        this.dataAccess.Create(loyalty, (err, result) => {
            if (err) {
                if (err.sqlMessage.indexOf('FK_FK_OWNER_LOYALTY') >= 0) {
                    return res.json(LoyaltyErrorsProvider.GetError(ELoyaltyErrors.OwnerNotFound));
                } else {
                    return res.json(ServiceResult.HandlerError(err));
                }
            }

            res.json(ServiceResult.HandlerSucess());
        });
    }

    /**
     * UpdateLoyalty
     */
    public UpdateLoyalty(req: Request, res: Response) {
        res.json("Update Loyalty");
    }

    /**
     * DeleteLoyalty
     */
    public DeleteLoyalty = (req: Request, res: Response) => {
        res.json("Delete Loyalty");
    }

    /**
     * ActivateLoyalty
     */
    public ActivateLoyalty(req: Request, res: Response) {
        res.json("Activate Loyalty");
    }

    /**
     * DesactivateLoyalty
     */
    public DeactivateLoyalty(req: Request, res: Response) {
        res.json("Deactivate Loyalty");
    }
}
