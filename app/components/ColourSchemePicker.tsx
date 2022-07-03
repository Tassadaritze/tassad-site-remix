import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useTransition } from "@remix-run/react";

import { MonitorIcon, MoonIcon, SunIcon } from "~/components/Icons";

const enum SelectedMode {
    Dark,
    Light,
    System
}

const ColourSchemePicker = ({
    isDarkMode,
    setIsDarkMode
}: {
    isDarkMode: boolean;
    setIsDarkMode: Dispatch<SetStateAction<boolean>>;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<SelectedMode | null>(null);

    useEffect(() => {
        switch (localStorage.theme) {
            case "dark": {
                setSelected(SelectedMode.Dark);
                break;
            }
            case "light": {
                setSelected(SelectedMode.Light);
                break;
            }
            default: {
                setSelected(SelectedMode.System);
            }
        }
    }, []);

    const isSubmitting = useTransition().state === "submitting";
    useEffect(() => setIsOpen(false), [isSubmitting]);

    return (
        <div
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                    setIsOpen(false);
                }
            }}
            className="flex items-center"
        >
            <button
                onClick={() => {
                    setIsOpen((prevState) => !prevState);
                }}
            >
                {isDarkMode ? (
                    <MoonIcon className="stroke-mauve-dark-12" />
                ) : (
                    <SunIcon className="stroke-mauve-dark-12" />
                )}
            </button>
            {isOpen && (
                <ul className="absolute right-[5%] top-[4rem] z-10 border-2 border-violet-6 bg-violet-3 pb-2 text-violet-12 dark:border-violet-dark-6 dark:bg-violet-dark-3 dark:text-violet-dark-12">
                    <li
                        className={`${
                            selected === SelectedMode.Dark
                                ? "bg-violet-5 dark:bg-violet-dark-5"
                                : "bg-violet-3 hover:bg-violet-4 dark:bg-violet-dark-3 dark:hover:bg-violet-dark-4"
                        }`}
                    >
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                localStorage.theme = "dark";
                                setSelected(SelectedMode.Dark);
                                setIsDarkMode(true);
                            }}
                            className="flex w-full items-center gap-x-2 px-2"
                        >
                            <MoonIcon height={32} className="stroke-violet-11 dark:stroke-violet-dark-11" />
                            Dark
                        </button>
                    </li>
                    <li
                        className={`${
                            selected === SelectedMode.Light
                                ? "bg-violet-5 dark:bg-violet-dark-5"
                                : "bg-violet-3 hover:bg-violet-4 dark:bg-violet-dark-3 dark:hover:bg-violet-dark-4"
                        }`}
                    >
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                localStorage.theme = "light";
                                setSelected(SelectedMode.Light);
                                setIsDarkMode(false);
                            }}
                            className="flex w-full items-center gap-x-2 px-2"
                        >
                            <SunIcon height={32} className="stroke-violet-11 dark:stroke-violet-dark-11" />
                            Light
                        </button>
                    </li>
                    <li
                        className={`${
                            selected === SelectedMode.System
                                ? "bg-violet-5 dark:bg-violet-dark-5"
                                : "bg-violet-3 hover:bg-violet-4 dark:bg-violet-dark-3 dark:hover:bg-violet-dark-4"
                        }`}
                    >
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                localStorage.removeItem("theme");
                                setSelected(SelectedMode.System);
                                setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
                            }}
                            className="flex w-full items-center gap-x-2 px-2"
                        >
                            <MonitorIcon height={32} className="stroke-violet-11 dark:stroke-violet-dark-11" />
                            System
                        </button>
                    </li>
                </ul>
            )}
        </div>
    );
};

export default ColourSchemePicker;
