# YouLearn Clone

This project is a platform for learning through video content. It is built with React, TypeScript, and Vite, and utilizes Supabase for the backend.

## Features

- **User Authentication:** Sign up, sign in, and password recovery.
- **Video Upload:** Upload videos for processing and learning.
- **Content Generation:** Automatically generate summaries, chapters, quizzes, and flashcards from video content.
- **Interactive Learning:** Engage with the content through a chat interface, notes, and quizzes.
- **Personalized Experience:** Tailor the learning experience with personal forms and different education levels.

## Tech Stack

- **Frontend:**
  - React
  - TypeScript
  - Vite
  - Tailwind CSS
  - React Router
  - Axios
- **Backend:**
  - Supabase
- **Linting and Formatting:**
  - ESLint

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js
- npm

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username/youlearn_clone.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Set up your Supabase environment variables in a `.env` file.

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Runs the app in the development mode.
- `npm run build`: Builds the app for production.
- `npm run lint`: Lints the code.
- `npm run preview`: Previews the production build.

## Project Structure

```
.
├── backend
│   └── server.js
├── public
│   └── vite.svg
├── src
│   ├── assets
│   ├── components
│   │   ├── auth
│   │   ├── landing page
│   │   └── main
│   ├── context api
│   ├── hooks
│   ├── pages
│   │   ├── auth
│   │   ├── landing page
│   │   └── main
│   ├── providers
│   └── utils
├── .gitignore
├── index.html
├── package.json
└── vite.config.ts
```
