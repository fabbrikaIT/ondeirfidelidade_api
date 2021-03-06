import { Request, Response } from "express";
import * as passgen from 'generate-password';
import {Md5} from 'ts-md5/dist/md5';
import * as cloudinary from 'cloudinary';
import * as mailchimp from 'mailchimp-api-v3';
import * as mailer from 'nodemailer';
// import { check, validationResult } from "express-validator/check";

import { BaseController } from "./base.controller";
import { OwnerDAO } from "./../dataaccess/owner/ownerDAO";
import { OwnerEntity } from "./../models/owner/ownerEntity";
import { EOwnerErrors, OwnerErrorsProvider } from '../config/errors/ownerErrors';
import { ServiceResult } from '../models/serviceResult.model';

import {
  GenericErrorsProvider,
  EGenericErrors
} from "./../config/errors/genericErrors";

export class OwnerController extends BaseController {
  private dataAccess: OwnerDAO = new OwnerDAO();

  constructor() {
    super();
  }

  /*
  Listagem de membros
  */
  public listOwners = (req: Request, res: Response) => {
    req.checkParams("cityId").isNumeric();

    const errors = req.validationErrors();
    if (errors) {
      this.dataAccess.ListOwners(res, this.processDefaultResult);  
    } else {
      const cityId = req.params["cityId"];

      if (cityId > 0) {
        this.dataAccess.ListCityOwners(cityId, res, this.processDefaultResult);
      } else {
        this.dataAccess.ListOwners(res, this.processDefaultResult);
      }
    }
  };

  /**
   * Busca de um membro pro Id
   */
  public getOwner = (req: Request, res: Response) => {
    req.checkParams("id").isNumeric();

    const errors = req.validationErrors();
    if (errors) {
      return res.json(OwnerErrorsProvider.GetErrorDetails(EOwnerErrors.InvalidOwnerId, errors));
    }

    const ownerId = req.params["id"];

    this.dataAccess.GetOwner(ownerId, res, this.processDefaultResult);
  };

  /**
   * Criação de um novo membro na base
   */
  public createOwner = (req: Request, res: Response) => {
    if (req.body == null || req.body == undefined) {
      return res.json(GenericErrorsProvider.GetError(EGenericErrors.InvalidArguments));
    }

    // validações do corpo recebido
    req.checkBody({
        title: {
            notEmpty: true,
            errorMessage: "Título é Obrigatório"
        },
        ownerName: {
            notEmpty: true,
            errorMessage: "Nome do responsável é Obrigatório"
        },
        email: {
            isEmail: true,
            errorMessage: "E-mail inválido ou vazio"
        },
        ondeIrId: {
            exists: true,
            errorMessage: "Necessário um relacionamento com um estabelecimento do Onde Ir"
        }
    });

    const errors = req.validationErrors();
    if (errors) {
      return res.json(OwnerErrorsProvider.GetErrorDetails(EOwnerErrors.InvalidOwnerRequiredParams, errors));
    }

    let owner: OwnerEntity = OwnerEntity.getInstance();
    owner.Map(req.body);

    // Gerando senha
    const password = passgen.generate({length: 10, numbers: true, symbols: true, excludeSimilarCharacters: true});
    const originalPassword = password;
    owner.password = Md5.hashStr(password).toString();

    const imageLogo = owner.logo;
    owner.logo = "";

    // Inserindo o cliente no banco
    this.dataAccess.Create(owner, (err, result) => {
        if (err) {
            if (err.sqlMessage.indexOf('IDX_OWNER_EMAIL') >= 0) {
                return res.json(OwnerErrorsProvider.GetError(EOwnerErrors.EmailAlreadyExists));
            } else {
                return res.json(ServiceResult.HandlerError(err));
            }
        }

        // Enviar e-mail de boas vindas.
        const mail = new mailchimp(process.env.MAILCHIMP_KEY);
        mail.post('/lists/7e0195b430/members', {
          email_address: owner.email,
          status: 'subscribed',
          merge_fields : {
            FNAME: owner.ownerName,
            PASSWORD: originalPassword,
            CELLPHONE: owner.cellphone,
            PLACE: owner.title
          }
        });


        //Upload imagem
        if (imageLogo && imageLogo.length > 0) {
          cloudinary.config({ 
            cloud_name: 'ondeirfidelidade', 
            api_key: process.env.CLOUDNARY_KEY, 
            api_secret: process.env.CLOUDNARY_SECRET 
          });

          cloudinary.uploader.upload(imageLogo, (ret) => {
            if (ret) {
              owner.id = result.insertId;
              owner.logo = ret.url.replace("/image/upload", "/image/upload/t_fidelidadeimages").replace(".png", ".jpg").replace("http", "https");

              return this.dataAccess.UpdateOwner(owner, res, this.processDefaultResult);
            } else {
              return res.json(OwnerErrorsProvider.GetError(EOwnerErrors.LogoUploadError));
            }
          });
        } else {
          return res.json(ServiceResult.HandlerSucess());
        }

        
    });
  };

  public updateOwner = (req: Request, res: Response) => {
        // validações do corpo recebido
        req.checkBody({
          title: {
              notEmpty: true,
              errorMessage: "Título é Obrigatório"
          },
          ownerName: {
              notEmpty: true,
              errorMessage: "Nome do responsável é Obrigatório"
          },
          email: {
              isEmail: true,
              errorMessage: "E-mail inválido ou vazio"
          },
          ondeIrId: {
              exists: true,
              errorMessage: "Necessário um relacionamento com um estabelecimento do Onde Ir"
          }
      });
  
      const errors = req.validationErrors();
      if (errors) {
        return res.json(OwnerErrorsProvider.GetErrorDetails(EOwnerErrors.InvalidOwnerRequiredParams, errors));
      }
  
      let owner: OwnerEntity = OwnerEntity.getInstance();
      owner.Map(req.body);

      let imageLogo = owner.logo;

      if (imageLogo.indexOf("http") >= 0) {
        imageLogo = "";
      }
      //Upload imagem
      if (imageLogo && imageLogo.length > 0) {
        cloudinary.config({ 
          cloud_name: 'ondeirfidelidade', 
          api_key: '489546737959678', 
          api_secret: 'alml7Ms_FyyBRkJ90sUbxWqLF1Q' 
        });

        cloudinary.uploader.upload(imageLogo, (ret) => {
          if (ret) {
            owner.logo = ret.url.replace("/image/upload", "/image/upload/t_fidelidadeimages").replace(".png", ".jpg").replace("http", "https");

            return this.dataAccess.UpdateOwner(owner, res, this.processDefaultResult);
          } else {
            return res.json(OwnerErrorsProvider.GetError(EOwnerErrors.LogoUploadError));
          }
        });
      } else {
        return this.dataAccess.UpdateOwner(owner, res, this.processDefaultResult);
      }
  };

  /**
   * updatePassword - Atualiza a senha de um cliente
  */
  public updatePassword = (req: Request, res: Response) => {
    req.checkBody({
      memberId: {
          notEmpty: true,
          errorMessage: "Código é Obrigatório"
      },
      password: {
          notEmpty: true,
          errorMessage: "Nova Senha é Obrigatório"
      }
    });

    const errors = req.validationErrors();
    if (errors) {
      return res.json(OwnerErrorsProvider.GetErrorDetails(EOwnerErrors.InvalidOwnerRequiredParams, errors));
    }

    const reqObj = (req.body as any);
    this.dataAccess.UpdatePassword(reqObj.memberId, reqObj.password, res, this.processDefaultResult);
  }

  /**
   * Exclui um cliente da base de dados
   */
  public deleteOwner = (req: Request, res: Response) => {
    req.checkParams("id").isNumeric();

    const errors = req.validationErrors();
    if (errors) {
      return res.json(OwnerErrorsProvider.GetErrorDetails(EOwnerErrors.InvalidOwnerId, errors));
    }

    const ownerId = req.params["id"];

    this.dataAccess.DeleteOwner(ownerId, res, this.processDefaultResult);
  };

  public resetPassword = (req: Request, res: Response) => {
    req.checkBody("email").isEmail();

    const errors = req.validationErrors();
    if (errors) {
      return res.json(OwnerErrorsProvider.GetErrorDetails(EOwnerErrors.InvalidOwnerRequiredParams, errors));
    }

    const email = (req.body as any).email;

    this.dataAccess.GetOwnerByEmail(email, (err, ret) => {
      if (err) {
        return res.json(ServiceResult.HandlerError(err));
      }

      if (ret) {
        // Gerando senha
        const password = passgen.generate({length: 10, numbers: true, symbols: true, excludeSimilarCharacters: true});
        const originalPassword = password;
        const newPassword = Md5.hashStr(password).toString();

        //Enviar email com nova senha
        this.SendResetPasswordEmail(email, originalPassword);
        
        this.dataAccess.UpdatePassword(ret.id, newPassword, res, this.processDefaultResult);
      } else {
        return res.json(OwnerErrorsProvider.GetError(EOwnerErrors.EmailNotFound));
      }
    })
  };

  private SendResetPasswordEmail = (email: string, password: string) => {
    let transporter = mailer.createTransport({
      host: 'smtp.appondeir.com.br',
      port: 465,
      secure: true,
      auth: {
          user: 'fidelidade@appondeir.com.br',
          pass: 'fidelidade001'
      }
    });

    let mailOptions = {
      from: '"Onde Ir - Sistemas" <no-replay@appondeir.com.br>', // sender address
      to: email, // list of receivers
      subject: "[Onde Ir] - Reset de Senha", // Subject line
      text: "", // plain text body
      html: `<b>Sua nova senha para acesso ao Sistemas do Onde Ir é: </b> ${password}` // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }      
    });
  }
}
