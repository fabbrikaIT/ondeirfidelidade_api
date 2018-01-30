export interface IToMysqlDbEntity {
    toMysqlDbEntity(isNew: boolean): any;
    fromMySqlDbEntity(dbentity: any);
}