# Contributing to Nimbus

Thank you for your interest in contributing to Nimbus! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/your-username/Nimbus.git
   cd Nimbus
   ```
3. **Install** dependencies:
   ```bash
   npm install
   ```
4. **Configure** environment variables (see [Setup Guide](docs/setup.md)).
5. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

```bash
# Start development server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build
```

## Project Structure

```
nimbus/
├── app/                    # Next.js App Router pages & API routes
├── components/             # Shared UI components (Radix UI, shadcn)
├── docs/                   # Documentation
│   ├── research/           # Research documentation
│   └── *.md                # User/developer guides
├── lib/                    # Shared utilities, DB client, AI config
├── modules/                # Feature modules
│   ├── ai-chat/            # AI chat sidebar
│   ├── dashboard/          # Project management
│   ├── playground/         # Code editor, file explorer
│   └── webcontainers/      # WebContainer integration
├── prisma/                 # Database schema
└── public/                 # Static assets
```

## Code Style

- **TypeScript**: All new code must be written in TypeScript.
- **Formatting**: Use Prettier with the project's configuration.
- **Linting**: Ensure all code passes ESLint checks.
- **Components**: Follow the existing pattern of feature modules under `modules/`.

## Pull Request Process

1. Ensure your changes pass `npm run lint` and `npm run build`.
2. Update documentation if your changes affect public APIs or features.
3. Write a clear PR description explaining what and why.
4. Link any related issues.

## Reporting Issues

- Use GitHub Issues for bug reports and feature requests.
- Include browser version, OS, and steps to reproduce for bugs.
- Check existing issues before creating duplicates.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
