
export class ServiceResult {
    public ErrorCode: string = "";
    public ErrorMessage: string = "";
    public ErrorDetails: string = "";
    public Executed: boolean = true;    
    public Result: any;

    public static HandlerError(error) : ServiceResult {
        const result: ServiceResult = new ServiceResult();

        result.ErrorCode = "ERR999";
        result.ErrorMessage = JSON.stringify(error);
        result.Executed = false;

        return result;
    }

    public static HandlerSucess() : ServiceResult {
        const result: ServiceResult = new ServiceResult();

        result.ErrorCode = "";
        result.ErrorMessage = ""
        result.Executed = true;

        return result;
    }
}