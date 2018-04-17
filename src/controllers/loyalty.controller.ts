import { LoyaltyPointsEntity } from './../models/loyalty/loyaltyPoints';
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
import { OwnerDAO } from '../dataaccess/owner/ownerDAO';
import { UsersDAO } from '../dataaccess/user/usersDAO';
import { UserEntity } from '../models/users/userEntity';
import { OndeIrDAO } from '../dataaccess/ondeir/ondeIrDAO';
import { LoyaltyProgramEntity } from '../models/loyalty/loyaltyProgram';
/**
 * 
 * 
 * @export
 * @class LoyaltyController
 * @extends {BaseController}
 */
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
    
    public ListUserLoyalty = (req: Request, res: Response) => {
        req.checkParams("id").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            return res.json(LoyaltyErrorsProvider.GetErrorDetails(ELoyaltyErrors.InvalidOwnerId, errors));
        }

        const userId = req.params["id"];

        this.dataAccess.ListUserLoyalty(userId, res, this.processDefaultResult);
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

        this.dataAccess.GetLoyalty(id, res, (r, err, result) => {
            if (err) {
                return res.json(ServiceResult.HandlerError(err));
            }

            if (!result || result.length === 0) {
                return res.json(LoyaltyErrorsProvider.GetError(ELoyaltyErrors.LoyaltyNotFound));
            }
    
            const ownerAccess: OwnerDAO = new OwnerDAO();
            ownerAccess.GetOwner((result as LoyaltyEntity).ownerId, res, (r, er, ret) => {
                if (er) {
                    return res.json(ServiceResult.HandlerError(er));
                }

                (result as LoyaltyEntity).owner = ret;
                const serviceResult: ServiceResult = ServiceResult.HandlerSucess();
                serviceResult.Result = result;
                res.json(serviceResult);
            });
        });
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
                validity.loyaltyId = loyalty.id;

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

    /**
     * Pontua em uma programa de fidelidade
     */
    public ApplyLoyalty = (req: Request, res: Response) => {
        req.checkBody("qrHash").notEmpty();
        req.checkBody("userId").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            return res.json(LoyaltyErrorsProvider.GetErrorDetails(ELoyaltyErrors.InvalidLoyaltyId, errors));
        }

        const qrHash = req.body.qrHash;
        const userId = req.body.userId;

        // Buscando o programa de fidelidade
        this.dataAccess.GetLoyaltyByHash(qrHash, (err, result: LoyaltyEntity) => {
            if (err) {
                return res.json(ServiceResult.HandlerError(err));
            }

            if (!result) {
                return res.json(LoyaltyErrorsProvider.GetError(ELoyaltyErrors.LoyaltyNotFound));
            }

            return this.ValidateProgramIsAvaliable(result, userId, res);            
        });
    }

    public GetLoyaltyProgram = (req: Request, res: Response) => {
        req.checkParams("qrHash").notEmpty();
        req.checkParams("userId").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            return res.json(LoyaltyErrorsProvider.GetErrorDetails(ELoyaltyErrors.InvalidLoyaltyId, errors));
        }

        const qrHash = req.params["qrHash"];
        const userId = req.params["userId"];

        // Buscando o programa de fidelidade
        this.dataAccess.GetLoyaltyByHash(qrHash, (err, result: LoyaltyEntity) => {
            if (err) {
                return res.json(ServiceResult.HandlerError(err));
            }

            if (!result) {
                return res.json(LoyaltyErrorsProvider.GetError(ELoyaltyErrors.LoyaltyNotFound));
            }

            this.dataAccess.GetUserLoyaltyProgram(userId, result.id, (error, ret: LoyaltyProgramEntity) => {
                if (error) {
                    return res.json(ServiceResult.HandlerError(error));
                }

                const serviceResult = ServiceResult.HandlerSucess();
                serviceResult.Result = ret;

                return res.json(serviceResult);
            });
        });
    }

    public RedeemLoyaltyAward = (req: Request, res: Response) => {
        req.checkBody("programId").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            return res.json(LoyaltyErrorsProvider.GetErrorDetails(ELoyaltyErrors.InvalidLoyaltyId, errors));
        }

        const programId = req.body.programId;

        this.dataAccess.GetLoyaltyProgram(programId, (err, result: LoyaltyProgramEntity) => {
            if (err) {
                return res.json(ServiceResult.HandlerError(err));
            }

            if (!result) {
                return res.json(LoyaltyErrorsProvider.GetError(ELoyaltyErrors.LoyaltyProgramNotFound));
            }

            this.dataAccess.GetLoyalty(result.LoyaltyId, res, (r, error, ret: LoyaltyEntity) => {
                if (error) {
                    return res.json(ServiceResult.HandlerError(error));
                }

                if (result.Points.length === ret.usageType.usageGoal) {
                    result.Discharges += 1;

                    return this.dataAccess.RedeemLoyaltyAward(result, res, this.processDefaultResult);
                } else {
                    return res.json(LoyaltyErrorsProvider.GetError(ELoyaltyErrors.LoyaltyNotPointsGoal));
                }
            });
        });
    }

    /** Busca de programas de fidelidade por usuários */
    public SearchLoyaltyByCity = (req: Request, res: Response) => {
        req.checkParams("cityId").isNumeric();

        const errors = req.validationErrors();
        if (errors) {
            return res.json(LoyaltyErrorsProvider.GetErrorDetails(ELoyaltyErrors.InvalidOwnerId, errors));
        }

        const cityId = req.params["cityId"];

        this.dataAccess.SearchLoyaltyByCity(cityId, res, this.processDefaultResult);
    } 

    /** Processando a pontuação em um programa de fidelidade */
    private ValidateProgramIsAvaliable = (loyalty: LoyaltyEntity, userId: number, res: Response) => {
        let today = new Date();

        // Verifica se o programa de fidelidade é valido e ativo
        if (loyalty.status !== ELoyaltyStatus.Active) {
            return res.json(LoyaltyErrorsProvider.GetError(ELoyaltyErrors.LoyaltyNotActive));
        }

        // Verifica se o programa de fidelidade não está vencido
        if (loyalty.startDate > today || (loyalty.endDate && loyalty.endDate < today)) {
            return res.json(LoyaltyErrorsProvider.GetError(ELoyaltyErrors.LoyaltyOutOfDate));
        }

        // Verifica a vigência do programa
        if (loyalty.validity && loyalty.validity.length > 0) {
            let validity = loyalty.validity.find(item => 
                item.weekday === today.getDay()
            );

            if (!validity) {
                return res.json(LoyaltyErrorsProvider.GetError(ELoyaltyErrors.LoyaltyOutOfDate));
            }

            if(this.getTimeValue(validity.startTime) > this.getTimeValue(today) || this.getTimeValue(validity.endTime) < this.getTimeValue(today)) {
                return res.json(LoyaltyErrorsProvider.GetError(ELoyaltyErrors.LoyaltyOutOfDate));
            }            
        }

        return this.VerifyIdUserCanLoyalty(loyalty, userId, res);
    }

    private getTimeValue(time: Date): number {
        const hours = time.getHours();
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();

        return Math.floor(seconds + minutes * 60 + (hours*24*60));
    }

    private VerifyIdUserCanLoyalty = (loyalty: LoyaltyEntity, userId: number, res: Response) => {
        
        // Verifica se o usuário pode pontuar (Numero de pontuações no dia e tempo entre o uso)
        this.dataAccess.GetUserLoyaltyProgram(userId, loyalty.id, (err, result: LoyaltyProgramEntity) => {
            if (err) {
                return res.json(ServiceResult.HandlerError(err));
            }

            if (result) {
                if (result.Points && result.Points.length > 0) {
                    if (loyalty.usageType.usageGoal == result.Points.length) {
                        return res.json(LoyaltyErrorsProvider.GetError(ELoyaltyErrors.LoyaltyPointsGoal));
                    }

                    const pointsToday = result.Points.filter(x=> {
                        return result.Points[0].PointDate.toLocaleDateString() === new Date().toLocaleDateString()
                    });

                    if (loyalty.dayLimit <= pointsToday.length) {
                        return res.json(LoyaltyErrorsProvider.GetError(ELoyaltyErrors.LoyaltyDayLimitExceeded));
                    }

                    const lastPoint = new Date(Math.max.apply(null, result.Points.map(x=> x.PointDate)));
                    const difference = new Date() - lastPoint;

                    if (loyalty.usageLimit) {
                        if (loyalty.usageLimit >= Math.floor((difference/1000)/60)) {
                            return res.json(LoyaltyErrorsProvider.GetError(ELoyaltyErrors.LoyaltyUsageWait));
                        }
                    }
                }
                
                return this.AddLoyaltyProgramPoints(result, res);
            } else {
                return this.SubscribeUserLoyalty(loyalty, userId, res);
            }
        });
    }

    // Realiza a pontuação em um programa de fidalide
    private AddLoyaltyProgramPoints(program: LoyaltyProgramEntity, res: Response) {
        const point:  LoyaltyPointsEntity = LoyaltyPointsEntity.GetInstance();
        point.ProgramId = program.Id;

        this.dataAccess.AddLoyaltyProgramPoint(point, (err, result) => {
            if (err) {
                return res.json(ServiceResult.HandlerError(err));
            }

            program.Points.push(point);

            const serviceResult = ServiceResult.HandlerSucess();
            serviceResult.Result = program;

            return res.json(serviceResult);
        });
    }

    // Inscreve o usuário em um programa de fidelidade
    private SubscribeUserLoyalty = (loyalty: LoyaltyEntity, userId: number, res: Response) => {
        const userDA: UsersDAO = new UsersDAO();

        userDA.GetUserByOndeIr(userId, res, (r, err, result) => {
            if (err) {
                return res.json(ServiceResult.HandlerError(err));
            }

            if (result)
            {
                const program = LoyaltyProgramEntity.GetInstance();
                program.LoyaltyId = loyalty.id;
                program.UserId = result.Id;
                program.CardLink = `http://ondeircidades.com.br/sistemas/#/card/${loyalty.qrHash}/${result.Id}`;

                this.dataAccess.SubscribeUserLoyaltyProgram(program, (error, ret) => {
                    if (error) {
                        return res.json(ServiceResult.HandlerError(error));
                    }

                    program.Id = ret.insertId
                    return this.AddLoyaltyProgramPoints(program, res);
                })
            } 
            else 
            {
                return this.RegisterNewUser(loyalty, userId, res);
            }
        });
        
        
    }

    // Adiciona um novo usuário do Onde Ir no programa de fidelidade
    private RegisterNewUser = (loyalty: LoyaltyEntity, userId: number, res: Response) => {
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
    
                this.SubscribeUserLoyalty(loyalty, userId, res);
            });
        });
    }
}
