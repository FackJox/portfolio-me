/**
 * Layout animation configurations for UI components
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
  topBarText: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.4 }
  },
  topBarBorder: { 
    transition: { 
      type: "spring",
      stiffness: 150,
      damping: 20
    }
  },
  topBarDivider: {
    initial: { scaleY: 0 },
    animate: { scaleY: 1 },
    exit: { scaleY: 0 },
    transition: { 
      type: "spring",
      stiffness: 200,
      damping: 25
    }
  },
  header: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.4 }
  },
  headerContainer: {
    transition: { 
      type: "spring",
      stiffness: 150,
      damping: 20
    }
  },
  headerText: {
    initial: { opacity: 0, rotateX: 90 },
    animate: { opacity: 1, rotateX: 0 },
    exit: { opacity: 0, rotateX: -90 },
    transition: { duration: 0.4 }
  },
  buttons: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.4 }
  },
  buttonsText: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.4, delay: 0.2 }
  },
  buttonsBorder: {
    transition: { 
      type: "spring",
      stiffness: 150,
      damping: 20
    }
  },
  buttonsDivider: {
    initial: { scaleY: 0 },
    animate: { scaleY: 1 },
    exit: { scaleY: 0 },
    transition: { 
      type: "spring",
      stiffness: 200,
      damping: 25
    }
  },
  cta: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4 }
  },
  CTAtext: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4 }
  },
  CTAborder: {
    transition: { 
      type: "spring",
      stiffness: 150,
      damping: 20
    }
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