import { get, post } from "./api";
import mockAxios from "jest-mock-axios";
import SERVER from "./constants";


describe("API tests", () => {
    test("get is called with proper values", async () => {
        const roomId = "1";

        const roomData = { users: ["Michal", "Joseph"], roomId };
        const payload = { data: { roomData } };
        type FakeData = { roomId: string; users: string[] };

        mockAxios.get.mockResolvedValueOnce(payload);

        await expect(get<FakeData>("/room", { roomId })).resolves.toEqual({
            roomData,
        });
    });

    test("post return room data", async () => {
        const roomId = "1";

        const roomData = { users: ["Michal", "Joseph"], roomId };
        const payload = { data: { roomData } };
        type FakeData = { roomId: string; users: string[] };

        mockAxios.post.mockResolvedValueOnce(payload);

        await expect(
            post<FakeData>("/room", { roomId })
        ).resolves.toEqual({
            roomData,
        });

        expect(mockAxios.post).toHaveBeenCalledWith(`${SERVER}/room`, { roomId });
    });
});
