export const skills = {
  creative: {
    ai: { icon: 'ai', title: 'Artificial Intelligence' },
    // design: { icon: 'design', title: 'Design' },

    // css: { icon: 'css', title: 'CSS' },
    creativeprojectmanagement: { icon: 'creativeprojectmanagement', title: 'Creative Project Management' },
    graphicdesign: { icon: 'graphicdesign', title: 'Graphic Design' },
    // typography: { icon: 'typography', title: 'Typography' },
    webdesign: { icon: 'webdesign', title: 'Web Design' },
    graphics3d: { icon: 'graphics3d', title: '3D Graphics' },
    reactthreefiber: { icon: 'reactthreefiber', title: 'React Three Fiber' },
    // framermotion: { icon: 'framermotion', title: 'Framer Motion' },
    threejs: { icon: 'threejs', title: 'Three.js' },
    uxdesign: { icon: 'uxdesign', title: 'UX Design' },
    animation: { icon: 'animation', title: 'Animation' },
    motiongraphics: { icon: 'motiongraphics', title: 'Motion Design' },
    experience: { icon: 'experience', title: 'Experience Design' },
  },

  engineering: {
    react: { icon: 'react', title: 'React' },
    svelte: { icon: 'svelte', title: 'Svelte' },
    // nextjs: { icon: 'nextjs', title: 'Next.js' },
    // ssr: { icon: 'ssr', title: 'SSR' },
    // html: { icon: 'html', title: 'HTML' },
    // js: { icon: 'js', title: 'JavaScript' },
    engineeringmanagement: { icon: 'engineeringmanagement', title: 'Engineering Management' },
    technicalprojectmanagement: { icon: 'technicalprojectmanagement', title: 'Technical Project Management' },
    digitalisation: { icon: 'digitalisation', title: 'Digitalisation' },
    sequencing: { icon: '4dsequencing', title: '4D Sequencing' },
    modelling3d: { icon: 'modelling3d', title: '3D Modelling' },
    digitaltwins: { icon: 'digitaltwins', title: 'Digital Twins' },
    sensors: { icon: 'sensors', title: 'Sensors' },
    networking: { icon: 'networking', title: 'Networking' },
    iot: { icon: 'iot', title: 'IoT' },
    // nuclear: { icon: 'nuclear', title: 'Nuclear Engineering' },
    // fluid: { icon: 'fluid', title: 'Fluid Engineering' },
    unreal: { icon: 'unreal', title: 'Unreal Game Engine' },
    // wind: { icon: 'wind', title: 'Wind Energy' },
    unity: { icon: 'unity', title: 'Unity Game Engine' },
  },
}

export const SmackContents = {
  Editorial: {
    magazine: 'smack',
    pages: {
      1: { image: '04Editorial', pageIndex: 2 },
      2: { image: '05Editorial', pageIndex: 3 },
    },
    title: 'Editorial',
    skills: [],
  },
  Graphics: {
    magazine: 'smack',
    pages: {
      1: { image: '06Graphics', pageIndex: 4 },
      2: { image: '07Graphics', pageIndex: 5 },
    },
    title: 'Graphics',
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
    skills: [skills.creative.ai, skills.creative.design, skills.creative.animation, skills.creative.motiongraphics],
  },
  Sandro: {
    magazine: 'smack',
    pages: {
      1: { image: '14Sandro', pageIndex: 12 },
      2: { image: '15Sandro', pageIndex: 13 },
    },
    title: 'Sandro',
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
    skills: [skills.creative.experience, skills.creative.projectmanagement],
  },
}

export const EngineerContents = {
  Editorial: {
    magazine: 'engineer',
    pages: {
      1: { image: '04Editorial', pageIndex: 2 },
      2: { image: '05Editorial', pageIndex: 3 },
    },
    title: 'Editorial',
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
    skills: [
      skills.engineering.digitalisation,
      skills.engineering.digitaltwins,
      skills.engineering.engineeringmanagement,
      skills.engineering.nuclear,
      skills.creative.unity,
      skills.creative.unreal,
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
    skills: [skills.engineering.nuclear, skills.engineering.projectmanagement, skills.engineering.modelling3d],
  },
  Modelling: {
    magazine: 'engineer',
    pages: {
      1: { image: '14Modelling', pageIndex: 12 },
      2: { image: '15Modelling', pageIndex: 13 },
    },
    title: 'Modelling',
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
    skills: [
      skills.engineering.digitalisation,
      skills.engineering.digitaltwins,
      skills.engineering.engineeringmanagement,
      skills.engineering.modelling3d,
    ],
  },
}

export const VagueContents = {
  Editorial: {
    magazine: 'vague',
    pages: {
      1: { image: '04Editorial', pageIndex: 3 },
      2: { image: '05Editorial', pageIndex: 4 },
    },
    title: 'Editorial',
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

/**
 * Transforms the skills configuration into separate arrays for engineering and creative skills
 * @param {Object} skillsConfig - The skills configuration object
 * @returns {Array} Array containing all skills in the correct order for display
 */
export const transformSkillsConfig = (skillsConfig) => {
  const engineering = []
  const creative = []

  Object.entries(skillsConfig).forEach(([category, skillSet]) => {
    const orderedSkills = Object.values(skillSet)
    orderedSkills.forEach((skill) => {
      if (category === 'engineering') {
        engineering.push({ content: skill.title, isEngineering: true })
      } else {
        creative.push({ content: skill.title, isEngineering: false })
      }
    })
  })

  // Return concatenated arrays to maintain column separation
  return [...creative, ...engineering]
}
