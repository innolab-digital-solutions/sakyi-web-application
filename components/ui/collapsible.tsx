'use client';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import * as React from 'react';

const Collapsible = CollapsiblePrimitive.Root;
const CollapsibleTrigger = CollapsiblePrimitive.Trigger;
const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, children, ...props }, ref) => (
  // Motion: `app/globals.css` — keyframes `sidebar-collapsible-*` + @layer components rules for `[data-slot='collapsible-content']` (uses Radix `--radix-collapsible-content-height`).
  <CollapsiblePrimitive.Content
    ref={ref}
    data-slot='collapsible-content'
    className={className}
    {...props}
  >
    {children}
  </CollapsiblePrimitive.Content>
));
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName;

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
