import React, { useEffect, useState } from "react";

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
    const [selection, setSelectionEnabled] = useState(selectionEnabled);
    const [cardColor, setCardColor] = useState("bg-blue-600");

    useEffect(() => {
        if (!flipped) {
            setCardColor(value ? "bg-green-700" : "bg-gray-200");
            return;
        }

        if (isSelected) {
            setCardColor("bg-green-600 border-2");
            return;
        }

        if (isDisabled) {
            setCardColor("bg-gray-700 border-black");
            return;
        }

        setCardColor("bg-blue-600");
    }, [value, isDisabled, isSelected, flipped]);

    useEffect(() => {
        setSelectionEnabled(selectionEnabled);
        console.log(selection);
    }, [selectionEnabled]);

    return (
        <button
            key={id}
            id={value!}
            className={`mr-2 mt-2 h-24 w-14 rounded-xl flex ${cardColor} ${
                selection && !isDisabled
                    ? "hover:bg-green-500 hover:border-2 "
                    : "cursor-not-allowed"
            } text-3xl justify-center  p-2 items-center`}
            onClick={selectionEnabled ? setSelected : () => {}}
        >
            {flipped ? value : ""}
        </button>
    );
};

export default Card;
