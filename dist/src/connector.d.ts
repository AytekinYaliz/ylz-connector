import { AxiosRequestConfig } from "axios";
export interface HTTPConnector {
    requestApi(options: AxiosRequestConfig): Promise<any>;
}
export declare class Connector implements HTTPConnector {
    private static instance;
    private constructor();
    static getInstance(): Connector;
    requestApi(options: AxiosRequestConfig): Promise<any>;
}
