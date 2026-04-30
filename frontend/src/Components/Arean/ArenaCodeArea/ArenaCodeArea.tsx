import React from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

const ArenaCodeArea = () => {
    const monaco = useMonaco();

    React.useEffect(() => {
        if (monaco) {
            monaco.editor.defineTheme("custom-dark", {
                base: "vs-dark",
                inherit: true,
                rules: [],
                colors: {
                    "editor.background": "#121212", 
                },
            });
        }
    }, [monaco]);

    return (
        <div className="bg-[#121212] w-full h-[90vh]">
            <Editor
                height="100%"
                defaultLanguage="typescript"
                defaultValue="// some comment"
                theme="custom-dark" 
                options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                }}
            />
        </div>
    );
};

export default ArenaCodeArea;