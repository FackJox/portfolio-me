/**
 * Animation configurations for the application
 */

/**
 * Layout animation variants for different UI elements
 */
export const layoutAnimations = {
  topBar: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.4 }
  },
  header: {
    initial: { opacity: 0, rotateX: 90 },
    animate: { opacity: 1, rotateX: 0 },
    exit: { opacity: 0, rotateX: -90 },
    transition: { duration: 0.4 }
  },
  buttons: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.4, delay: 0.2 }
  },
  cta: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4 }
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