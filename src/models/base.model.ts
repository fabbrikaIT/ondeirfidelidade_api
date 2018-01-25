
export abstract class BaseEntity {
    public Map(objData: any) {
        Object.assign(this, objData);
    }
}