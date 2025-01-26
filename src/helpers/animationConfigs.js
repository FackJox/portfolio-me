/**
 * Animation configurations for the application
 */

export const ANIMATION_CONFIG = {
  portrait: {
    float: {
      intensity: 0.5,
      speed: 0.7,
      rotationIntensity: 2
    },
    lerp: {
      button: {
        text: 0.1,
        color: 0.1
      },
      pageView: 0.03,
      carousel: 0.1
    }
  },
  landscape: {
    float: {
      intensity: 0.5,
      speed: 0.7,
      rotationIntensity: 2
    },
    lerp: {
      button: {
        text: 0.1,
        color: 0.1
      },
      pageView: 0.03,
      carousel: 0.1
    }
  }
};

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