import React from "react";

interface CardProps {
    value: string | null;
    flipped: boolean;
    id: string;
    setSelected?: any;
    isSelected: boolean;
    selectionEnabled?: boolean;
    isDisabled?: boolean;
}

const Card: React.FC<CardProps> = ({
    value,
    flipped,
    id,
    setSelected = () => {},
    isSelected,
    isDisabled = false,
    selectionEnabled = true,
}) => {
    let cardColor = "bg-blue-600";

    if (!flipped) {
        cardColor = value ? "bg-green-700" : "bg-gray-200";
    }

    if (isSelected) {
        cardColor = "bg-blue-500 border-2";
    }

    if (isDisabled) {
        cardColor = "bg-gray-700 border-black";
        selectionEnabled = false;
    }

    return (
        <button
            key={id}
            id={value!}
            className={`mr-2 mt-2 h-24 w-14 rounded-xl flex ${cardColor} ${
                selectionEnabled
                    ? "hover:bg-blue-500 hover:border-2 "
                    : "cursor-auto "
            } text-3xl justify-center  p-2 items-center`}
            onClick={selectionEnabled ? setSelected : () => {}}
        >
            {flipped ? value : ""}
        </button>
    );
};

export default Card;
