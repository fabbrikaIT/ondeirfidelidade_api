import { BaseEntity } from "../base.model";
import { IToMysqlDbEntity } from "../iToMysqlDbEntity";

export class LoyaltyUsageType extends BaseEntity implements IToMysqlDbEntity {
  public id: number;
  public usageGoal: number;
  public usageReward: string;

  public static getInstance(): LoyaltyUsageType {
    const instance = new LoyaltyUsageType();

    return instance;
  }

  toMysqlDbEntity(isNew: boolean) {
    if (isNew) {
      return {
        ID: this.id,
        USAGE_GOAL: this.usageGoal,
        USAGE_REWARD: this.usageReward
      };
    } else {
      return {
        USAGE_GOAL: this.usageGoal,
        USAGE_REWARD: this.usageReward
      };
    }
  }
  fromMySqlDbEntity(dbentity: any) {
    this.id = dbentity.ID;
    this.usageGoal = dbentity.USAGE_GOAL;
    this.usageReward = dbentity.USAGE_REWARD;
  }
}
