# MyRaah 🌱

**Your pathway to growth, guidance, and opportunity.**

MyRaah is a student-focused platform designed to connect students with mentors, facilitators, and employers. It aims to simplify the journey from learning and career exploration to mentorship and professional opportunities.

## ✨ Overview

MyRaah brings students and opportunity providers together through a unified platform. Its interface is designed to provide a clear, accessible, and user-friendly experience for every user role.

## 🎯 Objectives

- Help students explore learning and career opportunities.
- Connect students with mentors for guidance and support.
- Enable facilitators to support student development.
- Help employers discover student talent and opportunities.
- Provide role-specific dashboards for a more personalised experience.

## 👥 User Roles

The platform is designed around four primary user roles:

- **Student:** Explore opportunities, access guidance, and manage their learning and career journey.
- **Mentor:** Guide students and share knowledge and expertise.
- **Facilitator:** Support students and coordinate relevant learning activities.
- **Employer:** Discover talent and share career or professional opportunities.

*The availability of individual features depends on the current implementation of the application.*

## 🎨 Design Philosophy

MyRaah aims to provide a modern, welcoming, and accessible user experience.

The UI design direction includes:

- **Claymorphism:** Soft, rounded surfaces with subtle highlights and layered shadows.
- **Consistent layouts:** Clear visual hierarchy, balanced spacing, and reusable components.
- **Responsive design:** Adaptable layouts for desktop, tablet, and mobile screens.
- **Accessible interactions:** Readable typography, sufficient contrast, and clear interactive states.

### Brand Colour Palette

| Colour | Hex Code | Purpose |
|---|---|---|
| Teal | `#00B3A4` | Primary actions and highlights |
| Deep Charcoal | `#263238` | Text and strong contrast |
| Pale Blue-Grey | `#EAF2F5` | Backgrounds and surfaces |
| Soft Cream | `#F8F3D5` | Warm accents |
| White | `#FFFFFF` | Clean surfaces and content areas |

## 🛠️ Technology Stack

The exact technology stack should reflect the dependencies used in the current codebase.

Potential technologies include:

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS or the project's existing styling solution
- **Version Control:** Git and GitHub

Backend services, authentication providers, databases, and APIs should be documented here once their actual implementations are confirmed.

## 📁 Project Structure

The structure below is illustrative. Update it to match the actual project files.

```text
MyRaah/
├── public/             # Static assets
├── src/
│   ├── assets/         # Images, icons, and other assets
│   ├── components/     # Reusable UI components
│   ├── pages/          # Application pages
│   ├── layouts/        # Shared page layouts
│   ├── services/       # API and service integrations, if present
│   ├── hooks/          # Custom hooks, if present
│   ├── styles/         # Global styles and design tokens
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
├── index.html
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Install the following before running the project:

- Node.js — a version compatible with the project's dependencies.
- npm, or the package manager used by the repository.
- Git, if you plan to clone the repository.

### Installation

1. Clone the repository or open your existing project folder.

   ```bash
   git clone <repository-url>
   cd MyRaah
   ```

2. Install dependencies.

   ```bash
   npm install
   ```

3. Start the development server.

   ```bash
   npm run dev
   ```

4. Open the local URL printed in your terminal.

**Note:** These commands assume the project uses npm and provides a `dev` script. Check `package.json` if your setup differs.

## 🧑‍💻 Development Guidelines

To maintain consistency across the application:

- Reuse shared UI components wherever possible.
- Follow the established colour palette, typography, spacing, and claymorphism design system.
- Keep components modular and maintainable.
- Preserve existing routing, authentication, API integrations, and business logic when updating the UI.
- Test changes across desktop, tablet, and mobile screen sizes.
- Avoid introducing unnecessary dependencies or duplicating existing functionality.

## 🧪 Testing and Quality Checks

Run the scripts supported by your project. For example:

```bash
npm run build
npm run lint
```

These commands are available only if the corresponding scripts are configured in `package.json`.

Before submitting changes, verify that the application builds successfully and that existing navigation, forms, dashboards, and interactions continue to work.

## 🤝 Collaboration

When multiple contributors work on MyRaah:

1. Agree on shared components, design tokens, and naming conventions.
2. Divide work by clearly defined pages or components.
3. Avoid editing the same files simultaneously where possible.
4. Commit changes with descriptive messages.
5. Integrate changes and test the complete application before merging.

## 🔮 Future Scope

Potential future improvements may include:

- Enhanced mentorship and student-support workflows.
- Improved opportunity discovery and career exploration.
- More personalised dashboards.
- Expanded facilitator and employer workflows.
- Additional accessibility and usability improvements.

These are possible directions, not a statement that the features are already implemented.

**MyRaah — Connecting students to guidance, growth, and opportunity.**
