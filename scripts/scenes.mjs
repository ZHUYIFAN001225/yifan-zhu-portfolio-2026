// The scene behind each project: a short film loop where there is one, otherwise its strongest still.
// Shared by the explore page and the case-page covers.
const S = 'assets/v3/scenes/';
// Sources big enough to fill a screen sharply run full-bleed. Smaller or upright ones sit crisp in a frame,
// over a blurred wash of themselves, so nothing is ever stretched past its own resolution.
export const SCENE = {
  'salon-booking': { video: S + 'salon-loop.mp4', poster: S + 'salon-loop.jpg' },
  'beauty-marketplace': { wall: [['discover', 'detail', 'make-it-real', 'matches', 'creator'], ['booked', 'similar', 'c-home', 'taste', 'saved'], ['c-portfolio', 'availability', 'search', 'chat', 'profile'], ['matches-map', 'c-requests', 'discover', 'summary', 'c-calendar'], ['detail', 'creator-search', 'booked', 'c-respond', 'work-info'], ['make-it-real', 'messages', 'c-home', 'preview', 'matches']] },
  'idea-to-edit': { video: S + 'idea-to-edit.mp4', poster: S + 'idea-to-edit.jpg' },
  'doodle-to-real': { video: 'assets/projects/doodle-to-real/a-05-landscape.mp4', poster: 'assets/projects/doodle-to-real/a-05-landscape.jpg' },
  'storyboard-skill': { img: 'assets/projects/storyboard-skill/sketch-drama-s06.webp', grain: true },
  'cyber-toolkit': { video: S + 'cyber-toolkit.mp4?v=2', poster: S + 'cyber-toolkit.jpg?v=2', scan: true },
  'blender-reel': { video: S + 'blender-loop.mp4', poster: S + 'blender-loop.jpg' },
  'ai-video-restyle': { video: S + 'poker-loop.mp4', poster: S + 'poker-loop.jpg' },
  'web-prototype': { video: S + 'naturalis-loop.mp4', poster: S + 'naturalis-loop.jpg', grain: true },
  'ai-motion': { video: S + 'ai-motion.mp4', poster: S + 'ai-motion.jpg', grain: true },
  'modeling-01': { video: S + 'modeling-01.mp4', poster: S + 'modeling-01.jpg' },
  'modeling-02': { video: S + 'modeling-02.mp4', poster: S + 'modeling-02.jpg', grain: true },
  'modeling-03': { video: S + 'modeling-03.mp4', poster: S + 'modeling-03.jpg' },
  'ear-shield': { img: S + 'ear-shield.webp', grain: true },
  'anxiety-market': { img: S + 'anxiety-market.webp', grain: true },
  'biodiversity-clock': { img: S + 'biodiversity-clock-hd.webp' },
  'seedwalkers': { img: S + 'seedwalkers.webp', grain: true },
  'machine-mapping': { img: S + 'machine-mapping.webp' },
  'scone': { img: S + 'scone-hd.webp' },
  'cross-culture': { img: S + 'cross-culture.webp', grain: true },
  'resource-platform': { video: S + 'city-loop.mp4', poster: S + 'city-loop.jpg' }
};

// One accent per project, tuned for the dark theme: used by the case pages' cover and atmosphere.
export const ACCENT = {
  'idea-to-edit': '#5fe0c6', 'doodle-to-real': '#ffb35c', 'storyboard-skill': '#e8c07a', 'cyber-toolkit': '#6fd3ff',
  'blender-reel': '#7fb2ff', 'ai-video-restyle': '#ff8a6b', 'web-prototype': '#f4b541', 'ai-motion': '#8f7bff',
  'modeling-01': '#7fb2ff', 'modeling-02': '#8fe3ff', 'modeling-03': '#7fb2ff', 'ear-shield': '#62b0ff',
  'anxiety-market': '#ff9d6e', 'biodiversity-clock': '#c9d97a', 'seedwalkers': '#9fd18b', 'machine-mapping': '#c39bff',
  'scone': '#e6b66e', 'cross-culture': '#f0a35e', 'resource-platform': '#7fc4ff', 'beauty-marketplace': '#f5a3c7', 'salon-booking': '#5fd39a'
};
