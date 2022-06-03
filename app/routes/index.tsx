import React, { useContext } from "react";

const themes = {
    light: "bg-gray-500 text-black",
    dark: "bg-black text-white"
};

const ThemeContext = React.createContext(themes.dark);

const Index = () => {
    return (
        <ThemeContext.Provider value={themes.dark}>
            <Test />
        </ThemeContext.Provider>
    );
};

const Test = () => {
    const theme = useContext(ThemeContext);

    return (
        <div>
            <header className={`flex h-16 min-w-full items-center justify-between text-4xl ${theme}`}>
                <div className="flex gap-x-8 px-4">
                    <p>Home</p>
                    <p>Chat</p>
                    <p>Placeholder</p>
                </div>
                <div className="px-4">
                    <p>🌙</p>
                </div>
            </header>
            <main className="relative min-h-full bg-white sm:flex sm:items-center sm:justify-center"></main>
        </div>
    );
};

export default Index;
