import express = require("express");
import { Logger } from "./logger";
import { Server } from "socket.io";
import { handleSocket } from "./socketHandler";
import * as path from "path";
import * as http from "http";
const app = express();

app.use(Logger);
app.use(express.static(path.join(__dirname, "..")));

const httpServer = http.createServer(app);
const socketServer = new Server(httpServer);

httpServer.listen(7000);
console.log("talking rooms server started at " + 7000);
handleSocket(socketServer);
