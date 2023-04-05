// © 2002 Dennis Schulmeister-Zimolong <dennis@pingu-mobil.de>
// Licensed under the 2-clause BSD Licensed

import RestifyError from "restify-errors";

/**
 * Factory function for a tiny Restify middleware to validate all incomming
 * requests and outgoing responses against an OpenAPI specification. For this
 * the response object is patched to provide a new `sendResult()` method that
 * validates the result before sending it. The request is automatically checked
 * without changes to the Restify API.
 *
 * @param {Object} openApiEnforcer OpenApiEnforcer instance
 * @return {Function} Middleware function for Restify
 */
export default function OpenApiEnforcerMiddleware(openApiEnforcer) {
    return (req, res, next) => {
        // Don't break the CORS OPTIONS pre-flight
        if (req.method === "OPTIONS") {
            next();
            return;
        }

        // Validate requests against the OpenAPI specification
        let requestData = {
            method: req.method,
            path: req.href(),
            headers: req.headers,
        };

        if (req.body) {
            requestData.body = req.body;
        }

        let request = openApiEnforcer.request(requestData);

        if (request.error) {
            res.status(400);
            next(new RestifyError.BadRequestError(request.error.message().toString()));
            return;
        }

        // Patch response object to allow validation of the response before it
        // is sent. For this, the HTTP handler functions simply need to call
        // `res.sendResult()` instead of `res.send()` with the response body.
        // This was chosen because it is much easier and stable than to patch
        // the `send()` method itself.
        res.sendResult = (code, body, headers) => {
            if (typeof code !== "number") {
                // Function was called without a status code, probably only
                // with the response body
                headers = body;
                body = code;
                code = 0;
            }

            code = code || res.statusCode || 200;

            if (typeof headers !== "array") {
                headers = res.getHeaders();
            } else {
                headers = headers.concat(res.getHeaders());
            }

            body = JSON.parse(JSON.stringify(body));
            let response = request.value.response(code, body, headers);

            if (response.error) {
                throw new RestifyError.InternalError(response.error.message().toString());
            }

            res.send(code, body, headers);
        };

        next();
    };
}
