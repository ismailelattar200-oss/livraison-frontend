const fs = require('fs');

const filePath = 'Repartos.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const replacements = {
    "bg-white": "bg-[#1C1F3A]",
    "text-navy-deep": "text-white",
    "bg-gray-50/80": "bg-[#0D0D0D]/80",
    "bg-gray-50/50": "bg-[#0D0D0D]/50",
    "bg-gray-50": "bg-[#0D0D0D]",
    "border-gray-100": "border-[#2C3154]",
    "border-gray-200": "border-[#2C3154]",
    "border-gray-300": "border-[#2C3154]",
    "bg-gray-100": "bg-white/5",
    "bg-gray-200": "bg-white/10",
    "text-gray-800": "text-white",
    "text-gray-700": "text-gray-300",
    "text-gray-600": "text-gray-300",
    "text-gray-500": "text-gray-400",
    "bg-amber-100": "bg-amber-500/20",
    "bg-sky-100": "bg-sky-500/20",
    "bg-violet-100": "bg-violet-500/20",
    "bg-emerald-100": "bg-emerald-500/20",
    "border-amber-200": "border-amber-500/30",
    "border-sky-200": "border-sky-500/30",
    "border-violet-200": "border-violet-500/30",
    "border-emerald-200": "border-emerald-500/30",
    "text-amber-800": "text-amber-400",
    "text-sky-800": "text-sky-400",
    "text-violet-800": "text-violet-400",
    "text-emerald-800": "text-emerald-400",
    "bg-violet-50": "bg-violet-500/10",
    "bg-sky-50": "bg-sky-500/10",
    "bg-amber-50": "bg-amber-500/10",
    "bg-emerald-50": "bg-emerald-500/10",
    "bg-violet-600": "bg-violet-500",
    "bg-sky-600": "bg-sky-500",
    "bg-emerald-600": "bg-emerald-500",
    "text-violet-600": "text-violet-400",
    "text-sky-600": "text-sky-400",
    "text-amber-600": "text-amber-400",
    "text-emerald-600": "text-emerald-400",
};

for (const [oldClass, newClass] of Object.entries(replacements)) {
    const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
    content = content.replace(regex, newClass);
}

// A few specific fixes
content = content.replace(/text-navy-deep\/10/g, "text-white/10");
content = content.replace(/bg-navy-deep\/10/g, "bg-white/10");
content = content.replace(/text-navy-deep\/40/g, "text-white/40");
content = content.replace(/text-navy-deep\/50/g, "text-white/50");
content = content.replace(/bg-gradient-to-br from-navy-deep to-navy-deep\/70/g, "bg-gradient-to-br from-[#0D0D0D] to-[#1C1F3A]");
content = content.replace(/bg-gradient-to-r from-navy-deep to-navy-deep\/90/g, "bg-gradient-to-r from-[#0D0D0D] to-[#1C1F3A]");

fs.writeFileSync(filePath, content, 'utf8');
console.log("Replacement done!");
