
export class ServiceResult {
    public ErrorCode: string;
    public ErrorMessage: string;
    public Result: any;

    public static HandlerError(error) : ServiceResult {
        const result: ServiceResult = new ServiceResult();

        result.ErrorMessage = error.json();
        result.Result = false;

        return result;
    }
}