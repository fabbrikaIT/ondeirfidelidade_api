import { Request } from "express";


export class NetworkLog {
    public id: number;
    public date: Date;
    public method: string;
    public host: string;
    public service: string;
    public body: string;

    constructor(req: Request) {
        this.date = new Date();
        this.method = req.method;
        this.host = req.ip;
        this.service = req.path;
        this.body = JSON.stringify(req.body);
    }
}