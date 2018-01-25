import * as express from "express";
import { BaseRoute } from "./base.routes";

export class IndexRoutes extends BaseRoute {
  constructor() {
    super();

    this.router.get("/", (req, res) => {
      res.send(this.getVersion());
    });
  }
}
