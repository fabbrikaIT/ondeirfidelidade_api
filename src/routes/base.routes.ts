import * as express from "express";
var pjson = require("../../package.json");

export class BaseRoute {
    public router = express.Router();

    protected getVersion() {
        return pjson.description + " - Version: " + pjson.version;
    }
}