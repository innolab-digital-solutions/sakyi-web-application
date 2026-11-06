'use client';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import * as React from 'react';

import { cn } from '@/lib/utils/styles';

const Collapsible = CollapsiblePrimitive.Root;
const CollapsibleTrigger = CollapsiblePrimitive.Trigger;
const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, children, ...props }, ref) => (
  // Motion: `app/globals.css` @keyframes `admin-collapsible-*` + @theme --animate-admin-collapsible-* (Radix --radix-collapsible-content-height)
  <CollapsiblePrimitive.Content
    ref={ref}
    data-slot='collapsible-content'
    className={cn(
      'overflow-hidden will-change-[height,opacity]',
      'data-[state=open]:animate-admin-collapsible-down data-[state=closed]:animate-admin-collapsible-up',
      className,
    )}
    {...props}
  >
    {children}
  </CollapsiblePrimitive.Content>
));
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName;

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
