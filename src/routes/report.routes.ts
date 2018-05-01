import { ReportsController } from './../controllers/reports.controller';
import { OwnerController } from './../controllers/owner.controller';
import { BaseRoute } from "./base.routes";

export class ReportsRoutes extends BaseRoute {
    private controller: ReportsController = new ReportsController();

    constructor() {
    super();

    this.buildRoutes();
  }

  private buildRoutes() {
    
    // Interfaces de indicadores 
    this.router.get('/dashboard/loyalties/:ownerId', this.controller.GetLoyaltiesNumber);
    this.router.get('/dashboard/offers/:ownerId', this.controller.GetOffersNumber);
    this.router.get('/dashboard/clients/:ownerId', this.controller.GetClientsNumber);
    this.router.get('/dashboard/coupons/:ownerId', this.controller.GetCouponsNumber);

    //Interfaces de Relatórios
    this.router.get('/loyaltyprogram/:ownerId/:cityId?', this.controller.ListLoyaltyPrograms);
    this.router.get('/coupons/:ownerId/:cityId?', this.controller.ListCoupons);
    this.router.get('/clients/:ownerId/:cityId?', this.controller.ListClients);
  }
}
