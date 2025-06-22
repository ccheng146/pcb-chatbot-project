import { useEffect } from 'react';

// A hook to prevent scroll events from bubbling up
export const usePreventScroll = (ref) => {
  useEffect(() => {
    if (!ref.current) return;
    
    const element = ref.current;
    
    const preventScrollPropagation = (e) => {
      // Check if the scroll has reached boundaries
      const { scrollTop, scrollHeight, clientHeight } = element;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
      
      // Only prevent default if we're not at the boundaries
      if (!isAtTop && !isAtBottom) {
        e.stopPropagation();
      }
    };
    
    // Listen for wheel and touchmove events
    element.addEventListener('wheel', preventScrollPropagation);
    element.addEventListener('touchmove', preventScrollPropagation);
    
    // Cleanup
    return () => {
      element.removeEventListener('wheel', preventScrollPropagation);
      element.removeEventListener('touchmove', preventScrollPropagation);
    };
  }, [ref]);
};
