const EVENTS = {
    connection: "connection",
    disconnect: "disconnect",
    CLIENT: {
        CREATE_ROOM: "CREATE_ROOM",
        SEND_ROOM_MESSAGE: "SEND_ROOM_MESSAGE",
        JOIN_ROOM: "JOIN_ROOM",
        NEW_STORY: "NEW_STORY",
        DELETE_STORY: "DELETE_STORY",
        SHOW_CARDS: "SHOW_CARDS",
        RESET_CARDS: "RESET_CARDS",
        NEXT_STORY: "NEXT_STORY",
    },
    SERVER: {
        ROOMS: "ROOMS",
        JOINED_ROOM: "JOINED_ROOM",
        ROOM_CLOSED: "ROOM_CLOSED",
        ROOM_MESSAGE: "ROOM_MESSAGE",
        NEW_STORY: "NEW_STORY",
    },
};

export default EVENTS;
