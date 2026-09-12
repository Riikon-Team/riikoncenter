# Component Guide

## Creating a New Component
1. **Location:** Place base components in `components/ui/`. Domain-specific components belong in their route's `_components/` folder.
2. **Props Rule:** Limit to a maximum of 5 props. If a component needs more, consider:
   - Splitting it into smaller sub-components.
   - Using the Compound Component pattern.

## Example Good Component
```tsx
interface ClockWidgetProps {
  timezone: string;
  is24HourFormat: boolean;
}

export const ClockWidget = ({ timezone, is24HourFormat }: ClockWidgetProps) => {
  // Logic here
  return <div>...</div>;
}
```

## Anti-Pattern (Do not do this)
```tsx
// Too many props, doing too much
<ZenTabFull 
  showClock={true}
  showWeather={true}
  weatherLocation="Hanoi"
  onTodoAdd={() => {}}
  todos={[]}
  user={user}
/>
```
