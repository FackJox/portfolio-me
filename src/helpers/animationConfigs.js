/**
 * Animation configurations for the application
 */

/**
 * Layout animation variants for different UI elements
 */
export const layoutAnimations = {
  topBarText: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.4 }
  },
  topBarBorder: { 
    transition: { duration: 0.4, ease: 'easeInOut' }
  },
  topBarDivider: {
    initial: { scaleY: 0 },
    animate: { scaleY: 1 },
    exit: { scaleY: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' }
  },
  header: {
    initial: { opacity: 0, rotateX: 90 },
    animate: { opacity: 1, rotateX: 0 },
    exit: { opacity: 0, rotateX: -90 },
    transition: { duration: 0.4 }
  },
  buttonsText: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.4, delay: 0.2 }
  },
  buttonsBorder: {
    transition: { duration: 0.4, ease: 'easeInOut' }
  },
  buttonsDivider: {
    initial: { scaleY: 0 },
    animate: { scaleY: 1 },
    exit: { scaleY: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' }
  },
  CTAtext: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4 }
  },
  CTAborder: {
    transition: { duration: 0.4, ease: 'easeInOut' }
  }
};

/**
 * Background color transitions for different magazine styles
 */
export const backgroundTransitions = {
  duration: 0.4,
  ease: 'easeInOut',
  colors: {
    smack: '#0E0504',
    vague: '#2C272F',
    engineer: '#200B5F'
  }
}; 