import { AuthRoutes } from './../routes/auth.routes';
import * as express from "express";
import dotenv from "dotenv";
import * as parser from "body-parser";
import * as framework from "swt-framework";

import { IndexRoutes } from "../routes/index.route";
import trafficControl from '../shared/network/traffic-control';

declare function require(moduleName: string): any;

class Server {
  public express;

  constructor() {
    this.express = express();
    this.ApplySettings();
    this.ConfigurateRoutes();
  }

  private ApplySettings() {
    const dotenv: any = require("dotenv");

    if (process.env.NODE_ENV == "production") {
      dotenv.config({ path: __dirname + "\\settings\\prod.env" });
    } else {
      dotenv.config({ path: __dirname + "\\settings\\dev.env" });
    }

    //Configurando o body parser
    this.express.use(parser.json());
    this.express.use(parser.urlencoded({ extended: true }));

    //Configurando Pre-Flight
    this.express.use(framework.security.enablePreflight);

    //Configurando Inspetores de Chamadas
    this.express.use(trafficControl.CheckPostBody);
    this.express.use(trafficControl.LogRequest);
  }

  private ConfigurateRoutes() {
    const indexRoutes = new IndexRoutes();
    const authRoutes = new AuthRoutes();

    this.express.use("/", indexRoutes.router);
    this.express.use("/api/auth", authRoutes.router);
    // this.express.use("/api/auth", authRoutes.router);
    // this.express.use("/api/admin", adminRoutes.router);
  }
}

export default new Server().express;
