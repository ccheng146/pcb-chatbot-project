import { useEffect } from 'react';

// A hook to prevent scroll events from bubbling up - improved for mobile
export const usePreventScroll = (ref) => {
  useEffect(() => {
    if (!ref.current) return;
    
    const element = ref.current;
    
    const preventScrollPropagation = (e) => {
      // Check if the scroll has reached boundaries
      const { scrollTop, scrollHeight, clientHeight } = element;
      const isAtTop = scrollTop <= 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
      
      // Only prevent default if we're not at the boundaries
      if (!isAtTop && !isAtBottom) {
        e.stopPropagation();
        if (e.cancelable) e.preventDefault();
      }
    };
    
    // Passive false is important for mobile to allow preventDefault
    const options = { passive: false };
    
    // Listen for wheel and touch events
    element.addEventListener('wheel', preventScrollPropagation, options);
    element.addEventListener('touchmove', preventScrollPropagation, options);
    
    // Handle iOS overscroll behavior
    const preventIOSBounce = (e) => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      
      if ((scrollTop <= 0 && e.deltaY < 0) || 
          (scrollTop + clientHeight >= scrollHeight && e.deltaY > 0)) {
        if (e.cancelable) e.preventDefault();
      }
    };
    
    element.addEventListener('wheel', preventIOSBounce, { passive: false });
    
    // Cleanup
    return () => {
      element.removeEventListener('wheel', preventScrollPropagation);
      element.removeEventListener('touchmove', preventScrollPropagation);
      element.removeEventListener('wheel', preventIOSBounce);
    };
  }, [ref]);
};
