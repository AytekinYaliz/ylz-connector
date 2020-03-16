"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger = require("@ylz/logger");
function parseAxiosError(err) {
    let errLog = {
        message: err.message,
        response: undefined,
        request: undefined
    };
    try {
        if (err.response) {
            errLog.response = {
                status: err.response.status,
                data: err.response.data
            };
        }
        else if (err.request) {
            errLog.request = Object.assign({}, (err.request._options && {
                options: {
                    headers: err.request._options.headers,
                    hostname: err.request._options.hostname,
                    method: err.request._options.method,
                    path: err.request._options.path,
                    port: err.request._options.port,
                    protocol: err.request._options.protocol
                }
            }));
        }
        else {
            errLog = err;
        }
        return errLog;
    }
    catch (e) {
        logger.error("dan-connector.parseAxiosError - Error while parsing the error:", e, err);
        return err;
    }
}
exports.parseAxiosError = parseAxiosError;
//# sourceMappingURL=utilities.js.map
