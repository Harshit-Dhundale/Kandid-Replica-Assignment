import { useEffect, useRef, useState } from 'react';

interface UseMatchHeightOptions {
  targetSelector: string;
  sourceSelector: string;
  enabled?: boolean;
}

export function useMatchHeight({ 
  targetSelector, 
  sourceSelector, 
  enabled = true 
}: UseMatchHeightOptions) {
  const [height, setHeight] = useState<number | null>(null);
  const targetRef = useRef<HTMLElement>(null);
  const sourceRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const updateHeight = () => {
      const sourceElement = document.querySelector(sourceSelector) as HTMLElement;
      const targetElement = document.querySelector(targetSelector) as HTMLElement;
      
      if (sourceElement && targetElement) {
        const sourceHeight = sourceElement.getBoundingClientRect().height;
        setHeight(sourceHeight);
        
        // Apply height directly to target element
        targetElement.style.height = `${sourceHeight}px`;
      }
    };

    // Initial measurement
    updateHeight();

    // Set up resize observer for dynamic updates
    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    const sourceElement = document.querySelector(sourceSelector);
    if (sourceElement) {
      resizeObserver.observe(sourceElement);
    }

    // Also listen to window resize as fallback
    window.addEventListener('resize', updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [targetSelector, sourceSelector, enabled]);

  return { height, targetRef, sourceRef };
}

