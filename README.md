# 10x-cards

## Project Description

The 10x-cards project aims to enable users to efficiently create and manage educational flashcard sets. The application leverages AI-powered flashcard generation from user-provided text and also allows manual flashcard creation, editing, and management. It includes functionalities for user registration, login, spaced repetition study sessions, and provides a user-friendly interface to review AI-generated flashcards.

## Tech Stack

- **Frontend:** Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui
- **Backend:** Supabase (PostgreSQL, authentication, etc.)
- **AI:** Openrouter.ai for LLM-powered flashcard generation
- **CI/CD & Hosting:** GitHub Actions, DigitalOcean

## Getting Started Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ulyana18/10xCourse.git
   cd 10x-astro-starter
   ```

2. **Node Version:**
   This project requires Node.js as specified in the `.nvmrc` file:
   ```bash
   nvm use
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

6. **Preview the production build:**
   ```bash
   npm run preview
   ```

## Available Scripts

- `npm run dev` - Starts the Astro development server.
- `npm run build` - Builds the project for production.
- `npm run preview` - Previews the production build.
- `npm run astro` - Runs Astro CLI commands.
- `npm run lint` - Lints the project.
- `npm run lint:fix` - Fixes linting issues.
- `npm run format` - Formats the code using Prettier.

## Project Scope

The project includes:

- **AI-Powered Flashcard Generation:** Users can input large texts (between 1,000 and 10,000 characters) and receive AI-generated flashcard suggestions.
- **Manual Flashcard Management:** Ability to create, edit, and delete flashcards manually.
- **User Authentication:** Registration, login, and account management for personalized flashcard collections.
- **Spaced Repetition:** An integrated study session based on spaced repetition to enhance learning retention.

**Out of Scope:**

- Advanced spaced repetition algorithms beyond the MVP.
- Mobile application support.
- Public API access and flashcard sharing features.
- Gamification and advanced notifications.

## Project Status

Version: 0.0.1 - Under active development / early stage.

## License

This project is licensed under the MIT License. 