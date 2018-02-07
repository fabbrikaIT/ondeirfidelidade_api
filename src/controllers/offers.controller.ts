import { EOfferStatus } from './../models/offers/offers.model';
import { Request, Response } from 'express';
import * as passgen from 'generate-password';
import {Md5} from 'ts-md5/dist/md5';

import { BaseController } from './base.controller';
import { EOffersErrors, OffersErrorsProvider } from '../config/errors/offersErrors';
import { OffersEntity } from '../models/offers/offers.model';
import { OffersDAO } from '../dataaccess/offers/offersDAO';
import { ServiceResult } from '../models/serviceResult.model';

export class OffersController extends BaseController {
     private dataAccess = new OffersDAO();

    constructor() {
        super();
    }

    public ListOffers = (req: Request, res: Response) => { 
        req.checkParams("owner").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            return res.json(OffersErrorsProvider.GetErrorDetails(EOffersErrors.InvalidOwnerId, errors));
        }

        const ownerId = req.params["owner"];

        this.dataAccess.ListOffers(ownerId, res, this.processDefaultResult);
    }

    public ListOffersStatus = (req: Request, res: Response) => {
        req.checkParams("owner").isNumeric();
        req.checkParams("status").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            return res.json(OffersErrorsProvider.GetErrorDetails(EOffersErrors.InvalidOwnerId, errors));
        }

        const ownerId = req.params["owner"];
        const status = req.params["status"];

        this.dataAccess.ListOffersStatus(ownerId, status, res, this.processDefaultResult);
    }  

    public GetOffers = (req: Request, res: Response) => {
        req.checkParams("id").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            return res.json(OffersErrorsProvider.GetErrorDetails(EOffersErrors.InvalidOfferId, errors));
        }

        const id = req.params["id"];

        this.dataAccess.GetOffer(id, res, this.processDefaultResult);
    }
    
    /* 
        Interface de criação de novas ofertas
    */
    public CreateOffer = (req: Request, res: Response) => { 
        // Validação dos dados de entrada
        req.checkBody({
            title: {
                notEmpty: true,
                errorMessage: "Título da oferta é Obrigatório"
            },
            startDate: {
                notEmpty: true,
                errorMessage: "Data de inicio de validade da oferta é obrigatória"
            },
            type: {
                isNumeric: true,
                errorMessage: "Tipo da oferta inválido"
            },
            ownerId: {
                isNumeric: true,
                errorMessage: "Código de cliente inválido"
            }
        });

        // Verifica se a entidade tem erros
        const errors = req.validationErrors();
        if (errors) {
            return res.json(OffersErrorsProvider.GetErrorDetails(EOffersErrors.InvalidOffersRequiredParams, errors));
        }

        let offer: OffersEntity = OffersEntity.getInstance();
        offer.Map(req.body);

        // Validando tipos de ofertas
        if (offer.type !== 1 && offer.type !== 2) {
            return res.json(OffersErrorsProvider.GetError(EOffersErrors.InvalidOfferType));
        }

        // Tipo de Oferta de Desconto
        if (offer.type === 1) {
            if (offer.discount <= 0 || offer.reward === "") {
                return res.json(OffersErrorsProvider.GetError(EOffersErrors.InvalidDiscountParams));
            }
        } else { // Tipo de Oferta Promocional
            if (offer.description && offer.description === "") {
                return res.json(OffersErrorsProvider.GetError(EOffersErrors.InvalidPromotionParams));
            }
        }

        //Gerando Hash de Identificação
        const id = passgen.generate({length: 10, numbers: true, symbols: true, excludeSimilarCharacters: true});
        offer.qrHash = Md5.hashStr(id).toString();

        // Inserindo o cliente no banco
        this.dataAccess.Create(offer, (err, result) => {
        if (err) {
                if (err.sqlMessage.indexOf('FK_FK_OWNER_OFFERS') >= 0) {
                    return res.json(OffersErrorsProvider.GetError(EOffersErrors.OwnerNotFound));
                } else {
                    return res.json(ServiceResult.HandlerError(err));
                }
            }

            res.json(ServiceResult.HandlerSucess());
        });
    }

    public UpdateOffer = (req: Request, res: Response) => { 
        // Validação dos dados de entrada
        req.checkBody({
            id: {
                isNumeric: true,
                errorMessage: "Código de oferta inválido"
            },
            title: {
                notEmpty: true,
                errorMessage: "Título da oferta é Obrigatório"
            },
            startDate: {
                notEmpty: true,
                errorMessage: "Data de inicio de validade da oferta é obrigatória"
            },
            type: {
                isNumeric: true,
                errorMessage: "Tipo da oferta inválido"
            },
            ownerId: {
                isNumeric: true,
                errorMessage: "Código de cliente inválido"
            }
        });

        // Verifica se a entidade tem erros
        const errors = req.validationErrors();
        if (errors) {
            return res.json(OffersErrorsProvider.GetErrorDetails(EOffersErrors.InvalidOffersRequiredParams, errors));
        }

        let offer: OffersEntity = OffersEntity.getInstance();
        offer.Map(req.body);

        // Validando tipos de ofertas
        if (offer.type !== 1 && offer.type !== 2) {
            return res.json(OffersErrorsProvider.GetError(EOffersErrors.InvalidOfferType));
        }

        // Tipo de Oferta de Desconto
        if (offer.type === 1) {
            if (offer.discount <= 0 || offer.reward === "") {
                return res.json(OffersErrorsProvider.GetError(EOffersErrors.InvalidDiscountParams));
            }
        } else { // Tipo de Oferta Promocional
            if (offer.description && offer.description === "") {
                return res.json(OffersErrorsProvider.GetError(EOffersErrors.InvalidPromotionParams));
            }
        }

        // Atualizando a oferta no banco
        this.dataAccess.Update(offer, (err, result) => {
            if (err) {
                    if (err.sqlMessage.indexOf('FK_FK_OWNER_OFFERS') >= 0) {
                        return res.json(OffersErrorsProvider.GetError(EOffersErrors.OwnerNotFound));
                    } else {
                        return res.json(ServiceResult.HandlerError(err));
                    }
                }
    
                res.json(ServiceResult.HandlerSucess());
        });
    }

    public DeleteOffer = (req: Request, res: Response) => { 
        req.checkParams("id").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            return res.json(OffersErrorsProvider.GetErrorDetails(EOffersErrors.InvalidOfferId, errors));
        }

        const id = req.params["id"];

        this.dataAccess.DeleteOffer(id, (err, result) => {
            if (err) {
                if (err.sqlMessage.indexOf('FK_FK_OFFERS_COUPONS') >= 0) {
                    return res.json(OffersErrorsProvider.GetError(EOffersErrors.HasValidCounpons));
                } else {
                    return res.json(ServiceResult.HandlerError(err));
                }
            }

            res.json(ServiceResult.HandlerSucess())
        }, res);
    }

    public ActiveOffer = (req: Request, res: Response) => { 
        req.checkBody("id").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            return res.json(OffersErrorsProvider.GetErrorDetails(EOffersErrors.InvalidOfferId, errors));
        }

        const id = req.body.id;

        this.dataAccess.UpdateOfferStatus(id, EOfferStatus.Active, (err, ret) => {
            if (err) { 
                return res.json(ServiceResult.HandlerError(err));
            } else {
                if (ret.affectedRows == 0) {
                    return res.json(OffersErrorsProvider.GetError(EOffersErrors.OfferNotFound));
                }

                res.json(ServiceResult.HandlerSucess())
            }
        });
    }

    public InativateOffer = (req: Request, res: Response) => { 
        req.checkBody("id").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            return res.json(OffersErrorsProvider.GetErrorDetails(EOffersErrors.InvalidOfferId, errors));
        }

        const id = req.body.id;

        this.dataAccess.UpdateOfferStatus(id, EOfferStatus.Inative, (err, ret) => {
            if (err) { 
                return res.json(ServiceResult.HandlerError(err));
            } else {
                if (ret.affectedRows == 0) {
                    return res.json(OffersErrorsProvider.GetError(EOffersErrors.OfferNotFound));
                }

                res.json(ServiceResult.HandlerSucess())
            }
        });
    }
}