const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
}

const ASSISTANT_ID = process.env.ASSISTANT_ID;
if (!ASSISTANT_ID) {
    throw new Error("Missing ASSISTANT_ID environment variable.");
}

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

//
// Creates a new chat thread.
//
app.post(`/chat/new`, async (req, res) => {

    const thread = await openai.beta.threads.create();
    res.json({
        threadId: thread.id,
    });
});

//
// Sends a new chat message.
//
app.post(`/chat/send`, async (req, res) => {

    const { threadId, text } = req.body;

    await openai.beta.threads.messages.create(
        threadId,
        {
          role: "user",
          content: text,
        }
    );

    const run = await openai.beta.threads.runs.create(
        threadId,
        { 
            assistant_id: ASSISTANT_ID,
        }
    );
    
    res.json({
        runId: run.id,
    });
});

//
// Lists messages for a particular thread.
//
app.post(`/chat/list`, async (req, res) => {

    const { threadId, runId } = req.body;

    const messages = await openai.beta.threads.messages.list(threadId);

    let status = undefined;
    if (runId) {
        const run = await openai.beta.threads.runs.retrieve(threadId, runId);
        status = run.status;
    }   

    res.json({
        messages: messages.data,
        status,
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});