# Chatbot example

An example of building a Chatbot with the Open AI API.

If you like this project, please star this repo and [support my work](https://www.codecapers.com.au/about#support-my-work)

## Live demo

Find a live demo of the chatbot here:
https://cv.codecapers.com.au/

## Video overview

I've made a video to show how to make a chatbot like this:
https://www.youtube.com/watch?v=RY_B1bmSvs0

## Original UI code

https://tailwindcomponents.com/component/ai-chatbot

## Pre-reqs

Sign up for Open AI and take note of the API key.

Create an assistant in the Open AI Playground and take note of the assistant ID.

## Setup

You need [Node.js](https://nodejs.org/en/) installed to use this code.

Uses pnpm because it's faster than npm.

First install pnpm:

```bash
npm install -g pnpm
```

Then clone this repo then install dependenices:

```bash
git clone git@github.com:ashleydavis/chatbot-example.git
cd chatbot-example
pnpm install
```

## Run the backend

Open a terminal and change into the backend subdirectory:

```bash
cd chatbot-example/backend
```

Now set required environment variables.

On MacOS and Linux

```bash
export OPENAI_API_KEY=<your api key>
export ASSISTANT_ID=<your assistant id>
```

Or on Windows:

```bash
set OPENAI_API_KEY=<your api key>
set ASSISTANT_ID=<your assistant id>
```

Run the backend in dev mode:

```bash
pnpm run dev
```

## Run the frontend

Open a terminal and change to the frontend subdirectory:

```bash
cd chatbot-example/frontend
```

Run the frontend in dev mode:

```bash
pnpm run dev
```

Open a browser and navigate to [http://localhost:1234/](http://localhost:1234/).

## Build the static web page

```bash
cd chatbot-example/frontend
pnpm run build
```

## Build the TypeScript code

Do this if you want to check for compile errors.

```bash
cd chatbot-example/frontend
pnpm run compile
```
