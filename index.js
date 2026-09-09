import express from "express";
import http from "http";
import compression from "compression";
import "dotenv/config";
import path from "node:path";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";

const port = parseInt(process.env.PORT || "2100");

const app = express();
const __dirname = process.cwd();
const publicPath = path.join(__dirname, "public");

const scramjetPath = path.join(process.cwd(), "node_modules/@mercuryworkshop/scramjet/dist");
const controllerPath = path.join(process.cwd(), "node_modules/@mercuryworkshop/scramjet-controller/dist");
const utilsPath = path.join(process.cwd(), "node_modules/@mercuryworkshop/scramjet-utils/dist");
const epoxyPath = path.join(process.cwd(), "node_modules/@mercuryworkshop/epoxy-transport/dist");

app.use(compression());
app.use(express.json());

app.use("/scram", express.static(scramjetPath));
app.use("/controller", express.static(controllerPath));
app.use("/utils", express.static(utilsPath));
app.use("/epoxy", express.static(epoxyPath));

app.use(express.static(publicPath));

app.get("/", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
});

app.get("/null", (req, res) => {
    res.sendFile(path.join(publicPath, "start.html"));
});

app.get("/check-domain", (req, res) => {
    res.sendStatus(200);
});

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

app.use((req, res) => {
    res.status(404).send("404");
});

const server = http.createServer(app);

server.on("upgrade", (req, socket, head) => {
    const url = new URL(req.url || "/", "http://localhost");

    if (url.pathname === "/wisp/") {
        req.url = url.pathname;
        wisp.routeRequest(req, socket, head);
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

console.log("scramjetPath:", scramjetPath);
console.log("controllerPath:", controllerPath);
console.log("utilsPath:", utilsPath);
console.log("epoxyPath:", epoxyPath);

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server.listen(port);