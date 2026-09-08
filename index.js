import express from "express";
import http from "http";
import compression from "compression";
import "dotenv/config";
import path from "node:path";

import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { createBareServer } from "@tomphttp/bare-server-node";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";

let port = parseInt(process.env.PORT || "");
if (isNaN(port)) port = 2100;

const app = express();
const bare = createBareServer("/bare/");
const __dirname = process.cwd();
const publicPath = path.join(__dirname, "public");

app.use(compression());
app.use(express.json());

app.get("/", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
});

app.get("/null", (req, res) => {
    res.sendFile(path.join(publicPath, "start.html"));
});

app.get("/uv/uv.bundle.js", (req, res) => {
    res.sendFile(path.join(uvPath, "uv.bundle.js"));
});

app.get("/uv/uv.client.js", (req, res) => {
    res.sendFile(path.join(uvPath, "uv.client.js"));
});

app.get("/uv/uv.handler.js", (req, res) => {
    res.sendFile(path.join(uvPath, "uv.handler.js"));
});

app.get("/uv/uv.sw.js", (req, res) => {
    res.sendFile(path.join(uvPath, "uv.sw.js"));
});

app.get("/uv/uv.config.js", (req, res) => {
    res.sendFile(path.join(publicPath, "uv", "uv.config.js"));
});

app.get("/uv/sw.js", (req, res) => {
    res.setHeader("Service-Worker-Allowed", "/");
    res.sendFile(path.join(publicPath, "uv", "sw.js"));
});
app.use(express.static(publicPath));
app.get("/baremux/index.js", (req, res) => {
    res.sendFile(path.join(baremuxPath, "index.js"));
});

app.get("/baremux/worker.js", (req, res) => {
    res.sendFile(path.join(baremuxPath, "worker.js"));
});
app.use("/uv/", express.static(uvPath));
app.use("/epoxy/", express.static(epoxyPath));

app.get("/go=:query", async (req, res) => {
    try {
        const reply = await fetch(
            `http://api.duckduckgo.com/ac/?q=${encodeURIComponent(req.params.query)}&format=json`
        );

        res.json(await reply.json());
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch suggestions" });
    }
});

app.use((req, res, next) => {
    if (req.url.startsWith("/uv/service/")) {
        console.log("UV:", req.method, req.url);
    }
    next();
});
app.use((req, res) => {
    res.status(404).send("404");
});

const server = http.createServer((req, res) => {
    if (bare.shouldRoute(req)) {
        bare.routeRequest(req, res);
        return;
    }

    app(req, res);
});

server.on("upgrade", (req, socket, head) => {
    if (req.url?.startsWith("/wisp/")) {
        wisp.routeRequest(req, socket, head);
        return;
    }

    if (bare.shouldRoute(req)) {
        bare.routeUpgrade(req, socket, head);
        return;
    }

    socket.end();
});

server.on("listening", () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Wisp running on ws://localhost:${port}/wisp/`);
});

function shutdown() {
    console.log("Closing server...");
    server.close();
    process.exit(0);
}

console.log("uvPath:", uvPath);
console.log("baremuxPath:", baremuxPath);
console.log("epoxyPath:", epoxyPath);

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server.listen(port);