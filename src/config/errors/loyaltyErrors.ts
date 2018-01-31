import { ServiceResult } from "../../models/serviceResult.model";
import logProvider from "../../shared/log/log-provider";

export enum ELoyaltyErrors {
    InvalidLoyaltyRequiredParams = 1,
    InvalidOwnerId = 2,
    InvalidLoyaltyId = 3,
    OwnerNotFound = 4,
    InvalidLoyaltyType = 5,
    NotImplementedLoyaltyType = 6,
    ProgramWithParticipants = 7,
    LoyaltyNotFound = 8
}

export class LoyaltyErrorsProvider {
    public static GetError(error: ELoyaltyErrors) {
        const errorResult: ServiceResult = new ServiceResult();
        errorResult.Executed = false;
    
        switch (error) {
            case ELoyaltyErrors.InvalidLoyaltyRequiredParams:
                errorResult.ErrorCode = "LYT001";
                errorResult.ErrorMessage = "Parâmetros de fidelidade obrigatórios nulos ou inválidos";
                break;
            case ELoyaltyErrors.InvalidOwnerId:
                errorResult.ErrorCode = "LYT002";
                errorResult.ErrorMessage = "Código de cliente inválido ou nulo";
                break;
            case ELoyaltyErrors.InvalidLoyaltyId:
                errorResult.ErrorCode = "LYT003";
                errorResult.ErrorMessage = "Código de programa de fidelidade inválido ou nulo";
                break;
            case ELoyaltyErrors.OwnerNotFound:
                errorResult.ErrorCode = "LYT004";
                errorResult.ErrorMessage = "O Cliente informado não foi encontrado ou está inativo";
                break;
            case ELoyaltyErrors.InvalidLoyaltyType:
                errorResult.ErrorCode = "LYT005";
                errorResult.ErrorMessage = "Tipo de programa de fidalidade inválido";
                break;
            case ELoyaltyErrors.NotImplementedLoyaltyType:
                errorResult.ErrorCode = "LYT006";
                errorResult.ErrorMessage = "Tipo de programa de fidalidade não disponível no momento";
                break;
            case ELoyaltyErrors.ProgramWithParticipants:
                errorResult.ErrorCode = "LYT007";
                errorResult.ErrorMessage = "Não é possível excluir um programa de fidelidade com participantes. Para cancelar o programa, favor inativá-lo";
                break;
            case ELoyaltyErrors.LoyaltyNotFound:
                errorResult.ErrorCode = "LYT008";
                errorResult.ErrorMessage = "O programa de fidelidade não foi encontrado.";
                break;
          default:
            break;
        }
    
        logProvider.SetErrorLog(errorResult);
    
        return errorResult;
      }
    
      public static GetErrorDetails(error: ELoyaltyErrors, details: any) {
        const errorResult = this.GetError(error);
        errorResult.ErrorDetails = JSON.stringify(details);
    
        return errorResult;
      }
}