const fs = require('fs');
let svg = fs.readFileSync('public/seo-hero-illustration.svg', 'utf8');

const styleBlock = `
<style>
  @keyframes floatChar {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  @keyframes floatTab {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  @keyframes swayPlant {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(1deg); }
  }

  [id^="freepik--Character"] {
    animation: floatChar 5s ease-in-out infinite;
    transform-origin: bottom center;
  }
  [id="freepik--Character_2--inject-74"] {
    animation-delay: -2.5s;
  }

  [id^="freepik--Tab_"] {
    animation: floatTab 6s ease-in-out infinite;
    transform-origin: center;
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  [id="freepik--Tab_1--inject-74"] { animation-delay: -0s; }
  [id="freepik--Tab_2--inject-74"] { animation-delay: -1.5s; }
  [id="freepik--Tab_3--inject-74"] { animation-delay: -3s; }
  [id="freepik--Tab_4--inject-74"] { animation-delay: -4.5s; }

  [id^="freepik--Tab_"]:hover {
    transform: scale(1.04) translateY(-15px) !important;
    cursor: pointer;
  }

  [id^="freepik--freepik--Plant"] {
    animation: swayPlant 8s ease-in-out infinite;
    transform-origin: bottom center;
  }
  
  [id="freepik--Shadow--inject-74"] {
    opacity: 0.6;
  }
</style>
`;

svg = svg.replace('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">${styleBlock}`);

fs.writeFileSync('public/seo-hero-illustration.svg', svg);
console.log('Successfully injected animations into SVG.');
