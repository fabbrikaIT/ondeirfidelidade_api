import { OwnerDAO } from './../dataaccess/owner/ownerDAO';
import { EOfferStatus } from './../models/offers/offers.model';
import { Request, Response } from 'express';
import * as passgen from 'generate-password';
import {Md5} from 'ts-md5/dist/md5';

import { BaseController } from './base.controller';
import { EOffersErrors, OffersErrorsProvider } from '../config/errors/offersErrors';
import { OffersEntity } from '../models/offers/offers.model';
import { OffersDAO } from '../dataaccess/offers/offersDAO';
import { ServiceResult } from '../models/serviceResult.model';
import { CouponEntity } from '../models/offers/coupon.model';
import { UsersDAO } from '../dataaccess/user/usersDAO';
import { OndeIrDAO } from '../dataaccess/ondeir/ondeIrDAO';
import { UserEntity } from '../models/users/userEntity';

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

        this.dataAccess.GetOffer(id, res, (r, err, result) => {
            if (err) {
                return res.json(ServiceResult.HandlerError(err));
            }

            if (!result || result.length === 0) {
                return res.json(OffersErrorsProvider.GetError(EOffersErrors.OfferNotFound));
            }
    
            const ownerAccess: OwnerDAO = new OwnerDAO();
            ownerAccess.GetOwner((result as OffersEntity).ownerId, res, (r, er, ret) => {
                if (er) {
                    return res.json(ServiceResult.HandlerError(er));
                }

                (result as OffersEntity).owner = ret;
                const serviceResult: ServiceResult = ServiceResult.HandlerSucess();
                serviceResult.Result = result;
                return res.json(serviceResult);
            });
        });
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

            offer.description = "";
        } else { // Tipo de Oferta Promocional
            if (offer.description && offer.description === "") {
                return res.json(OffersErrorsProvider.GetError(EOffersErrors.InvalidPromotionParams));
            }

            offer.discount = 0;
            offer.reward = "";
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

    public SearchOffersByCity = (req: Request, res: Response) => {
        req.checkParams("cityId").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            return res.json(OffersErrorsProvider.GetErrorDetails(EOffersErrors.InvalidOwnerId, errors));
        }

        const cityId = req.params["cityId"];

        this.dataAccess.SearchOffersByCity(cityId, res, this.processDefaultResult);        
    }

    /**
     * Gera um cupom de desconto
     */
    public createCoupon = (req: Request, res: Response) => {
        req.checkBody("offerId").isNumeric();
        req.checkBody("userId").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            return res.json(OffersErrorsProvider.GetErrorDetails(EOffersErrors.InvalidOffersRequiredParams, errors));
        }

        const userId = req.body.userId;
        const offerId = req.body.offerId;
        
        //verifica se já não existe cupom gerado
        this.dataAccess.GetUserCouponOffer(userId, offerId, (err, ret) => {
            if (err) {
                return res.json(ServiceResult.HandlerError(err));
            }

            if (ret) {
                return res.json(OffersErrorsProvider.GetError(EOffersErrors.CouponAlredyExists));
            }

            // Buscando dados da oferta
            this.dataAccess.GetOffer(offerId, res, (r, er, result: OffersEntity) => {
                if (er) {
                    return res.json(ServiceResult.HandlerError(er));
                }
    
                if (!result) {
                    return res.json(OffersErrorsProvider.GetError(EOffersErrors.OfferNotFound));
                }
        
                this.SubscribeUserCoupon(userId, result, res);
            });
        });
    }

    public ListUserCoupons = (req: Request, res: Response) => {
        req.checkParams("id").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            return res.json(OffersErrorsProvider.GetErrorDetails(EOffersErrors.InvalidOwnerId, errors));
        }

        const userId = req.params["id"];

        this.dataAccess.ListUserCoupons(userId, res, this.processDefaultResult);      
    }

    public GetCoupon = (req: Request, res: Response) => {
        req.checkParams("qrHash").notEmpty();
        req.checkParams("userId").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            return res.json(OffersErrorsProvider.GetErrorDetails(EOffersErrors.InvalidDiscountParams, errors));
        }

        const qrHash = req.params["qrHash"];
        const userId = req.params["userId"];

        this.dataAccess.GetUserCouponOfferHash(qrHash, userId, res, this.processDefaultResult);
    }

    public UseCoupon = (req: Request, res: Response) => {
        req.checkBody("offerId").isNumeric();
        req.checkBody("userId").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            return res.json(OffersErrorsProvider.GetErrorDetails(EOffersErrors.InvalidOffersRequiredParams, errors));
        }

        const userId = req.body.userId;
        const offerId = req.body.offerId;

        this.dataAccess.GetUserCouponOffer(userId, offerId, (err, ret) => {
            if (err) {
                return res.json(ServiceResult.HandlerError(err));
            }

            if (!ret || ret.length === 0) {
                return res.json(OffersErrorsProvider.GetError(EOffersErrors.OfferNotFound));
            }

            ret[0].isValid = true;
            this.dataAccess.UseCoupon(ret[0], res, this.processDefaultResult);
        });
    }

    private SubscribeUserCoupon = (userId: number, offer: OffersEntity, res: Response) => {
        const userDA: UsersDAO = new UsersDAO();

        userDA.GetUserByOndeIr(userId, res, (r, err, result) => {
            if (err) {
                return res.json(ServiceResult.HandlerError(err));
            }

            if (result)
            {
                // gerando cupom
                const coupon: CouponEntity = CouponEntity.GetInstance();
                coupon.userId = result.Id;
                coupon.offerId = offer.id;
                coupon.isValid = false;
                coupon.couponLink = `http://ondeircidades.com.br/fidelidade/#/coupon/${offer.qrHash}/${result.Id}`;

                this.dataAccess.CreateCoupon(coupon, (e, resp) => {
                    if (e) {
                        return res.json(ServiceResult.HandlerError(e));
                    }

                    return res.json(ServiceResult.HandlerSucess());                    
                });
            } 
            else 
            {
                return this.RegisterNewUser(offer, userId, res);
            }
        });
    } 

    // Adiciona um novo usuário do Onde Ir no programa de fidelidade
    private RegisterNewUser = (offer: OffersEntity, userId: number, res: Response) => {
        const userDA: UsersDAO = new UsersDAO();
        const ondeIrDA: OndeIrDAO = new OndeIrDAO();

        let user = UserEntity.GetInstance();

        // Buscar usuário do Onde Ir
        ondeIrDA.GetUser(userId, (err, ret) => {
            if (err || !ret) {
                return res.json(ServiceResult.HandlerError(err));
            }

            user = ret;

            userDA.Create(user, (err, result) => {
                if (err) {
                    return res.json(ServiceResult.HandlerError(err));
                }
    
                this.SubscribeUserCoupon(userId, offer, res);
            });
        });
    }
}