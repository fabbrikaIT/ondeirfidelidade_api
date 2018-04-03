import { OwnerController } from './../controllers/owner.controller';
import { BaseRoute } from "./base.routes";

export class OwnerRoutes extends BaseRoute {
    private controller: OwnerController = new OwnerController();
  
    constructor() {
    super();

    this.buildRoutes();
  }

  private buildRoutes() {
    this.router.get("/:id", this.controller.getOwner);
    this.router.get('/', this.controller.listOwners);
    this.router.get('/list/:cityId', this.controller.listOwners);
    
    this.router.post('/', this.controller.createOwner);    
    this.router.post('/reset', this.controller.resetPassword);
    this.router.post('/updatePassword', this.controller.updatePassword);

    this.router.put('/', this.controller.updateOwner);
    this.router.delete('/:id', this.controller.deleteOwner);
  }
}
