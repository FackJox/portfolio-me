/**
 * Configuration constants for Contents
 */

// Skills configuration
export const skills = {
  creative: {
    ai: { icon: 'ai', title: 'Artificial Intelligence' },
    // music: { icon: 'music', title: 'Music' },

    // css: { icon: 'css', title: 'CSS' },
    projectmanagement: { icon: 'creativeprojectmanagement', title: 'Creative Project Management' },
    design: { icon: 'design', title: '2D & 3D Design' },
    // typography: { icon: 'typography', title: 'Typography' },
    // webdesign: { icon: 'webdesign', title: 'Web Design' },
    // graphics3d: { icon: 'graphics3d', title: '3D Graphics' },
    reactthreefiber: { icon: 'reactthreefiber', title: 'Three.js/R3F, WebGL' },
    animation: { icon: 'animation', title: 'Animation & Motion' },
    // threejs: { icon: 'threejs', title: 'Three.js' },

    // uxdesign: { icon: 'uxdesign', title: 'UX Design' },
    // animation: { icon: 'animation', title: 'Animation' },
    // motiongraphics: { icon: 'motiongraphics', title: 'Motion Design' },
    // experience: { icon: 'experience', title: 'Experience Design' },
  },

  engineering: {
    react: { icon: 'react', title: 'React, Svelte, Next.js' },
    // svelte: { icon: 'svelte', title: 'Svelte' },
    // nextjs: { icon: 'nextjs', title: 'Next.js' },
    // // ssr: { icon: 'ssr', title: 'SSR' },
    // html: { icon: 'html', title: 'HTML' },
    // js: { icon: 'js', title: 'JavaScript' },
    engineeringmanagement: { icon: 'engineeringmanagement', title: 'Engineering Management' },
    // projectmanagement: { icon: 'technicalprojectmanagement', title: 'Technical Project Management' },
    digitalisation: { icon: 'digitalisation', title: 'Digitalisation' },
    // sequencing: { icon: '4dsequencing', title: '4D Sequencing' },
    // modelling3d: { icon: 'modelling3d', title: '3D Modelling' },
    digitaltwins: { icon: 'digitaltwins', title: 'Game Engines' },
    systemsarchitecture: { icon: 'systemsarchitecture', title: 'Systems Architecture' },
    // sensors: { icon: 'sensors', title: 'Sensors' },
    // networking: { icon: 'networking', title: 'Networking' },
    // iot: { icon: 'iot', title: 'IoT' },
    // nuclear: { icon: 'nuclear', title: 'Nuclear Engineering' },
    // fluid: { icon: 'fluid', title: 'Fluid Engineering' },
    // unreal: { icon: 'unreal', title: 'Unreal Game Engine' },
    // // wind: { icon: 'wind', title: 'Wind Energy' },
    // unity: { icon: 'unity', title: 'Unity Game Engine' },
  },
}

// Smack Magazine Contents
export const SmackContents = {
  Contents: {
    magazine: 'smack',
    pages: {
      1: { image: '02Contents', pageIndex: 0 },
      2: { image: '03Contents', pageIndex: 1 },
    },
    title: 'Contents',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum euismod mauris vel lectus tincidunt, ac venenatis nunc consequat.',
    skills: [],
  },
  Editorial: {
    magazine: 'smack',
    pages: {
      1: { image: '04Editorial', pageIndex: 2 },
      2: { image: '05Editorial', pageIndex: 3 },
    },
    title: 'Editorial',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum euismod mauris vel lectus tincidunt, ac venenatis nunc consequat.',
    skills: [],
  },
  Graphics: {
    magazine: 'smack',
    pages: {
      1: { image: '06Graphics', pageIndex: 4 },
      2: { image: '07Graphics', pageIndex: 5 },
    },
    title: 'Graphics',
    description:
      'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    skills: [
      skills.creative.design,
      skills.creative.ai,
      skills.creative.graphicdesign,
      skills.creative.typography,
      skills.creative.animation,
      skills.creative.motiongraphics,
    ],
  },
  Scout: {
    magazine: 'smack',
    pages: {
      1: { image: '08Scout', pageIndex: 6 },
      2: { image: '09Scout', pageIndex: 7 },
    },
    title: 'Scout',
    description:
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.',
    skills: [
      skills.creative.design,
      skills.creative.ai,
      skills.creative.graphicdesign,
      skills.creative.typography,
      skills.creative.projectmanagement,
    ],
  },
  Bunker: {
    magazine: 'smack',
    pages: {
      1: { image: '10Bunker', pageIndex: 8 },
      2: { image: '11Bunker', pageIndex: 9 },
    },
    title: 'Bunker',
    description:
      'Nulla facilisi morbi tempus iaculis urna id volutpat lacus. Vivamus at augue eget arcu dictum varius duis at consectetur.',
    skills: [
      skills.creative.design,
      skills.creative.ai,
      skills.creative.graphicdesign,
      skills.creative.typography,
      skills.creative.projectmanagement,
    ],
  },
  AI: {
    magazine: 'smack',
    pages: {
      1: { image: '12AI', pageIndex: 10 },
      2: { image: '13AI', pageIndex: 11 },
    },
    title: 'AI',
    description:
      'Praesent elementum facilisis leo vel fringilla est ullamcorper eget. Scelerisque eleifend donec pretium vulputate sapien nec sagittis aliquam.',
    skills: [skills.creative.ai, skills.creative.design, skills.creative.animation, skills.creative.motiongraphics],
  },
  Sandro: {
    magazine: 'smack',
    pages: {
      1: { image: '14Sandro', pageIndex: 12 },
      2: { image: '15Sandro', pageIndex: 13 },
    },
    title: 'Sandro',
    description:
      'Feugiat in fermentum posuere urna nec tincidunt praesent semper. Tortor consequat id porta nibh venenatis cras sed felis eget.',
    skills: [
      skills.creative.css,
      skills.creative.webdesign,
      skills.creative.reactthreefiber,
      skills.creative.framermotion,
      skills.creative.threejs,
      skills.creative.uxdesign,
      skills.creative.graphics3d,
      skills.engineering.react,
      skills.engineering.html,
      skills.engineering.js,
    ],
  },
  Tarot: {
    magazine: 'smack',
    pages: {
      1: { image: '18Tarot', pageIndex: 14 },
      2: { image: '19Tarot', pageIndex: 15 },
    },
    title: 'Tarot',
    description:
      'Massa tincidunt dui ut ornare lectus sit amet est placerat. Nunc pulvinar sapien et ligula ullamcorper malesuada proin libero.',
    skills: [
      skills.creative.css,
      skills.creative.webdesign,
      skills.creative.reactthreefiber,
      skills.creative.framermotion,
      skills.creative.threejs,
      skills.creative.uxdesign,
      skills.creative.graphics3d,
      skills.creative.experience,
      skills.engineering.svelte,
      skills.engineering.html,
      skills.engineering.js,
    ],
  },
  Events: {
    magazine: 'smack',
    pages: {
      1: { image: '20Events', pageIndex: 16 },
      2: { image: '21Events', pageIndex: 17 },
    },
    title: 'Events',
    description:
      'Vitae congue eu consequat ac felis donec et odio pellentesque. Habitant morbi tristique senectus et netus et malesuada fames.',
    skills: [skills.creative.experience, skills.creative.projectmanagement],
  },
}

// Engineer Magazine Contents
export const EngineerContents = {
  Contents: {
    magazine: 'engineer',
    pages: {
      1: { image: '02Contents', pageIndex: 0 },
      2: { image: '03Contents', pageIndex: 1 },
    },
    title: 'Contents',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum euismod mauris vel lectus tincidunt, ac venenatis nunc consequat.',
    skills: [],
  },
  Editorial: {
    magazine: 'engineer',
    pages: {
      1: { image: '04Editorial', pageIndex: 2 },
      2: { image: '05Editorial', pageIndex: 3 },
    },
    title: 'Editorial',
    description:
      'Egestas dui id ornare arcu odio ut sem nulla pharetra. Amet consectetur adipiscing elit pellentesque habitant morbi tristique.',
    skills: [],
  },
  DigitalTwins: {
    magazine: 'engineer',
    pages: {
      1: { image: '06DigitalTwins', pageIndex: 4 },
      2: { image: '07DigitalTwins', pageIndex: 5 },
      3: { image: '08DigitalTwins', pageIndex: 6 },
      4: { image: '09DigitalTwins', pageIndex: 7 },
    },
    title: 'Digital Twins',
    description:
      'Cursus mattis molestie a iaculis at erat pellentesque adipiscing commodo. Dignissim suspendisse in est ante in nibh mauris cursus.',
    skills: [
      skills.engineering.digitalisation,
      skills.engineering.digitaltwins,
      skills.engineering.engineeringmanagement,
      skills.engineering.unity,
      skills.engineering.unreal,
      skills.engineering.react,
    ],
  },
  WindTurbines: {
    magazine: 'engineer',
    pages: {
      1: { image: '10WindTurbines', pageIndex: 8 },
      2: { image: '11WindTurbines', pageIndex: 9 },
    },
    title: 'Wind Turbines',
    description:
      'Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Vulputate eu scelerisque felis imperdiet proin fermentum leo vel.',
    skills: [
      skills.engineering.wind,
      skills.engineering.fluid,
      skills.engineering.sensors,
      skills.engineering.digitalisation,
      skills.engineering.networking,
      skills.engineering.iot,
    ],
  },
  HPC: {
    magazine: 'engineer',
    pages: {
      1: { image: '12HPC', pageIndex: 10 },
      2: { image: '13HPC', pageIndex: 11 },
    },
    title: 'HPC',
    description:
      'Elementum facilisis leo vel fringilla est ullamcorper eget nulla. Volutpat maecenas volutpat blandit aliquam etiam erat velit scelerisque.',
    skills: [skills.engineering.nuclear, skills.engineering.projectmanagement, skills.engineering.modelling3d],
  },
  Modelling: {
    magazine: 'engineer',
    pages: {
      1: { image: '14Modelling', pageIndex: 12 },
      2: { image: '15Modelling', pageIndex: 13 },
    },
    title: 'Modelling',
    description:
      'Amet risus nullam eget felis eget nunc lobortis mattis aliquam. Ornare arcu dui vivamus arcu felis bibendum ut tristique.',
    skills: [
      skills.engineering.digitalisation,
      skills.engineering.digitaltwins,
      skills.engineering.sequencing,
      skills.engineering.nuclear,
      skills.engineering.engineeringmanagement,
    ],
  },
  Transformation: {
    magazine: 'engineer',
    pages: {
      1: { image: '16Transformation', pageIndex: 14 },
      2: { image: '17Transformation', pageIndex: 15 },
      3: { image: '18Transformation', pageIndex: 16 },
      4: { image: '19Transformation', pageIndex: 17 },
    },
    title: 'Transformation',
    description:
      'Pellentesque habitant morbi tristique senectus et netus et malesuada. Nunc faucibus a pellentesque sit amet porttitor eget dolor.',
    skills: [
      skills.engineering.digitalisation,
      skills.engineering.digitaltwins,
      skills.engineering.engineeringmanagement,
      skills.engineering.modelling3d,
    ],
  },
}

// Vague Magazine Contents
export const VagueContents = {
  Contents: {
    magazine: 'vague',
    pages: {
      1: { image: '02Contents', pageIndex: 0 },
      2: { image: '03Contents', pageIndex: 1 },
    },
    title: 'Contents',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum euismod mauris vel lectus tincidunt, ac venenatis nunc consequat.',
    skills: [],
  },
  Editorial: {
    magazine: 'vague',
    pages: {
      1: { image: '04Editorial', pageIndex: 2 },
      2: { image: '05Editorial', pageIndex: 3 },
    },
    title: 'Editorial',
    description:
      'Tempus imperdiet nulla malesuada pellentesque elit eget gravida cum. Sit amet cursus sit amet dictum sit amet justo.',
    skills: [],
  },
  Timeline: {
    magazine: 'vague',
    pages: {
      1: { image: '06Timeline', pageIndex: 5 },
      2: { image: '07Timeline', pageIndex: 6 },
    },
    title: 'Timeline',
    skills: [],
  },
  About: {
    magazine: 'vague',
    pages: {
      1: { image: '08About', pageIndex: 7 },
      2: { image: '09About', pageIndex: 8 },
    },
    title: 'About',
    skills: [],
  },
  Contributers: {
    magazine: 'vague',
    pages: {
      1: { image: '10Contributers', pageIndex: 9 },
      2: { image: '11Contributers', pageIndex: 10 },
    },
    title: 'Contributers',
    skills: [],
  },
}