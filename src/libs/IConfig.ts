import { HttpMethod, Protocol } from "./constants";


// export interface IConfigAuth {
//    baseURL: string;
//    url: string;
//    method: HttpMethod,
//    data: {
//       username: string;
//       password: string;
//    }
// }

export interface IConfigApi {
   protocol: Protocol;
	host: string;
   pathPrefix: string;
   configurationKey: string;
	httpAgent: {
      rejectUnauthorized: boolean;
   }
}
