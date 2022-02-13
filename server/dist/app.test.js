"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importStar(require("./app"));
const supertest = require("supertest");
afterAll(() => {
    (0, app_1.closeServer)();
});
afterEach(() => {
    (0, app_1.cleanCache)();
});
describe("Test server", () => {
    test("Path / should return server up", () => {
        return supertest(app_1.default)
            .get("/")
            .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.text).toBe("Server up");
        })
            .catch((error) => {
            fail(error);
        });
    });
});
describe("Create room tests", () => {
    test("/createRoom should create a room with given deck configuration", () => {
        return supertest(app_1.default)
            .post("/createRoom")
            .send({ deck: [0, 1, 2, 3] })
            .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("roomId");
        });
    });
    test("/createRoom should fail without deck configuration", () => {
        return supertest(app_1.default)
            .post("/createRoom")
            .send({})
            .then((response) => {
            expect(response.statusCode).toBe(500);
            expect(response.body.error).toContain("Parameter deck is required");
        });
    });
    test("/createRoom should fail with empty deck configuration", () => {
        return supertest(app_1.default)
            .post("/createRoom")
            .send({ deck: [], roomOwner: "1" })
            .then((response) => {
            expect(response.statusCode).toBe(500);
            expect(response.body.error).toContain("Parameter deck is required");
        });
    });
});
describe("Room tests", () => {
    test("/room with existing room id should return the full room configuration", () => {
        const deck = [0, 1, 2, 3];
        const roomOwner = "1";
        return supertest(app_1.default)
            .post("/createRoom")
            .send({
            deck,
        })
            .then((response) => {
            const roomId = response.body.roomId;
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("roomId");
            return supertest(app_1.default)
                .get(`/room/?roomId=${roomId}`)
                .then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body.deck).toStrictEqual(deck);
                expect(response.body.roomOwner).toStrictEqual(roomOwner);
            });
        });
    });
    test("/room should fail with an non existing room", () => {
        return supertest(app_1.default)
            .get(`/room/?roomId=22`)
            .then((response) => {
            expect(response.statusCode).toBe(500);
            expect(response.body.error).toContain("Room id (22) not found");
        });
    });
    test("/room should fail without a room id", () => {
        return supertest(app_1.default)
            .get(`/room/`)
            .then((response) => {
            expect(response.statusCode).toBe(500);
            expect(response.body.error).toContain("Parameter roomId is required");
        });
    });
});
describe("/addStory tests", () => {
    let roomId;
    beforeEach(() => {
        const deck = [0, 1, 2, 3];
        const roomOwner = "1";
        return supertest(app_1.default)
            .post("/createRoom")
            .send({
            deck,
            roomOwner,
        })
            .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("roomId");
            roomId = response.body.roomId;
        });
    });
    test("/addStory should fail without room id", () => {
        return supertest(app_1.default)
            .post(`/addStory`)
            .then((response) => {
            expect(response.statusCode).toBe(500);
            expect(response.body.error).toContain("Parameter roomId is required");
        });
    });
    test("/addStory should fail without story data", () => {
        return supertest(app_1.default)
            .post(`/addStory`)
            .send({ roomId })
            .then((response) => {
            expect(response.statusCode).toBe(500);
            expect(response.body.error).toContain("Parameter story is required");
        });
    });
    test("/addStory should fail without story name", () => {
        return supertest(app_1.default)
            .post("/addStory")
            .send({
            roomId,
            story: {
                description: "desc",
            },
        })
            .then((response) => {
            expect(response.statusCode).toBe(500);
            expect(response.body.error).toContain("Parameter story.name is required");
        });
    });
    test("/addStory should register given story to the room data", () => {
        const deck = [0, 1, 2, 3];
        const roomOwner = "1";
        return supertest(app_1.default)
            .post("/addStory")
            .send({
            roomId,
            story: { name: "Story 1", description: "Do your job" },
        })
            .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.body.deck).toStrictEqual(deck);
            expect(response.body.roomOwner).toStrictEqual(roomOwner);
        });
    });
});
//# sourceMappingURL=app.test.js.map