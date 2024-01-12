import React, { useEffect, useRef, useState } from "react";
import OpenAI from "openai";
import { ThreadMessage } from "openai/resources/beta/threads/messages/messages";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
}

const assistantId = "asst_zb0rRLupSak9wg7yDHMZ8iHU"

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

export function App() {

    const threadId = useRef<string | undefined>(undefined);
    const [runId, setRunId] = useState<string | undefined>(undefined);
    const [messages, setMessages] = useState<ThreadMessage[]>([]);
    const [message, setMessage] = useState<string>("");

    //
    // Creates a new message thread, if there isn't one already.
    //
    async function createThread(): Promise<void> {
        if (threadId.current !== undefined) {
            // Already have a thread.
            return; 
        }

        // Create a new thread.
        const thread = await openai.beta.threads.create()

        threadId.current = thread.id;
        console.log(`Created thread ${threadId.current}.`);
    }

    //
    // Adds a message to the chat.
    //
    async function sendMessage(text: string): Promise<void> {
        if (runId !== undefined) {
            // Already running.
            return;
        }

        await openai.beta.threads.messages.create(
            threadId.current!,
            {
              role: "user",
              content: text,
            }
        );
    
        const run = await openai.beta.threads.runs.create(
            threadId.current!,
            { 
                assistant_id: assistantId,
            }
        );
        setRunId(run.id);
    }

    //
    // Sends the message the user has typed to the AI.
    //
    async function onSendMessage(): Promise<void> {
        await sendMessage(message);
        setMessage(""); // Clear for the next message.
    }

    //
    // Updates messages in the UI.
    //
    async function updateMessages(): Promise<void> {
        const messages = await openai.beta.threads.messages.list(threadId.current!);
        messages.data.reverse(); // Reverse so the newest messages are at the bottom.
        setMessages(messages.data);

        const run = await openai.beta.threads.runs.retrieve(threadId.current!, runId!);
        if (run.status === "completed") {
            // The run has finished.
            setRunId(undefined);
        }
    }

    //
    // Gets the role name for a message.
    //
    function getRoleName(role: string): string {
        if (role === "user") {
            return "You";
        } 
        else if (role === "assistant") {
            return "AI";
        } 
        else {
            return role;
        }
    }

    //
    // Render a chunk of text as paragraphs.
    //
    function renderText(text: string, role: string) {
        return text.split("\n").map((line, index) => {
            return (
                <p key={index} className="leading-relaxed">
                    {index === 0 
                        && <span 
                            className="block font-bold text-gray-700"
                            >
                            {getRoleName(role)}
                        </span>
                    }
                    {line}
                </p>
            );
        });
    }

    useEffect(() => {
        createThread()
            .catch(err => {
                console.error(`Failed to create message thread.`);
                console.error(err);
            });
    }, []);

    useEffect(() => {

        if (runId === undefined) {
            return;
        }

        const timer = setInterval(() => {
            updateMessages();
        }, 1000);

        return () => {
            clearInterval(timer);
        };

    }, [runId]);

    return (
        <div>
            <div
                style={{"boxShadow":"0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05)"}}
                className="fixed bottom-[calc(4rem+1.5rem)] right-0 mr-4 bg-white p-6 rounded-lg border border-[#e5e7eb] w-[440px] h-[634px]"
                >

                {/* <!-- Heading --> */}
                <div className="flex flex-col space-y-1.5 pb-6">
                    <h2 className="font-semibold text-lg tracking-tight">Ask questions about Ashley Davis</h2>
                    <p className="text-sm text-[#6b7280] leading-3">Powered by Open AI and the CV of Ashley Davis</p>
                </div>

                {/* <!-- Chat Container --> */}
                <div className="pr-4 h-[474px]" style={{"minWidth":"100%","display":"table"}}>
                    {/* <!-- Chat Message AI --> */}
                    <div className="flex gap-3 my-4 text-gray-600 text-sm flex-1">
                        <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
                            <div className="rounded-full bg-gray-100 border p-1">
                                <svg stroke="none" fill="black" strokeWidth="1.5"
                                    viewBox="0 0 24 24" aria-hidden="true" height="20" width="20" xmlns="http://www.w3.org/2000/svg"
                                    >
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z">
                                    </path>
                                </svg>
                            </div>
                        </span>
                        <p className="leading-relaxed">
                            <span className="block font-bold text-gray-700">AI </span> Ask question about the skills, education and work history of Ashley Davis
                        </p>
                    </div>

                    {messages.map((message, index) => {
                        return (
                            <div
                                key={index} 
                                className="flex gap-3 my-4 text-gray-600 text-sm flex-1"
                                >
                                <span
                                    className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8"
                                    >
                                    <div className="rounded-full bg-gray-100 border p-1">
                                        {message.role === "assistant"
                                            && <svg stroke="none" fill="black" strokeWidth="1.5"
                                                viewBox="0 0 24 24" aria-hidden="true" height="20" width="20" xmlns="http://www.w3.org/2000/svg"
                                                >
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z">
                                                </path>
                                            </svg>
                                        }
                                        {message.role === "user"
                                            && <svg stroke="none" fill="black" strokeWidth="0"
                                                viewBox="0 0 16 16" height="20" width="20" xmlns="http://www.w3.org/2000/svg"
                                                >
                                                <path
                                                    d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z">
                                                </path>
                                            </svg>       
                                        }
                                    </div>
                                </span>
                                
                                <div className="flex flex-col">
                                    {message.content.map((content, index) => {
                                        if (content.type === "text") {
                                            return renderText(content.text.value, message.role);
                                        }
                                        else {
                                            return undefined;
                                        }
                                    })}
                                </div>
                                
                            </div>       
                        );
                    })}

                    {/* Cool progress indicators: https://loading.io/css/ */}
                    {runId !== undefined
                        && <div className="lds-ring">
                            <div></div><div></div><div></div><div></div>
                        </div>
                    }
                </div>

                {/* <!-- Input box  --> */}
                <div className="flex items-center pt-0">
                    <div className="flex items-center justify-center w-full space-x-2">
                        <input
                            className="flex h-10 w-full rounded-md border border-[#e5e7eb] px-3 py-2 text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#9ca3af] disabled:cursor-not-allowed disabled:opacity-50 text-[#030712] focus-visible:ring-offset-2"
                            placeholder="Example: Why would I want to employ Ashley?" 
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            disabled={runId !== undefined}
                            />

                        <button
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium text-[#f9fafb] disabled:pointer-events-none disabled:opacity-50 bg-black hover:bg-[#111827E6] h-10 px-4 py-2"
                            onClick={onSendMessage}
                            disabled={runId !== undefined}
                            >
                            Send
                        </button>

                    </div>
                </div>
            </div>

            <pre>
                {JSON.stringify(messages, null, 4)}
            </pre>
        </div>
    );
}