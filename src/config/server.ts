import * as express from "express";
import dotenv from "dotenv";
import * as parser from "body-parser";
import * as framework from "swt-framework";
import * as expressValidator from "express-validator";

import { IndexRoutes } from "../routes/index.route";
import trafficControl from "../shared/network/traffic-control";
import { OwnerRoutes } from "../routes/owner.routes";
import { LoyaltyRoutes } from "../routes/loyalty.route";
import { OffersRoutes } from "../routes/offers.routes";
import { AuthRoutes } from "./../routes/auth.routes";
import { ReportsRoutes } from "../routes/report.routes";

declare function require(moduleName: string): any;

class Server {
  public express;
  private apiVersion: string = "/v0";

  constructor() {
    this.express = express();
    this.ApplySettings();
    this.ConfigurateRoutes();
  }

  private ApplySettings() {
    const dotenv: any = require("dotenv");

    // Linux
    // -----------------------------------------------------------------
    // if (process.env.NODE_ENV == "production") {
    //   dotenv.config({ path: __dirname + "/settings/prod.env" });
    // } else {
    //   dotenv.config({ path: __dirname + "/settings/dev.env" });
    // }

    // Windows
    // -----------------------------------------------------------------
    if (process.env.NODE_ENV == "production") {
        dotenv.config({ path: __dirname + "\\settings\\prod.env" });
    }
    else {
        dotenv.config({ path: __dirname + "\\settings\\dev.env" });
    }

    //Configurando o body parser
    this.express.use(parser.json({limit: '50mb'}));
    this.express.use(parser.urlencoded({ extended: true, limit: '50mb' }));

    //Configurando Pre-Flight
    this.express.use(framework.security.enablePreflight);

    /* configurar o middleware express-validator para validação de dados */
    this.express.use(expressValidator());

    //Configurando Inspetores de Chamadas
    this.express.use(trafficControl.CheckPostBody);
    this.express.use(trafficControl.LogRequest);

    // Configurando status de retorno
    this.express.use(trafficControl.SetStatusCode);
  }

  private ConfigurateRoutes() {
    const indexRoutes = new IndexRoutes();
    const authRoutes = new AuthRoutes();
    const ownerRoutes = new OwnerRoutes();
    const loyaltyRoutes = new LoyaltyRoutes();
    const offersRoutes = new OffersRoutes();
    const reportsRoutes = new ReportsRoutes();

    // Rota raiz - Controle de Versão
    this.express.use("/", indexRoutes.router);
    // Rota com as interfaces de Autenticação
    this.express.use(this.apiVersion + "/auth", authRoutes.router);
    // Rota com as interfaces de manipulação de clientes (estabelecimentos)
    this.express.use(this.apiVersion + "/owner", ownerRoutes.router);
    // Rota com as interfaces de manipulação de programas de fidelidade
    this.express.use(this.apiVersion + "/loyalty", loyaltyRoutes.router);
    // Rota com as interfaces de manipulação de ofertas e descontos
    this.express.use(this.apiVersion + "/offers", offersRoutes.router);
    // Rota com as interfaces de indicadores e relatórios
    this.express.use(this.apiVersion + "/reports", reportsRoutes.router);
  }
}

export default new Server().express;
