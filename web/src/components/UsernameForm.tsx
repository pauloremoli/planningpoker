import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "./Button";

type InputForm = {
    username: string;
};

type UsernameFormProps = {
    setUsername?: (name: string) => void;
};

const UsernameForm: React.FC<UsernameFormProps> = ({
    setUsername = () => {},
}) => {
    const { register, handleSubmit } = useForm<InputForm>();
    const [errors, setErrors] = useState<string>();

    const onSubmit = (data: InputForm) => {
        if (!data.username.trim()) {
            setErrors("Name is required!");
            return;
        }
        setUsername(data.username);
    };

    return (
        <div
            className={` w-full h-full inset-0 flex flex-col items-center justify-center text-xl text-gray-50 bg-slate-800`}
        >
            <h1 className="text-3xl py-14">Hello there</h1>
            <form id="addStoryForm" onSubmit={handleSubmit(onSubmit)}>
                <div className={"flex flex-col h-full"}> 
                    <input
                        id="username"
                        type="text"
                        placeholder="Name"
                        {...register("username", { required: true })}
                        className={
                            "p-4 border-0 rounded-xl mb-8 mt-4 text-black"
                        }
                    />
                    <p id="errorMessage" className="mt-4 text-red-500">
                        {errors}
                    </p>
                    <div className="justify-center flex">
                        <Button name="addButton">Save</Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default UsernameForm;
