import { Request, Response } from 'express';
import * as passgen from 'generate-password';
import {Md5} from 'ts-md5/dist/md5';

import { LoyaltyDAO } from './../dataaccess/loyalty/loyaltyDAO';
import { BaseController } from "./base.controller";
import {ServiceResult} from '../models/serviceResult.model';
import { LoyaltyErrorsProvider, ELoyaltyErrors } from '../config/errors/loyaltyErrors';
import { LoyaltyEntity, ELoyaltyStatus } from '../models/loyalty/loyalty';
import { LoyaltyUsageType } from './../models/loyalty/loyaltyUsageType';
import { LoyaltyValidity } from './../models/loyalty/loyaltyValidity';

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
     *  ListLoyalty by Status
     */
    public ListLoyaltyStatus = (req: Request, res: Response) => {
        req.checkParams("owner").isNumeric();
        req.checkParams("status").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            return res.json(LoyaltyErrorsProvider.GetErrorDetails(ELoyaltyErrors.InvalidOwnerId, errors));
        }

        const ownerId = req.params["owner"];
        const status = req.params["status"];

        this.dataAccess.ListLoyaltyStatus(ownerId, status, res, this.processDefaultResult);
    }  

    /**
     * GetLoyalty
     */
    public GetLoyalty = (req: Request, res: Response) => {
        req.checkParams("id").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            return res.json(LoyaltyErrorsProvider.GetErrorDetails(ELoyaltyErrors.InvalidLoyaltyId, errors));
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
        //Mapeando o tipo
        loyalty.usageType = LoyaltyUsageType.getInstance();
        loyalty.usageType.Map(req.body.usageType);
        //Mapeando a Vigencia
        if (req.body.validity) {
            loyalty.validity = req.body.validity.map(item => {
                let validity = LoyaltyValidity.getInstance();
                validity.Map(item);

                return validity;
            });
        }

        if (loyalty.type !== 1 && loyalty.type !== 2) {
            return res.json(LoyaltyErrorsProvider.GetErrorDetails(ELoyaltyErrors.InvalidLoyaltyType, errors));
        }

        // Tratamento para o programa de fidelidade do tipo PONTUAÇÃO que não foi implementado até o momento
        // Retirar futuramente
        if (loyalty.type == 2) {
            return res.json(LoyaltyErrorsProvider.GetErrorDetails(ELoyaltyErrors.NotImplementedLoyaltyType, errors));
        }

        //Gerando Hash de Identificação
        const id = passgen.generate({length: 10, numbers: true, symbols: true, excludeSimilarCharacters: true});
        loyalty.qrHash = Md5.hashStr(id).toString();

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
    public UpdateLoyalty = (req: Request, res: Response) => {
        req.checkBody({
            id: {
                isNumeric: true,
                errorMessage: "Id do programa de fidelidade é Obrigatório"
            },
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
        //Mapeando o tipo
        loyalty.usageType = LoyaltyUsageType.getInstance();
        loyalty.usageType.Map(req.body.usageType);
        //Mapeando a Vigencia
        if (req.body.validity) {
            loyalty.validity = req.body.validity.map(item => {
                let validity = LoyaltyValidity.getInstance();
                validity.Map(item);

                return validity;
            });
        }

        // Atualizando dados do programa de fidelidade
        this.dataAccess.UpdateLoyalty(loyalty, (err, result) => {
            if (err) {
                if (err.sqlMessage.indexOf('FK_FK_OWNER_LOYALTY') >= 0) {
                    return res.json(LoyaltyErrorsProvider.GetError(ELoyaltyErrors.OwnerNotFound));
                } else {
                    return res.json(ServiceResult.HandlerError(err));
                }
            } else {
                if (result.affectedRows == 0) {
                    return res.json(LoyaltyErrorsProvider.GetError(ELoyaltyErrors.LoyaltyNotFound));
                }
            }

            res.json(ServiceResult.HandlerSucess());
        });
    }

    /**
     * DeleteLoyalty
     */
    public DeleteLoyalty = (req: Request, res: Response) => {
        req.checkParams("id").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            return res.json(LoyaltyErrorsProvider.GetErrorDetails(ELoyaltyErrors.InvalidLoyaltyId, errors));
        }

        const id = req.params["id"];

        this.dataAccess.DeleteLoyalty(id, (err, result) => {
            if (err) {
                if (err.sqlMessage.indexOf('FK_FK_LOYALTY_PROGRAM') >= 0) {
                    return res.json(LoyaltyErrorsProvider.GetError(ELoyaltyErrors.ProgramWithParticipants));
                } else {
                    return res.json(ServiceResult.HandlerError(err));
                }
            }

            res.json(ServiceResult.HandlerSucess())
        }, res);
    }

    /**
     * ActivateLoyalty
     */
    public ActivateLoyalty = (req: Request, res: Response) => {
        req.checkBody("id").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            return res.json(LoyaltyErrorsProvider.GetErrorDetails(ELoyaltyErrors.InvalidLoyaltyId, errors));
        }

        const id = req.body.id;

        this.dataAccess.UpdateLoyaltyStatus(id, ELoyaltyStatus.Active, (err, ret) => {
            if (err) { 
                return res.json(ServiceResult.HandlerError(err));
            } else {
                if (ret.affectedRows == 0) {
                    return res.json(LoyaltyErrorsProvider.GetError(ELoyaltyErrors.LoyaltyNotFound));
                }

                res.json(ServiceResult.HandlerSucess())
            }
        });
    }

    /**
     * DesactivateLoyalty
     */
    public DeactivateLoyalty = (req: Request, res: Response) => {
        req.checkBody("id").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            return res.json(LoyaltyErrorsProvider.GetErrorDetails(ELoyaltyErrors.InvalidLoyaltyId, errors));
        }

        const id = req.body.id;

        this.dataAccess.UpdateLoyaltyStatus(id, ELoyaltyStatus.Cancelled, (err, ret) => {
            if (err) { 
                return res.json(ServiceResult.HandlerError(err));
            } else {
                if (ret.affectedRows == 0) {
                    return res.json(LoyaltyErrorsProvider.GetError(ELoyaltyErrors.LoyaltyNotFound));
                }

                res.json(ServiceResult.HandlerSucess())
            }
        });
    }
}
