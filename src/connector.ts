import axios, { AxiosRequestConfig } from "axios";

export interface HTTPConnector {
  requestApi(options: AxiosRequestConfig): Promise<any>;
}

export class Connector implements HTTPConnector {
  private static instance: Connector;

  private constructor() {}

  static getInstance(): Connector {
    if (!Connector.instance) {
      Connector.instance = new Connector();
    }

    return Connector.instance;
  }

  requestApi(options: AxiosRequestConfig): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        resolve((<any>await axios(options)).data);
      } catch (err) {
        reject(err);
      }
    });
  }
}
