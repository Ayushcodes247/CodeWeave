import React from "react";
import Editor from "@monaco-editor/react";

type Props = {
    file: {
        id: string;
        name: string;
        content?: string;
    } | null;
    onChange: (value: string) => void;
};

const ArenaCodeArea = ({ file, onChange }: Props) => {

    const handleEditorDidMount = (editor: any, monaco: any) => {
        monaco.editor.defineTheme("custom-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
                "editor.background": "#121212",
            },
        });

        monaco.editor.setTheme("custom-dark");
    };

    return (
        <div className="bg-[#121212] w-full h-[90vh]">
            <Editor
                key={file?.id} // 🔥 important: re-render on file switch
                height="100%"
                defaultLanguage="typescript"
                value={file?.content || "// Select or create a file"} // 🔥 dynamic content
                onChange={(val) => onChange(val || "")} // 🔥 update parent state
                onMount={handleEditorDidMount}
                options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    automaticLayout: true
                }}
            />
        </div>
    );
};

export default ArenaCodeArea;