const path = require("path");
const { createRequestHandler } = require("@remix-run/netlify");

const BUILD_DIR = path.join(process.cwd(), "netlify");

function purgeRequireCache() {
    // purge require cache on requests for "server side HMR" this won't let
    // you have in-memory objects between requests in development,
    // netlify typically does this for you, but we've found it to be hit or
    // miss and some times requires you to refresh the page after it auto reloads
    // or even have to restart your server
    for (const key in require.cache) {
        if (key.startsWith(BUILD_DIR)) {
            delete require.cache[key];
        }
    }
}

exports.handler =
    process.env.NODE_ENV === "production"
        ? createRequestHandler({ build: require(BUILD_DIR) })
        : (event, context) => {
              purgeRequireCache();
              return createRequestHandler({
                  build: require(BUILD_DIR)
              })(event, context);
          };

/*
const path = require("path");
const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const { createRequestHandler } = require("@remix-run/express");

const BUILD_DIR = path.join(process.cwd(), "build");

const app = express();

app.use(
    compression({
        filter: (req) => req.headers["Content-Type"]?.startsWith("text/event-stream")
    })
);

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
app.use("/build", express.static("public/build", { immutable: true, maxAge: "1y" }));

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1h" }));

app.use(morgan("tiny"));

app.all(
    "*",
    process.env.NODE_ENV === "development"
        ? (req, res, next) => {
              purgeRequireCache();

              return createRequestHandler({
                  build: require(BUILD_DIR),
                  mode: process.env.NODE_ENV
              })(req, res, next);
          }
        : createRequestHandler({
              build: require(BUILD_DIR),
              mode: process.env.NODE_ENV
          })
);
const port = process.env.PORT || 6112;

app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
});

function purgeRequireCache() {
    // purge require cache on requests for "server side HMR" this won't let
    // you have in-memory objects between requests in development,
    // alternatively you can set up nodemon/pm2-dev to restart the server on
    // file changes, but then you'll have to reconnect to databases/etc on each
    // change. We prefer the DX of this, so we've included it for you by default
    for (let key in require.cache) {
        if (key.startsWith(BUILD_DIR)) {
            delete require.cache[key];
        }
    }
}
 */
