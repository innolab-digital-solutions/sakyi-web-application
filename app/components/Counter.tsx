'use client';

import { useState } from 'react';

type CounterProps = {
  initialCount?: number;
};

export default function Counter({ initialCount = 0 }: CounterProps) {
  const [count, setCount] = useState(initialCount);

  return (
    <div>
      <p>Current count: {count}</p>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Increment
      </button>
    </div>
  );
}

