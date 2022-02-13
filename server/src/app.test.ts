import app, { closeServer, cleanCache } from "./app";
const supertest = require("supertest");

afterAll(() => {
    closeServer();
});

afterEach(() => {
    cleanCache();
});

describe("Test server", () => {
    test("Path / should return server up", () => {
        return supertest(app)
            .get("/")
            .then((response: any) => {
                expect(response.statusCode).toBe(200);
                expect(response.text).toBe("Server up");
            })
            .catch((error: any) => {
                fail(error);
            });
    });
});

describe("Create room tests", () => {
    test("/createRoom should create a room with given deck configuration", () => {
        return supertest(app)
            .post("/createRoom")
            .send({ deck: [0, 1, 2, 3] })
            .then((response: any) => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty("roomId");
            });
    });

    test("/createRoom should fail without deck configuration", () => {
        return supertest(app)
            .post("/createRoom")
            .send({})
            .then((response: any) => {
                expect(response.statusCode).toBe(500);
                expect(response.body.error).toContain(
                    "Parameter deck is required"
                );
            });
    });

    test("/createRoom should fail with empty deck configuration", () => {
        return supertest(app)
            .post("/createRoom")
            .send({ deck: [], roomOwner: "1" })
            .then((response: any) => {
                expect(response.statusCode).toBe(500);
                expect(response.body.error).toContain(
                    "Parameter deck is required"
                );
            });
    });
});

describe("Room tests", () => {
    test("/room with existing room id should return the full room configuration", () => {
        const deck = [0, 1, 2, 3];
        const roomOwner = "1";
        return supertest(app)
            .post("/createRoom")
            .send({
                deck,
            })
            .then((response: any) => {
                const roomId = response.body.roomId;
                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty("roomId");

                return supertest(app)
                    .get(`/room/?roomId=${roomId}`)
                    .then((response: any) => {
                        expect(response.statusCode).toBe(200);
                        expect(response.body.deck).toStrictEqual(deck);
                        expect(response.body.roomOwner).toStrictEqual(
                            roomOwner
                        );
                    });
            });
    });

    test("/room should fail with an non existing room", () => {
        return supertest(app)
            .get(`/room/?roomId=22`)
            .then((response: any) => {
                expect(response.statusCode).toBe(500);
                expect(response.body.error).toContain("Room id (22) not found");
            });
    });

    test("/room should fail without a room id", () => {
        return supertest(app)
            .get(`/room/`)
            .then((response: any) => {
                expect(response.statusCode).toBe(500);
                expect(response.body.error).toContain(
                    "Parameter roomId is required"
                );
            });
    });
});

describe("/addStory tests", () => {
    let roomId : string;
    beforeEach(() => {
        const deck = [0, 1, 2, 3];
        const roomOwner = "1";

        return supertest(app)
            .post("/createRoom")
            .send({
                deck,
                roomOwner,
            })
            .then((response: any) => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty("roomId");
                roomId = response.body.roomId;
            });
    });

    test("/addStory should fail without room id", () => {
        return supertest(app)
            .post(`/addStory`)
            .then((response: any) => {
                expect(response.statusCode).toBe(500);
                expect(response.body.error).toContain(
                    "Parameter roomId is required"
                );
            });
    });

    test("/addStory should fail without story data", () => {
        return supertest(app)
            .post(`/addStory`)
            .send({ roomId })
            .then((response: any) => {
                expect(response.statusCode).toBe(500);
                expect(response.body.error).toContain(
                    "Parameter story is required"
                );
            });
    });

    test("/addStory should fail without story name", () => {
        return supertest(app)
            .post("/addStory")
            .send({
                roomId,
                story: {
                    description: "desc",
                },
            })
            .then((response: any) => {
                expect(response.statusCode).toBe(500);
                expect(response.body.error).toContain(
                    "Parameter story.name is required"
                );
            });
    });

    test("/addStory should register given story to the room data", () => {
        const deck = [0, 1, 2, 3];
        const roomOwner = "1";

        return supertest(app)
            .post("/addStory")
            .send({
                roomId,
                story: { name: "Story 1", description: "Do your job" },
            })
            .then((response: any) => {
                expect(response.statusCode).toBe(200);
                expect(response.body.deck).toStrictEqual(deck);
                expect(response.body.roomOwner).toStrictEqual(roomOwner);
            });
    });
});
