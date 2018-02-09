import { ServiceResult } from "../../models/serviceResult.model";
import logProvider from "../../shared/log/log-provider";

export enum EOwnerErrors {
  InvalidOwnerRequiredParams = 1,
  EmailAlreadyExists = 2,
  InvalidOwnerId = 3,
  LogoUploadError = 4,
}

export class OwnerErrorsProvider {
  public static GetError(error: EOwnerErrors) {
    const errorResult: ServiceResult = new ServiceResult();
    errorResult.Executed = false;

    switch (error) {
        case EOwnerErrors.InvalidOwnerRequiredParams:
            errorResult.ErrorCode = "OWN001";
            errorResult.ErrorMessage = "Parâmetros de cliente obrigatórios nulos ou inválidos";
            break;
        case EOwnerErrors.EmailAlreadyExists:
            errorResult.ErrorCode = "OWN002";
            errorResult.ErrorMessage = "Já existe um cadastro para o e-mail informado";
            break;
        case EOwnerErrors.InvalidOwnerId:
            errorResult.ErrorCode = "OWN003";
            errorResult.ErrorMessage = "Código de identificação de cliente inválido";
            break;
        case EOwnerErrors.LogoUploadError:
          errorResult.ErrorCode = "OWN004";
          errorResult.ErrorMessage = "O Cliente foi criado com sucesso, porém ocorreu um erro no upload da imagem."
      default:
        break;
    }

    logProvider.SetErrorLog(errorResult);

    return errorResult;
  }

  public static GetErrorDetails(error: EOwnerErrors, details: any) {
    const errorResult = this.GetError(error);
    errorResult.ErrorDetails = JSON.stringify(details);

    return errorResult;
  }

}
