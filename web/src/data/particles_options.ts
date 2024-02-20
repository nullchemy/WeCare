export const particles_options = {
  particles: {
    number: {
      value: 205,
      density: {
        enable: true,
        value_area: 900,
      },
    },
    color: {
      value: ['#9b9b9b', '#00AB44', '#FF4136', '#F9A825', '#9b9b9b', '#9b9b9b'],
    },
    shape: {
      type: 'circle',
      stroke: {
        width: 0,
        color: '#9b9b9b',
      },
      polygon: {
        nb_sides: 5,
      },
    },
    opacity: {
      value: 1,
      random: true,
      anim: {
        enable: true,
        speed: 1,
        opacity_min: 0.2,
        sync: true,
      },
    },
    size: {
      value: 2,
      random: true,
      anim: {
        enable: false,
        speed: 40,
        size_min: 0.1,
        sync: false,
      },
    },
    links: {
      color: '#9b9b9b',
      distance: 150,
      enable: true,
      opacity: 0.5,
      width: 1,
    },
    line_linked: {
      enable: true,
      distance: 140,
      color: '#9b9b9b',
      opacity: 0.7,
      width: 1,
    },
    move: {
      enable: true,
      speed: 0.5,
      direction: 'none',
      random: false,
      straight: false,
      out_mode: 'out',
      bounce: false,
      attract: {
        enable: false,
        rotateX: 600,
        rotateY: 1200,
      },
    },
  },
  interactivity: {
    detect_on: 'canvas',
    events: {
      onhover: {
        enable: true,
        mode: 'repulse',
      },
      onclick: {
        enable: false,
        mode: 'push',
      },
      resize: true,
    },
    modes: {
      grab: {
        distance: 140,
        line_linked: {
          opacity: 1,
        },
      },
      bubble: {
        distance: 400,
        size: 40,
        duration: 2,
        opacity: 8,
        speed: 3,
      },
      repulse: {
        distance: 200,
        duration: 0.4,
      },
      push: {
        particles_nb: 4,
      },
      remove: {
        particles_nb: 2,
      },
    },
  },
  retina_detect: true,
}
