import { OffersController } from './../controllers/offers.controller';
import { BaseRoute } from "./base.routes";

export class OffersRoutes extends BaseRoute {
    private controller = new OffersController();

  constructor() {
    super();

    this.buildRoutes();
  }

  private buildRoutes() {
    // Interfaces de busca de programas de fidelidade
    this.router.get("/search/:cityId", this.controller.SearchOffersByCity);

    this.router.get("/:id", this.controller.GetOffers);
    this.router.get("/user/:id", this.controller.ListUserCoupons);
    this.router.get("/list/:owner", this.controller.ListOffers);
    this.router.get("/list/:owner/:status", this.controller.ListOffersStatus);
    this.router.get("/:qrHash/:userId", this.controller.GetCoupon);

    this.router.post("/", this.controller.CreateOffer);
    this.router.post('/createCoupon', this.controller.createCoupon);
    this.router.post("/activate", this.controller.ActiveOffer);
    this.router.post("/deactivate", this.controller.InativateOffer);
    this.router.post("/useCoupon", this.controller.UseCoupon);

    this.router.put("/", this.controller.UpdateOffer);
    this.router.delete("/:id", this.controller.DeleteOffer);
  }
}
