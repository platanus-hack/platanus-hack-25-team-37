# Wakai Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development Workflow

### Adding a New Page

1. Create page component in `src/pages/YourPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/MainLayout.tsx`

### Adding a New shadcn/ui Component

1. Create component in `src/components/ui/component-name.tsx`
2. Use `cn()` utility for className merging
3. Follow existing component patterns (Button, Card, etc.)

### Using Wakai Colors

```tsx
// Background colors
<div className="bg-wakai-green-100">Soft green background</div>
<div className="bg-wakai-neutral-200">Neutral background</div>
<div className="bg-wakai-blue-100">Soft blue background</div>

// Text colors
<p className="text-wakai-green-700">Green text</p>

// Gradients
<div className="bg-wakai-gradient">Peaceful gradient</div>
```

### Using Custom Utilities

```tsx
// Smooth transitions
<button className="wakai-transition hover:scale-105">
  Animated button
</button>

// Neumorphic effects (use sparingly)
<div className="wakai-neomorphic p-6">
  Subtle 3D effect
</div>
```

## Component Examples

### Creating a Card with Badge

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function MyCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Title</CardTitle>
          <Badge variant="success">Active</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p>Content here</p>
      </CardContent>
    </Card>
  )
}
```

### Using Lucide Icons

```tsx
import { Scale, Calendar, User } from 'lucide-react'

<Scale className="h-5 w-5 text-wakai-green-600" />
```

## TypeScript Tips

### Working with Domain Types

```typescript
import type { MediationCase, ContactAttempt } from '@/types'

const newCase: MediationCase = {
  id: crypto.randomUUID(),
  participantName: 'John Doe',
  rut: '12.345.678-9',
  mediationDate: new Date(),
  status: 'scheduled',
  description: 'Case description',
  createdAt: new Date(),
  updatedAt: new Date(),
}
```

## Code Style

- Use Prettier for formatting (format on save enabled)
- Follow ESLint rules
- Use functional components with hooks
- Prefer named exports for components
- Use TypeScript strict mode (enabled by default)

## Color Psychology in Wakai

- **Green**: Use for success, cooperative states, trust indicators
- **Blue**: Use for information, clarity, stable states
- **Amber/Yellow**: Use for warnings, unsure states, pending actions
- **Red** (soft): Use sparingly, only for critical alerts or resistant states
- **Neutrals**: Use for backgrounds, text, borders

## Accessibility

- All interactive elements have proper focus states
- Color contrast meets WCAG AA standards
- Semantic HTML is used throughout
- Icons have proper aria labels (add when implementing features)

## Next Steps for Implementation

1. **Backend Integration**
   - Replace dummy data with API calls
   - Add data fetching hooks
   - Implement error handling

2. **Forms**
   - Add create/edit forms for cases
   - Implement form validation
   - Add toast notifications

3. **Authentication**
   - Add login/logout flow
   - Implement protected routes
   - Add user profile management

4. **Advanced Features**
   - Add search and filtering
   - Implement data export (PDF/Excel)
   - Add email notifications
   - Create reports and analytics

## Troubleshooting

### Build Errors

If you encounter Tailwind-related errors:
- Ensure `@tailwindcss/postcss` is installed
- Check `postcss.config.js` uses the correct plugin
- Verify CSS syntax in `globals.css` (no @apply with unknown utilities)

### Type Errors

If you get type errors:
- Ensure all imports use the `@/` alias correctly
- Check TypeScript is using workspace version
- Run `npm run build` to see all type errors at once

### Dev Server Issues

If the dev server won't start:
- Check Node.js version (20.19+ or 22.12+)
- Delete `node_modules` and `package-lock.json`, then `npm install`
- Check for port conflicts (default: 5173)
