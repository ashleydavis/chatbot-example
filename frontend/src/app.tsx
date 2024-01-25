import React, { useEffect, useRef, useState } from "react";
import { ThreadMessage } from "openai/resources/beta/threads/messages/messages";
import Markdown from 'markdown-to-jsx';
import { Cv } from "./cv";
import axios from "axios";

const BASE_URL = process.env.BASE_URL;
if (!BASE_URL) {
    throw new Error("Missing BASE_URL environment variable.");
}

export function App() {

    const threadId = useRef<string | undefined>(undefined);
    const scrollContainer = useRef<HTMLDivElement>(null);
    const [runId, setRunId] = useState<string | undefined>(undefined);
    const [messages, setMessages] = useState<ThreadMessage[]>([]);
    const [message, setMessage] = useState<string>("");
    const [chatbotVisible, setChatbotVisible] = useState<boolean>(true);
    const [showInfo, setShowInfo] = useState<boolean>(true);

    //
    // Creates a new message thread, if there isn't one already.
    //
    async function createThread(): Promise<void> {
        
        if (threadId.current === undefined) {
            //
            // Try and reload from local storage.
            //
            const storedThreadId = localStorage.getItem("threadId");
            if (storedThreadId) {
                threadId.current = storedThreadId;
                await updateMessages();
            }
        }


        if (threadId.current !== undefined) {
            // Already have a thread.
            return; 
        }

        //
        // Requests a new thread from the backend.
        //
        const { data } = await axios.post(`${BASE_URL}/chat/new`);
        threadId.current = data.threadId;

        //
        // Save the thread id in local storage.
        //
        localStorage.setItem("threadId", threadId.current!);
    }

    //
    // Starts a new chat thread.
    //
    function onResetThread() {
        threadId.current = undefined;
        setMessages([]);
        setMessage("");
        setRunId(undefined);
        scrollContainer.current!.scrollTop = 0;
        localStorage.removeItem("threadId");

        createThread()
            .catch(err => {
                console.error(`Failed to create message thread.`);
                console.error(err);
            });
    }

    //
    // Adds a message to the chat.
    //
    async function sendMessage(text: string): Promise<void> {
        if (runId !== undefined) {
            // Already running.
            return;
        }

        //
        // Sends the message to the backend.
        //
        const { data } = await axios.post(`${BASE_URL}/chat/send`, {
            threadId: threadId.current,
            text,
        });

        setRunId(data.runId);
    }

    //
    // Sends the message the user has typed to the AI.
    //
    async function onSendMessage(): Promise<void> {
        const messageToSend = message.trim();
        setMessage(""); // Clear for the next message.
        await sendMessage(messageToSend);
    }

    //
    // Updates messages in the UI.
    //
    async function updateMessages(): Promise<void> {

        const { data } = await axios.post(`${BASE_URL}/chat/list`, {
            threadId: threadId.current,
            runId: runId,
        });

        const { messages, status } = data;
        
        messages.reverse(); // Reverse so the newest messages are at the bottom.
        setMessages(messages);

        if (runId) {
            if (status === "completed") {
                setTimeout(() => {
                    // The run has finished.
                    setRunId(undefined);
                }, 5000); // Give it some time to finish up.
            }
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
                <div key={index} className="leading-relaxed">
                    {index === 0 
                        && <span 
                            className="block font-bold text-gray-700"
                            >
                            {getRoleName(role)}
                        </span>
                    }
                    <Markdown>{line}</Markdown>
                </div>
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

    useEffect(() => {
        //
        // Scroll to the end.
        //
        scrollContainer.current!.scrollTop = scrollContainer.current!.scrollHeight;

    }, [messages]);

    //
    // Toggles visibility of the chatbot.
    //
    function onToggleChatbot() {
        setChatbotVisible(!chatbotVisible);
    }

    //
    // Handles the enter key.
    //
    async function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): Promise<void> {
        if (event.key === "Enter") {
            // Send message on enter.
            await onSendMessage();
        }
    }

    return (
        <div>
            {showInfo && <div
                style={{
                    boxShadow: "0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05)",
                    maxHeight: "80%",
                    maxWidth: "80%",
                    zIndex: 1000,
                }}
                className="flex flex-col fixed top-[50px] right-0 mr-4 bg-gray-50 p-6 rounded-lg border border-[#e5e7eb] w-[440px]"
                >
                <p className="text-lg">Hello! This is the resume of Ashley Davis.</p>
                <p className="pt-2">The CV on the left was exported from Google Docs.</p>
                <p>The chatbot below is implemented using TypeScript, React and the Open AI API, through a Node.js backend. </p>

                <a 
                    className="mt-3 text-sm text-blue-600 font-medium underline"
                    href="https://github.com/ashleydavis/chatbot-example" 
                    target="_blank"
                    >
                    See the code on GitHub
                </a>

                <a 
                    className="mt-1 text-sm text-blue-600 font-medium underline"
                    href="https://www.youtube.com/watch?v=RY_B1bmSvs0" 
                    target="_blank"
                    >
                    Learn how to make this chatbot
                </a>

                <div 
                    className="absolute top-[10px] right-[10px] cursor-pointer"
                    onClick={() => setShowInfo(false)}
                    >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        >
                        <path
                            d="M18 6L6 18M6 6l12 12"
                            stroke="black"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>}

            {chatbotVisible && <div
                style={{
                    boxShadow: "0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05)",
                    maxHeight: "80%",
                    maxWidth: "80%",
                }}
                className="flex flex-col fixed bottom-[calc(4rem+1.5rem)] right-0 mr-4 bg-gray-50 p-6 pt-2 rounded-lg border border-[#e5e7eb] w-[440px] h-[600px]"
                >

                {/* <!-- Heading --> */}
                <div className="flex flex-col space-y-1.5 pb-6">
                    <h2 className="font-semibold text-lg tracking-tight">Ask questions about Ashley Davis</h2>
                    <p className="text-xs text-[#6b7280] leading-3">Powered by Open AI (ChatGPT) and the CV of Ashley Davis</p>
                    <p className="text-xs text-[#6b7280] leading-3">Answers are probabalistic and can be wrong. ChatGPT isn't intelligent.</p>
                </div>

                {/* <!-- Chat Container --> */}
                <div 
                    ref={scrollContainer}
                    className="flex-grow overflow-y-auto mb-6 pr-4"
                    >
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
                <div className="flex flex-col">
                    <div className="flex items-center pt-0">
                        <div className="flex items-center justify-center w-full space-x-2">
                            <input
                                className="flex h-10 w-full rounded-md border border-[#e5e7eb] px-3 py-2 text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#9ca3af] disabled:cursor-not-allowed disabled:opacity-50 text-[#030712] focus-visible:ring-offset-2"
                                placeholder="Ask a question about Ashley Davis" 
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                disabled={runId !== undefined}
                                onKeyDown={onKeyDown}
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

                    <div className="text-sm ml-3 pt-3 pr-1 text-gray-500">
                        Example: What is Ashley's skillset?
                    </div>
                </div>

                <div 
                    className="absolute top-[10px] right-[10px] cursor-pointer"
                    onClick={onResetThread}
                    >
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path d="M 10 2 L 9 3 L 4 3 L 4 5 L 5 5 L 5 20 C 5 20.522222 5.1913289 21.05461 5.5683594 21.431641 C 5.9453899 21.808671 6.4777778 22 7 22 L 17 22 C 17.522222 22 18.05461 21.808671 18.431641 21.431641 C 18.808671 21.05461 19 20.522222 19 20 L 19 5 L 20 5 L 20 3 L 15 3 L 14 2 L 10 2 z M 7 5 L 17 5 L 17 20 L 7 20 L 7 5 z M 9 7 L 9 18 L 11 18 L 11 7 L 9 7 z M 13 7 L 13 18 L 15 18 L 15 7 L 13 7 z"></path>
                    </svg>
                </div>
            </div>}

            <button
                className="fixed bottom-4 right-4 inline-flex items-center justify-center text-sm font-medium disabled:pointer-events-none disabled:opacity-50 border rounded-full w-16 h-16 bg-black hover:bg-gray-700 m-0 cursor-pointer border-gray-200 bg-none p-0 normal-case leading-5 hover:text-gray-900"
                type="button" aria-haspopup="dialog" aria-expanded="false" data-state="closed"
                onClick={onToggleChatbot}
                >
                <svg xmlns=" http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="text-white block border-gray-200 align-middle">
                    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" className="border-gray-200">
                    </path>
                </svg>
            </button>

            <Cv />
        </div>
    );
}