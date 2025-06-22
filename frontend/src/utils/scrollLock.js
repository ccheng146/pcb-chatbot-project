/**
 * Utility to prevent unwanted scrolling
 */

let isScrollLocked = false;
let savedScrollPosition = 0;

// Lock the scroll position
export const lockScroll = () => {
  if (!isScrollLocked) {
    savedScrollPosition = window.scrollY || document.documentElement.scrollTop;
    isScrollLocked = true;
  }
};

// Restore the scroll position
export const unlockScroll = () => {
  if (isScrollLocked) {
    window.scrollTo(0, savedScrollPosition);
    isScrollLocked = false;
  }
};

// Wrap an event handler with scroll protection
export const withScrollProtection = (handler) => {
  return (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    lockScroll();
    handler(e);
    
    // Use setTimeout to ensure the scroll position is restored after React updates
    setTimeout(unlockScroll, 10);
  };
};
