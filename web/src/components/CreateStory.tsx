import axios from "axios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineClose } from "react-icons/ai";
import SERVER from "../api/constants";
import Story from "../models/Story";
import { useAppContext } from "./AppContext";
import Button from "./Button";

type InputForm = {
	storyName: string;
	description: string;
	addMore: boolean;
};

type CreateStoryProps = {
	closeModal?: () => void;
	addStory?: (name: string, description: string) => void;
};

const CreateStory: React.FC<CreateStoryProps> = ({
	closeModal = () => {},
	addStory = () => {},
}) => {
	const { register, handleSubmit, reset } = useForm<InputForm>();
	const [errors, setErrors] = useState<string>();
	const { roomId } = useAppContext();

	const onSubmit = async (data: InputForm) => {
		const story: Story = {
			name: data.storyName,
			description: data.description,
			points: 0,
		};

		console.log("addStory before post", { roomId, story });

		await axios
			.post(SERVER + "/addStory", { roomId, story })
			.then((response) => {
				addStory(data.storyName, data.description);
				reset();
				if (!data.addMore) {
					closeModal();
				}
			})
			.catch((error) => {
				console.log("Create story:", error);
				setErrors("Something went wrong, please try again!");
			});
	};

	return (
		<div
			className={`fixed w-full h-full inset-0 flex flex-col items-center text-xl text-gray-50 bg-slate-800`}
		>
			<Button className="absolute top-10 right-10" onClick={closeModal}>
				<AiOutlineClose size={36} color="white" />
			</Button>
			<h1 className="text-3xl py-14">Add new story</h1>
			<form id="addStoryForm" onSubmit={handleSubmit(onSubmit)}>
				<div className={"flex flex-col"}>
					<label htmlFor="storyName">Name:</label>
					<input
						id="storyName"
						data-testid="storyName"
						type="text"
						placeholder="Name"
						{...register("storyName", { required: true })}
						className={
							"p-4 border-0 rounded-xl mb-8 mt-4 text-black"
						}
					/>
					<label htmlFor="description">Description:</label>
					<textarea
						rows={3}
						cols={40}
						id="description"
						data-testid="description"
						placeholder="Description"
						{...register("description")}
						className={
							"p-4 border-0 rounded-xl mb-8 mt-4 text-black"
						}
					/>

					<div className="flex flex-row items-center">
						<input
							type="checkbox"
							id="addMore"
							{...register("addMore")}
							className="mr-4 h-6 w-6"
						/>
						<label htmlFor="addMore">Add more stories</label>
					</div>
					<p id="errorMessage" className="mt-4 text-red-500">
						{errors}
					</p>
					<div className="justify-center flex">
						<Button name="addButton" data-testid="addButton">
							Add
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default CreateStory;
