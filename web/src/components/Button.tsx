import React, { ReactElement, useEffect, useState } from "react";

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
	disabled = false,
	className,
}) => {
	const [effect, setEffect] = useState(false);
	const [isDisabled, setIsDisabled] = useState(disabled);
	const defaultClassName = `h-16 w-72 mt-16 rounded-xl p-4 text-xl font-semibold  shadow-sm shadow-black ${
		isDisabled
			? "bg-gray-800 cursor-not-allowed"
			: "bg-slate-700 hover:scale-110 hover:bg-slate-600"
	}`;

	useEffect(() => {
		setIsDisabled(disabled);
	}, [disabled]);

	return (
		<button
			type="submit"
			className={`${effect && "animate-wiggle"} ${
				className ? className : defaultClassName
			}`}
			onClick={() => {
				setEffect(true);
				onClick();
			}}
			onAnimationEnd={() => setEffect(false)}
			id={name}
			name={name}
			disabled={isDisabled!}
			data-testid={name}
		>
			{children}
		</button>
	);
};

export default Button;
