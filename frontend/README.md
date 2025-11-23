# Wakai (??) - Mediation Assistant

Wakai is a web application designed to support mediation centers in Chile, helping parties reach mutual agreement before judicial proceedings. The name "Wakai" (??) is a Japanese legal concept meaning "mutual agreement between two parties, with no winner or loser."

## ? Features

- **Case Management**: Track and manage mediation cases with participant information
- **Contact Tracking**: Log and monitor all communication attempts across multiple channels
- **Emotional Mapping**: Visual overview of participant emotional indicators to support mediation strategies
- **Peaceful UX**: Calm, minimalist interface designed to reduce conflict and promote balance

## ?? Design Philosophy

The Wakai UI embodies:
- **Peace & Calm**: Soft color palette with greens (trust, renewal), warm neutrals (balance), and sky blues (clarity)
- **Modern UX (2025)**: Rounded shapes, micro-interactions, smooth transitions, and high accessibility
- **Neutrality**: No aggressive colors except for critical alerts
- **Clarity**: Clean spacing and strong visual hierarchy

## ??? Tech Stack

- **Framework**: Vite + React 19 + TypeScript (strict mode)
- **Styling**: TailwindCSS v4 with custom Wakai theme
- **Components**: shadcn/ui components (Button, Card, Badge, Input)
- **Icons**: Lucide React
- **Routing**: React Router v6

## ?? Project Structure

```
src/
??? components/         # Shared UI components
?   ??? ui/            # shadcn/ui base components
?   ??? MainLayout.tsx # Main app layout with navbar
??? features/          # Feature-specific modules
?   ??? mediations/   
?   ??? contacts/     
?   ??? emotional-map/
??? hooks/            # Custom React hooks
??? lib/              # Utilities (cn, etc.)
??? pages/            # Route pages
?   ??? CasesPage.tsx
?   ??? CaseDetailPage.tsx
?   ??? ContactsPage.tsx
?   ??? EmotionalMapPage.tsx
??? styles/           # Global styles
?   ??? globals.css
??? types/            # TypeScript domain types
    ??? index.ts
```

## ?? Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm 11.0+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

## ?? Wakai Color Palette

### Soft Greens (Trust, Calm, Renewal)
- `wakai-green-100` to `wakai-green-900`

### Warm Neutrals (Balance, Neutrality)
- `wakai-neutral-100` to `wakai-neutral-900`

### Soft Sky Blues (Clarity, Stability)
- `wakai-blue-100` to `wakai-blue-900`

### Soft Amber (Optimism, Warmth)
- `wakai-amber-100` to `wakai-amber-900`

### Gradient Backgrounds
- `bg-wakai-gradient` - Main peaceful gradient
- `bg-wakai-gradient-calm` - Calm blue gradient

## ?? Domain Types

### MediationCase
```typescript
{
  id: string
  participantName: string
  rut: string // Chilean national ID
  mediationDate: Date
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  description: string
  createdAt: Date
  updatedAt: Date
}
```

### ContactAttempt
```typescript
{
  id: string
  caseId: string
  channel: 'whatsapp' | 'phone' | 'email' | 'in-person'
  date: Date
  result: 'successful' | 'no-answer' | 'declined' | 'scheduled'
  notes: string
}
```

### EmotionalStatus
```typescript
{
  id: string
  caseId: string
  participantName: string
  indicator: 'cooperative' | 'neutral' | 'unsure' | 'resistant'
  notes: string
  assessedAt: Date
}
```

## ?? Custom Utilities

### Wakai Transitions
Use `.wakai-transition` for smooth 300ms transitions

### Neumorphism Effects
- `.wakai-neomorphic` - Subtle raised effect
- `.wakai-neomorphic-inset` - Subtle inset effect

## ?? Routes

- `/` - Redirects to Cases
- `/cases` - List all mediation cases
- `/cases/:id` - Case detail view
- `/contacts` - Contact attempts log
- `/emotional-map` - Emotional indicators overview

## ?? Contributing

This is a starter scaffold. To extend:

1. Add real data persistence (API integration)
2. Implement forms for creating/editing cases
3. Add authentication and user management
4. Expand features based on mediation center needs

## ?? License

Private project for mediation centers in Chile.

---

Built with ?? for peaceful conflict resolution
