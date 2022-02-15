import axios from "axios";
import SERVER from "./constants";

export async function post<T>(url: string, params: any): Promise<T> {
    
    return await axios.post(SERVER + url, params)
        .then((response) => {            
            return response.data;
        })
        .catch((error) => {
            console.log("POST", error);
            throw error; /* <-- rethrow the error so consumer can still catch it */
        });
}

export async function get<T>(url: string, params: any): Promise<T> {
    console.log(SERVER + url, { params });

    try {
        const response = await axios.get(SERVER + url, { params });
        return response.data;
    } catch (error) {
        console.log("GET", error);
        throw error; /* <-- rethrow the error so consumer can still catch it */
    }
}
