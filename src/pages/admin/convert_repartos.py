import re

file_path = "Repartos.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    r"bg-white": "bg-[#1C1F3A]",
    r"text-navy-deep": "text-white",
    r"bg-gray-50/80": "bg-[#0D0D0D]/80",
    r"bg-gray-50/50": "bg-[#0D0D0D]/50",
    r"bg-gray-50": "bg-[#0D0D0D]",
    r"border-gray-100": "border-[#2C3154]",
    r"border-gray-200": "border-[#2C3154]",
    r"border-gray-300": "border-[#2C3154]",
    r"bg-gray-100": "bg-white/5",
    r"bg-gray-200": "bg-white/10",
    r"text-gray-800": "text-white",
    r"text-gray-700": "text-gray-300",
    r"text-gray-600": "text-gray-300",
    r"text-gray-500": "text-gray-400",
    r"bg-amber-100": "bg-amber-500/20",
    r"bg-sky-100": "bg-sky-500/20",
    r"bg-violet-100": "bg-violet-500/20",
    r"bg-emerald-100": "bg-emerald-500/20",
    r"border-amber-200": "border-amber-500/30",
    r"border-sky-200": "border-sky-500/30",
    r"border-violet-200": "border-violet-500/30",
    r"border-emerald-200": "border-emerald-500/30",
    r"text-amber-800": "text-amber-400",
    r"text-sky-800": "text-sky-400",
    r"text-violet-800": "text-violet-400",
    r"text-emerald-800": "text-emerald-400",
    r"bg-violet-50": "bg-violet-500/10",
    r"bg-sky-50": "bg-sky-500/10",
    r"bg-amber-50": "bg-amber-500/10",
    r"bg-emerald-50": "bg-emerald-500/10",
    r"bg-violet-600": "bg-violet-500",
    r"bg-sky-600": "bg-sky-500",
    r"bg-emerald-600": "bg-emerald-500",
    r"text-violet-600": "text-violet-400",
    r"text-sky-600": "text-sky-400",
    r"text-amber-600": "text-amber-400",
    r"text-emerald-600": "text-emerald-400",
}

for old, new in replacements.items():
    content = re.sub(r"\b" + old + r"\b", new, content)

# A few specific fixes
content = content.replace("text-navy-deep/10", "text-white/10")
content = content.replace("bg-navy-deep/10", "bg-white/10")
content = content.replace("text-navy-deep/40", "text-white/40")
content = content.replace("text-navy-deep/50", "text-white/50")
content = content.replace("bg-gradient-to-br from-navy-deep to-navy-deep/70", "bg-gradient-to-br from-[#0D0D0D] to-[#1C1F3A]")
content = content.replace("bg-gradient-to-r from-navy-deep to-navy-deep/90", "bg-gradient-to-r from-[#0D0D0D] to-[#1C1F3A]")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Replacement done!")
