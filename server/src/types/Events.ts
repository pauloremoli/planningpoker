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
        SELECTED_CARD: "SELECTED_CARD",
        FLIP_CARDS: "FLIP_CARDS",
        RESET_CARDS: "RESET_CARDS",
        NEXT_STORY: "NEXT_STORY",
    },
    SERVER: {
        ROOM_CREATED: "ROOM_CREATED",
        ROOMS: "ROOMS",
        ROOM_CLOSED: "ROOM_CLOSED",
        JOINED_ROOM: "JOINED_ROOM",
        PLAYER_JOINED_ROOM: "PLAYER_JOINED_ROOM",
        ROOM_MESSAGE: "ROOM_MESSAGE",
        NEW_STORY: "NEW_STORY",
        SELECTED_CARD: "SELECTED_CARD",
        FLIP_CARDS: "FLIP_CARDS",
        RESET_CARDS: "RESET_CARDS"
    },
};

export default EVENTS;
