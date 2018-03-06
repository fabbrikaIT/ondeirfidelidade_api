import { BaseRoute } from "./base.routes";
import { LoyaltyController } from "../controllers/loyalty.controller";

export class LoyaltyRoutes extends BaseRoute {
    private controller = new LoyaltyController();

  constructor() {
    super();

    this.buildRoutes();
  }

  private buildRoutes() {
    // Interfaces de busca de programas de fidelidade
    this.router.get("/search/:cityId", this.controller.SearchLoyaltyByCity);

    this.router.get("/:id", this.controller.GetLoyalty);
    this.router.get("/user/:id", this.controller.ListUserLoyalty);
    this.router.get("/list/:owner", this.controller.ListLoyalty);
    this.router.get("/list/:owner/:status", this.controller.ListLoyaltyStatus);

    this.router.post("/", this.controller.CreateLoyalty);
    this.router.post("/activate", this.controller.ActivateLoyalty);
    this.router.post("/deactivate", this.controller.DeactivateLoyalty);

    this.router.put("/", this.controller.UpdateLoyalty);
    this.router.delete("/:id", this.controller.DeleteLoyalty);

    // Interfaces de pontuação e consulta 
    this.router.post("/apply", this.controller.ApplyLoyalty);
    this.router.post("/redeem", this.controller.RedeemLoyaltyAward);
    this.router.get("/:qrHash/:userId", this.controller.GetLoyaltyProgram);
  }
}
