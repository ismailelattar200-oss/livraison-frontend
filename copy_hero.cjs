const fs = require('fs');
const path = require('path');

const srcFish = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\53331b9e-1292-4ff4-a58f-25255b162690\\marea_hero_fish_1782416266912.png';
const srcSeafood = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\53331b9e-1292-4ff4-a58f-25255b162690\\marea_hero_seafood_1782416338056.png';
const srcTable = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\53331b9e-1292-4ff4-a58f-25255b162690\\marea_hero_table_1782416371220.png';

const destDir = path.join(__dirname, 'public');
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

try {
    if (fs.existsSync(srcFish)) fs.copyFileSync(srcFish, path.join(destDir, 'hero-fish.png'));
    if (fs.existsSync(srcSeafood)) fs.copyFileSync(srcSeafood, path.join(destDir, 'hero-seafood.png'));
    if (fs.existsSync(srcTable)) fs.copyFileSync(srcTable, path.join(destDir, 'hero-table.png'));
    console.log('Hero images copied successfully!');
} catch (e) {
    console.error('Copy error:', e);
}
