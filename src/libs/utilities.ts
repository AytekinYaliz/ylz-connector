import * as logger from "@dan/dan-logger";

export function parseAxiosError(err) {
  let errLog = {
    message: err.message,
    response: undefined,
    request: undefined
  };

  try {
    if (err.response) {
      /*
       * The request was made and the server responded with a
       * status code that falls out of the range of 2xx
       */
      errLog.response = {
        status: err.response.status,
        data: err.response.data
      };
    } else if (err.request) {
      /*
       * The request was made but no response was received, `error.request`
       * is an instance of XMLHttpRequest in the browser and an instance
       * of http.ClientRequest in Node.js
       */
      errLog.request = {
        ...(err.request._options && {
          options: {
            headers: err.request._options.headers,
            hostname: err.request._options.hostname,
            method: err.request._options.method,
            path: err.request._options.path,
            port: err.request._options.port,
            protocol: err.request._options.protocol
          }
        })
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      errLog = err;
    }

    return errLog;
  } catch (e) {
    logger.error("dan-connector.parseAxiosError - Error while parsing the error:", e, err);

    return err;
  }
}
