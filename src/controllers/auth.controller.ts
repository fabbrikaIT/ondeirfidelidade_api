import { AuthEntity } from './../models/auth/authEntity';
import { Request, Response } from "express";

import { ServiceResult } from './../models/serviceResult.model';
import { AuthErrorsProvider, EAuthErrors } from './../config/errors/authErrors';
import { BaseController } from './base.controller';
import { DataAccessResult } from "../dataaccess/dataAccess.result";
import { AuthDAO } from '../dataaccess/auth/authDAO';
import { AuthUserEntity } from '../models/auth/authUser'

export class AuthController extends BaseController {
    private ownerAccess: AuthDAO = new AuthDAO();

    /**
     * OwnerLogin
     */
    public OwnerLogin = (req: Request, res: Response) => {

        let authUser: AuthUserEntity = new AuthUserEntity();
        authUser.Map(req.body);

        if (authUser && authUser.user !== "" && authUser.password !== "") {
            
            this.ownerAccess.Login(authUser.user, authUser.password, (ret, error) => {
                let result: ServiceResult = new ServiceResult();

                // Verifica se ocorreu algum erro
                if (error) {                    
                    result.ErrorCode = "ERR999";
                    result.ErrorMessage = JSON.stringify(error);
                    result.Executed = false;
                } 
                else {
                    if (ret && ret.length > 0){
                        const auth: AuthEntity = new AuthEntity();
                        auth.loginAccept = true;
                        auth.authenticationToken = this.GenerateAuthToken(ret[0]);
                        auth.userName = ret[0].ownerName;
                    } else {
                        result = AuthErrorsProvider.GetError(EAuthErrors.UserNotFound)
                    }
                }

                res.json(result);
            });
        } else {
            console.log("valid invalid");
            res.json(AuthErrorsProvider.GetError(EAuthErrors.InvalidUserOrPassword));
        }        
    }

    public UserLogin = (req: Request, res: Response) => {
        const adminUser: AuthUserEntity = req.body;

        if (adminUser && adminUser.user !== "" && adminUser.password !== "") {
            
        } else {
            res.json(AuthErrorsProvider.GetError(EAuthErrors.InvalidUserOrPassword));
        }  
    }

    private GenerateAuthToken = (authUser): string => {
        return '';
    }
 }