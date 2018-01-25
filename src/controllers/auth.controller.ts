import { Request, Response } from "express";

import { ServiceResult } from './../models/serviceResult.model';
import { AuthErrorsProvider, EAuthErrors } from './../config/errors/authErrors';
import { AdminEntity } from './../models/auth/admin.model';
import { OwnerDAO } from '../dataaccess/auth/ownerDAO';
import { UserEntity } from '../models/auth/user.model';
import { BaseController } from './base.controller';
import { DataAccessResult } from "../dataaccess/dataAccess.result";

export class AuthController extends BaseController {
    private ownerAccess: OwnerDAO = new OwnerDAO();

    /**
     * OwnerLogin
     */
    public OwnerLogin = (req: Request, res: Response) => {

        let adminUser: AdminEntity = new AdminEntity();
        adminUser.Map(req.body);

        if (adminUser && adminUser.email !== "" && adminUser.password !== "") {
            
            this.ownerAccess.Login(adminUser.email, adminUser.password, (ret, error) => {
                const result: ServiceResult = new ServiceResult();

                // Verifica se ocorreu algum erro
                if (error) {                    
                    result.ErrorCode = "ERR999";
                    result.ErrorMessage = JSON.stringify(error);
                } 
                else {
                    // Cria a seção do usuário;
                    result.Result = ret;

                }

                res.json(result);
            });
        } else {
            console.log("valid invalid");
            res.json(AuthErrorsProvider.GetError(EAuthErrors.InvalidUserOrPassword));
        }        
    }

    public AdminLogin = (req: Request, res: Response) => {
        
        let adminUser: AdminEntity = new AdminEntity();
        adminUser.Map(req.body);
        //Object.assign(adminUser, req.body);
        
        if (adminUser && adminUser.email !== "" && adminUser.password !== "") {
            res.json(adminUser);
        } else {
            res.json(AuthErrorsProvider.GetError(EAuthErrors.InvalidUserOrPassword));
        }  
    }

    public UserLogin = (req: Request, res: Response) => {
        const adminUser: UserEntity = req.body;

        if (adminUser && adminUser.Email !== "" && adminUser.Password !== "") {
            
        } else {
            res.json(AuthErrorsProvider.GetError(EAuthErrors.InvalidUserOrPassword));
        }  
    }
 }