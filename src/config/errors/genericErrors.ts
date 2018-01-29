import { ServiceResult } from "./../../models/serviceResult.model";
import logProvider from "../../shared/log/log-provider";

export enum EGenericErrors {
  InvalidRequestBody = 1,
  InvalidArguments = 2
}

export class GenericErrorsProvider {
  public static GetError(error: EGenericErrors) {
    const errorResult: ServiceResult = new ServiceResult();
    errorResult.Executed = false;

    switch (error) {
      case EGenericErrors.InvalidRequestBody:
        errorResult.ErrorCode = "GENC001";
        errorResult.ErrorMessage = "The request post body is invalid or empty";        
        break;
      case EGenericErrors.InvalidArguments:
        errorResult.ErrorCode = "GENC002";
        errorResult.ErrorMessage = "Os parâmetros do serviço são inválidos ou nulos";
        break;
      default:
        break;
    }

    logProvider.SetErrorLog(errorResult);

    return errorResult;
  }
}
