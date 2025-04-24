# Lead Buddy AI

Lead Buddy AI is an AI-powered platform designed to help managers practice critical conversations in a realistic and safe environment. The application leverages advanced AI models to simulate real-world workplace scenarios, empowering users to build confidence and enhance their leadership communication skills.

<Pending App Deployed Vercel Link>

## 📌 Features

- **Realistic Conversation Simulations**: Practice with AI-powered employees that respond naturally to your communication style
- **Custom Scenarios**: Create personalized scenarios tailored to your specific management challenges
- **Performance Feedback**: Receive detailed analysis on clarity, empathy, and effectiveness
- **Saved Conversations**: Save and revisit your practice sessions to track improvement
- **User Authentication**: Secure user accounts with Supabase authentication
- **Responsive Design**: Fully responsive interface that works on desktop and mobile devices

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **State Management**: React Context API
- **Styling**: Tailwind CSS with theming support (light/dark mode)
- **Icons**: Lucide React
- **AI Models**: OpenAI GPT-4 integrated with LangChain for advanced conversational capabilities

## 🛠 Setup and Installation

Clone the repository:
```sh
git clone https://github.com/your-username/lead-buddy-ai.git
cd lead-buddy-ai
```
Install dependencies:
```
npm install
```
## 🚀 Running the App

Start the development server:
```
npm run dev
Visit: http://localhost:3000 to view the app.
```
Prerequisites
```sh
Node.js (version 18 or higher recommended)
```


## Environment Variables

Create a .env file at the root of the project with the following variables:

```sh
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

## 🌎 Deployment

You can deploy the app using:

Vercel (recommended for Next.js)

## 🤝 Contributions are welcome! To propose changes:
```sh
Fork the repository.
Create a new feature branch.
Open a pull request.
```
## 📜 License

This project is licensed under the MIT License.