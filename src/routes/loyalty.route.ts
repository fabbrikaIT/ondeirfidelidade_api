import { BaseRoute } from "./base.routes";
import { LoyaltyController } from "../controllers/loyalty.controller";

export class LoyaltyRoutes extends BaseRoute {
    private controller = new LoyaltyController();

  constructor() {
    super();

    this.buildRoutes();
  }

  private buildRoutes() {
    this.router.get("/:id", this.controller.GetLoyalty);
    this.router.get("/list/:owner", this.controller.ListLoyalty);
    this.router.get("/list/:owner/:status", this.controller.ListLoyaltyStatus);

    this.router.post("/", this.controller.CreateLoyalty);
    this.router.post("/activate", this.controller.ActivateLoyalty);
    this.router.post("/deactivate", this.controller.DeactivateLoyalty);

    this.router.put("/", this.controller.UpdateLoyalty);
    this.router.delete("/:id", this.controller.DeleteLoyalty);
  }
}
