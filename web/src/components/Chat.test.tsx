import React from "react";
import data from "../data.json";
import { render, screen } from "@testing-library/react";
import Chat from "./Chat";

test("renders chat and input field for message", () => {
    render(<Chat />);
    const logoElement = screen.getByText("Chat");
    expect(logoElement).toBeInTheDocument();


    const inputMessageElement = screen.getByPlaceholderText("message...");
    expect(inputMessageElement).toBeInTheDocument();
});
