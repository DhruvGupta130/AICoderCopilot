import {Highlight} from "prism-react-renderer"

const customTheme = {
    plain: {
        backgroundColor: "#282a36",
        color: "#f8f8f2",
    },
    styles: [
        { types: ["comment"], style: { color: "#6272a4" } },
        { types: ["keyword"], style: { color: "#ff79c6" } },
        { types: ["string"], style: { color: "#f1fa8c" } },
        { types: ["variable"], style: { color: "#50fa7b" } },
        { types: ["function"], style: { color: "#8be9fd" } },
        { types: ["punctuation"], style: { color: "#f8f8f2" } },
        { types: ["operator"], style: { color: "#ffb86c" } },
    ],
}

type Props = {
    code: string
    language: string
}

export default function CodeBlock({ code, language }: Props) {
    const lang = language.toLowerCase().includes("c++")
        ? "cpp"
        : language.toLowerCase()

    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(code)
            alert("Code copied to clipboard")
        } catch {
            alert("Failed to copy")
        }
    }

    return (
        <div className="code-block">
            <button className="copy-btn" onClick={onCopy}>Copy</button>

            <Highlight code={code} language={lang as any} theme={customTheme}>
                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre
                        className={className}
                        style={{ ...style, padding: "16px", overflowX: "auto" }}
                    >
            {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                    {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                    ))}
                </div>
            ))}
          </pre>
                )}
            </Highlight>
        </div>
    )
}