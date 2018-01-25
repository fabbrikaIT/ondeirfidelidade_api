import { ServiceResult } from './../../models/serviceResult.model';
import logProvider from '../../shared/log/log-provider';
import { ApplicationLog, ELogType } from '../../shared/log/app-log.model';
export enum EAuthErrors {
    InvalidUserOrPassword = 1
}

export class AuthErrorsProvider {
    public static GetError(error: EAuthErrors) {
        const errorResult: ServiceResult = new ServiceResult();

        switch (error) {
            case EAuthErrors.InvalidUserOrPassword:
                errorResult.ErrorCode = "AUTH001";
                errorResult.ErrorMessage = "Invalid Username or Password";
                break;
        
            default:
                break;
        }

        logProvider.SetErrorLog(errorResult);

        return errorResult;
    }
}