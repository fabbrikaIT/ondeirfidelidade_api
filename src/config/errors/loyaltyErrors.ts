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
    LoyaltyNotFound = 8,
    LoyaltyNotActive = 9,
    LoyaltyOutOfDate = 10,
    LoyaltyOutValidity = 11,
    LoyaltyDayLimitExceeded = 12,
    LoyaltyUsageWait = 13,
    LoyaltyPointsGoal = 14,
    LoyaltyProgramNotFound = 15,
    LoyaltyNotPointsGoal = 16
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
            case ELoyaltyErrors.LoyaltyNotActive:
                errorResult.ErrorCode = "LYT009";
                errorResult.ErrorMessage = "O programa de fidelidade não está ativo.";
                break;
            case ELoyaltyErrors.LoyaltyOutOfDate:
                errorResult.ErrorCode = "LYT010";
                errorResult.ErrorMessage = "Não é possível pontuar no programa de fidelidade na data e hora atuais.";
                break;
            case ELoyaltyErrors.LoyaltyOutValidity:
                errorResult.ErrorCode = "LYT011";
                errorResult.ErrorMessage = "O programa de fidelidade não está vigênte neste momento, confira os dias e horários para uso.";
                break;
            case ELoyaltyErrors.LoyaltyDayLimitExceeded:
                errorResult.ErrorCode = "LYT012";
                errorResult.ErrorMessage = "Limite do uso diário do programa excedido.";
                break;
            case ELoyaltyErrors.LoyaltyUsageWait:
                errorResult.ErrorCode = "LYT013";
                errorResult.ErrorMessage = "Tempo de espera desde última utilização não respeitado.";
                break;
            case ELoyaltyErrors.LoyaltyPointsGoal:
                errorResult.ErrorCode = "LYT014";
                errorResult.ErrorMessage = "Número de pontos para resgate alcançado, mostre o cartão no local para retirar sua recompensa.";
                break;
            case ELoyaltyErrors.LoyaltyProgramNotFound:
                errorResult.ErrorCode = "LYT015";
                errorResult.ErrorMessage = "Programa de fidelidade não encontrado.";
                break;
            case ELoyaltyErrors.LoyaltyNotPointsGoal:
                errorResult.ErrorCode = "LYT016";
                errorResult.ErrorMessage = "Pontuação necessária para resgate ainda não alcançada.";
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