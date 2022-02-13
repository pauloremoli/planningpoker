import React, {
    Children,
    HtmlHTMLAttributes,
    ReactElement,
    useState,
} from "react";

type ButtonProps = {
    className?: string;
    onClick?: () => void;
    chilren?: ReactElement[];
    name?: string;
    disabled?: boolean | null;
};

const Button: React.FC<ButtonProps> = ({
    onClick = () => {},
    children,
    name,
    className = "h-16 w-72 mt-16 rounded-xl p-4 text-xl font-semibold bg-slate-700 shadow-sm shadow-black hover:scale-110 hover:bg-slate-600 ",
    disabled = false,
}) => {
    const [effect, setEffect] = useState(false);
    return (
        <button
            type="submit"
            className={`${effect && "animate-wiggle"} ${className}`}
            onClick={() => {
                setEffect(true);
                onClick();
            }}
            onAnimationEnd={() => setEffect(false)}
            id={name}
            name={name}
            disabled={disabled === null ? false : disabled}
        >
            {children}
        </button>
    );
};

export default Button;
