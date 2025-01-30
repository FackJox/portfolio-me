export const skills = {
  creative: {
    ai: { icon: 'ai', title: 'AI' },
    design: { icon: 'design', title: 'Design' },
    unreal: { icon: 'unreal', title: 'Unreal Game Engine' },
    unity: { icon: 'unity', title: 'Unity Game Engine' },
    css: { icon: 'css', title: 'CSS' },
    projectmanagement: { icon: 'projectmanagement', title: 'Creative Project Management' },
    graphicdesign: { icon: 'graphicdesign', title: 'Graphic Design' },
    typography: { icon: 'typography', title: 'Typography' },
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
    html: { icon: 'html', title: 'HTML' },
    js: { icon: 'js', title: 'JavaScript' },
    engineeringmanagement: { icon: 'engineeringmanagement', title: 'Engineering Management' },
    sequencing: { icon: '4dsequencing', title: '4D Sequencing' },
    digitalisation: { icon: 'digitalisation', title: 'Digitalisation' },
    sensors: { icon: 'sensors', title: 'Sensors' },
    digitaltwins: { icon: 'digitaltwins', title: 'Digital Twins' },
    nuclear: { icon: 'nuclear', title: 'Nuclear Engineering' },
    fluid: { icon: 'fluid', title: 'Fluid Engineering' },
    wind: { icon: 'wind', title: 'Wind Energy' },
    networking: { icon: 'networking', title: 'Networking' },
    iot: { icon: 'iot', title: 'IoT' },
    modelling3d: { icon: 'modelling3d', title: '3D Modelling' },
  },
}





export const SmackContents = {
  Editorial: { page: 2, title: 'Editorial', skills: [] },
  Graphics: {
    pages: ["06Graphics", "07Graphics"],
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
    pages: ["08Scout", "09Scout"],
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
    pages: ["10Bunker", "11Bunker"],
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
    pages: ["12AI", "13AI"],
    title: 'AI',
    skills: [
      skills.creative.ai,
      skills.creative.design,
      skills.creative.animation,
      skills.creative.motiongraphics,
    ],
  },
  Sandro: {
    pages: ["14Sandro", "15Sandro"],
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
    pages: ["18Tarot", "19Tarot"],
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
    pages: ["20Events", "21Events"],
    title: 'Events',
    skills: [
      skills.creative.experience,
      skills.creative.projectmanagement,
    ],
  },
}



export const EngineerContents = {
  Editorial: { page: 2, title: 'Editorial', skills: [] },
  DigitalTwins: {
    pages: ['06DigitalTwins', '07DigitalTwins', '08DigitalTwins', '09DigitalTwins'],
    title: 'Digital Twins',
    skills: [
      skills.engineering.digitalisation,
      skills.engineering.digitaltwins,
      skills.engineering.engineeringmanagement,
      skills.engineering.nuclear,
      skills.engineering.unity,
      skills.engineering.unreal,
      skills.engineering.react,
    ],
  },
  WindTurbines: {
    pages: ['10WindTurbines', '11WindTurbines'],
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
    pages: ['12HPC', '13HPC'],
    title: 'HPC',
    skills: [
      skills.engineering.nuclear,
      skills.engineering.projectmanagement,
      skills.engineering.modelling3d,
    ],
  },
  Modelling: {
    pages: ['14Modelling', '15Modelling'],
    title: 'Modelling',
    skills: [
      skills.engineering.digitalisation, 
      skills.engineering.digitaltwins, 
      skills.engineering.sequencing, 
      skills.engineering.nuclear, 
      skills.engineering.engineeringmanagement],
  },
  Transformation: {
    pages: ['16Transformation', '17Transformation', '18Transformation', '19Transformation'],
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
  Editorial: { page: 3, title: 'Editorial', skills: [] },
  Timeline: { page: 4, title: 'Timeline', skills: [] },
  About: { page: 5, title: 'About', skills: [] },
  Contributers: { page: 6, title: 'Contributers', skills: [] },
}
