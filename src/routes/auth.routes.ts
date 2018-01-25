import { AuthController } from './../controllers/auth.controller';
import { BaseRoute } from "./base.routes";

export class AuthRoutes extends BaseRoute {
    private controller: AuthController = new AuthController();
  
    constructor() {
    super();

    this.buildRoutes();
  }

  private buildRoutes() {
    this.router.post("/", this.controller.OwnerLogin);
    this.router.post("/admin", this.controller.AdminLogin);
    this.router.post("/user", this.controller.UserLogin);
  }
}
