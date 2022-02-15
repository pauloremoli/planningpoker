import {
    createContext,
    ReactChild,
    ReactChildren,
    useContext,
    useEffect,
    useState,
} from "react";

type UserData = {
    username: string;
    userId: string;
    roomId?: string;
    story?: string;
    children: ReactChild | ReactChildren;
};

type AppContextType = {
    username: string;
    setUsername: (value: string) => void;
    userId: string;
    setUserId: (value: string) => void;
    roomId: string;
    setRoomId: (value: string) => void;
    story: string;
    setStory: (value: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export default function AppProvider(props: UserData) {
    const [username, setUsername] = useState(props.username);
    const [userId, setUserId] = useState(props.userId);
    const [roomId, setRoomId] = useState<string>("");
    const [story, setStory] = useState<string>("");

    useEffect(() => {
        localStorage.setItem("username", username);
        console.log("Username changed:", username);
        
    }, [username]);

    return (
        <AppContext.Provider
            value={{
                username,
                userId,
                setUsername,
                setUserId,
                roomId,
                setRoomId,
                story,
                setStory,
            }}
        >
            {props.children}
        </AppContext.Provider>
    );
}

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useAppContext must be within AppProvider");
    }
    return context;
};
