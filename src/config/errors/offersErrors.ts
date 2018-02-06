import { ServiceResult } from "./../../models/serviceResult.model";
import logProvider from "../../shared/log/log-provider";

export enum EOffersErrors {
    InvalidOffersRequiredParams = 1,
    InvalidOwnerId = 2,
    InvalidOfferType = 3,
    InvalidDiscountParams = 4,
    InvalidPromotionParams = 5,
    OwnerNotFound = 6,
    InvalidOfferId = 7
}

export class OffersErrorsProvider {
  public static GetError(error: EOffersErrors) {
    const errorResult: ServiceResult = new ServiceResult();
    errorResult.Executed = false;

    switch (error) {
      case EOffersErrors.InvalidOffersRequiredParams:
        errorResult.ErrorCode = "OFF001";
        errorResult.ErrorMessage = "Parâmetros de oferta obrigatórios nulos ou inválidos";        
        break;
    case EOffersErrors.InvalidOwnerId:
        errorResult.ErrorCode = "OFF002";
        errorResult.ErrorMessage = "Código de cliente inválido ou nulo";
        break;
    case EOffersErrors.InvalidOfferType:
        errorResult.ErrorCode = "OFF003";
        errorResult.ErrorMessage = "Tipo de oferta inválido";
        break;
    case EOffersErrors.InvalidDiscountParams:
        errorResult.ErrorCode = "OFF004";
        errorResult.ErrorMessage = "Parâmetros de oferta de desconto nulos ou inválidos";
        break;
    case EOffersErrors.InvalidPromotionParams:
        errorResult.ErrorCode = "OFF005";
        errorResult.ErrorMessage = "Parâmetros de oferta de promocional nulos ou inválidos";
        break;
    case EOffersErrors.OwnerNotFound:
        errorResult.ErrorCode = "OFF005";
        errorResult.ErrorMessage = "O Cliente informado não foi encontrado ou está inativoo";
        break;
    case EOffersErrors.InvalidOfferId:
        errorResult.ErrorCode = "OFF007";
        errorResult.ErrorMessage = "Código de oferta nulo ou inválido";
        break;
      default:
        break;
    }

    logProvider.SetErrorLog(errorResult);

    return errorResult;
  }

  public static GetErrorDetails(error: EOffersErrors, details: any) {
    const errorResult = this.GetError(error);
    errorResult.ErrorDetails = JSON.stringify(details);

    return errorResult;
  }
}
