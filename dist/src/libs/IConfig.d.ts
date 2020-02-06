import { Protocol } from "./constants";
export interface IConfigApi {
    protocol: Protocol;
    host: string;
    pathPrefix: string;
    configurationKey: string;
    httpAgent: {
        rejectUnauthorized: boolean;
    };
}
