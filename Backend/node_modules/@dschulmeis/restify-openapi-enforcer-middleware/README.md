# Restify Middleware for OpenAPI Enforcer

## Short description

This is a tiny package to provide a middleware for [Restify](http://restify.com/)
to validate incomming HTTP requests and their responses against an OpenAPI
specification. Basically this is a replacement for the similar
[Express.js](https://expressjs.com/) middleware
[openapi-enforcer-middleware](https://www.npmjs.com/package/openapi-enforcer-middleware),
albeit much simpler and a bit less powerful.

The problem with `openapi-enforder-middleware` (or Restify, if you will) is
that while both Express.js and Restify use Sinatra-style handlers and middleware,
the request and response obejcts are not compatible. In theory it would be possible
to wrap the `openapi-enforder-middleware` in a wrapper function that patches
the request object as needed, but there is no guarantee that this will remain
working in the future, as both projects could change anytime.

So the solution here is to provide a small middleware specificaly for Restify.
The goal is only to validate requests and responses. So I didn't bother to
actually port the Express.js middleware over, but just wrote a small function
myself using the `openapi-enforcer` API.

## Why?

You can skip this and jump right to the usage example, if you are not interested
in the background musings.

I am using this middleware in my lectures for "Distributed Systems" in the
bachelor study course "Business Computer Science" of "Corporate State University
Baden-Württemberg Karlsruhe (DHBW Karlsruhe)". I chose Restify over Express.js
as it is more tailored torwards REST webservices and I like the concept of the
pre and post handlers as well as how content negotation and errors are handled.
All in all this allows for a very easy means to start developing one's own
REST webservices without much magic, which is good if you are teaching junior
students.

Part of the lecture is to demonstrate a "design first" approach where first
the OpenAPI specification is written and the webservice is then implemented
accordingly. Originaly I was even hoping to generete the server-code from
the OpenAPI specification. And while this is possible, all solutions proved
non-satisfying. There are almost no generators that output node.js/javascript
code and if there are, the code is of poor quality. Not the kind of spagethi
code I like to teach my students. So I decided to teach writing the server
by hand, which actually is not hard at all. But then of course it would be
useful to benefit from the OpenAPI specification more than it being merely
a blueprint documentation. So the least thing is, that requests and responses
need to be automatically verified.

`openapi-enforder-middleware` and others offer auto-wiring of controllers
and handler methods. But this requires to disclose implementation details
(the names of the controllers and their methods) in the OpenAPI specification,
which really should be a binding and public documentation. But even if we
accept that, there is really no benefit. What's the win if I don't need to
repeat the URL patterns in my JavaScript code, but I need to repeat my
controller and method names in the OpenAPI specification? Or I keep the
specification clean and retype the URL patterns in JavaScript. In any case,
the two are not independent of each other and changing the one requires
updating the other. That's why I decided to not port these kind of features
over from the original middleware.

The same goes for generating a HTML api documentation. In a real-world
microservice architecture this would be handled by a dedicated documentation
or API portal server anyway. So let's not carry that weight around. Remember,
the less code, the less bugs and thus less frustration.

## Usage

The middleware expects an already initialized `OpenApiEnforcer` instance,
so that you have a chance to customize the object or handle warnings and
errors from reading the OpenAPI specification file. The following example
shows how to do this:

```javascript
import OpenApiEnforcer from "openapi-enforcer";
import OpenApiEnforcerMiddleware from "@dschulmeis/restify-openapi-enforcer-middleware";

// Replacement for node.js dirname in ES6 modules
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create restify server and populate it with plugins, middleware and routes
// as usual
const server = restify.createServer();

// Use OpenAPI Enforcer Middleware to validate requests and responses
const openApiFile = path.relative("", path.join(__dirname, "api", "openapi.yaml"));
const openApiValidation = await OpenApiEnforcer(openApiFile, {fullResult: true});

const openApiEnforcer = await OpenApiEnforcer(openApiFile, {
    hideWarnings: true,
    componentOptions: {
        production: process.env.NODE_ENV === "production"
    },
});

server.use(OpenApiEnforcerMiddleware(openApiEnforcer));

// Example for a validated route
server.post("/address", (req, res, next) => {
    res.status(201);
    res.header("Location", "...");

    // Use sendResult() instead of send()!
    res.sendResult({
        // ...
    });
});

// Actually start the server and log errors and warnings from reading in the
// OpenAPI specifcation file
server.listen(config.port, config.host, function() {
    console.log("Server started!");
    console.log(`OpenAPI-Spezifikation: ${openApiFile}`)

    if (openApiValidation.error) {
        console.error(`${openApiValidation.error}\n`);
    }

    if (openApiValidation.warning) {
        console.warn(`${openApiValidation.warning}\n`);
    }

    console.log();
});
```

## Copyright

[restify-openapi-enforcer-middleware](https://www.github.com/DennisSchulmeister/restify-openapi-enforcer-middleware) <br/>
© 2022 Dennis Schulmeister-Zimolong <dennis@pingu-mail.de> <br/>
Licensed under the 2-Clause BSD License.
