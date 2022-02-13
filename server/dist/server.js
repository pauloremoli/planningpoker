"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const socket_1 = __importDefault(require("./socket"));
const PORT = process.env.APP_PORT;
app_1.httpServer.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
    (0, socket_1.default)({ io: app_1.io });
});
process.on("SIGTERM", () => {
    console.log("Closing HTTP server");
    (0, app_1.closeServer)();
});
//# sourceMappingURL=server.js.map