import os
import json

base_dir = r"d:\mybiopage\its_me_midhun\public\data"
os.makedirs(base_dir, exist_ok=True)

profile_data = {
  "name": { "first": "Midhun", "last": "Siby" },
  "roles": ["Developer", "Programmer", "Tech Enthusiast"],
  "description": "Passionate BCA student crafting digital experiences with code, exploring the boundaries of technology, physics, and beyond.",
  "stats": [
    { "num": "5+", "label": "Projects" },
    { "num": "6+", "label": "Languages" },
    { "num": "3+", "label": "Cloud Platforms" }
  ],
  "bio": [
    "I'm Midhun Siby — a passionate student, developer, and programmer who thrives on turning ideas into reality through code. Currently pursuing my Bachelor of Computer Applications (BCA) at BVM Holy Cross College, Cherpunkal, I bring a unique blend of software skills and hardware curiosity to everything I build.",
    "Known for my adaptive, minimal, and confident personality, I'm someone who embraces challenges, takes risks, and constantly pushes boundaries to achieve what seems impossible. My goal is not only to excel in the IT field but to continuously explore and master diverse domains of interest."
  ],
  "traits": ["Adaptive", "Minimal", "Confident", "Risk-taker", "Problem Solver"]
}

projects_data = [
  {
    "title": "College Canteen Food Ordering App",
    "subtitle": "Web Application",
    "description": "A fully functional food ordering web application for the college canteen with integrated payment system, Google authentication, order management, and real-time notifications.",
    "technologies": ["HTML", "CSS", "JavaScript", "Python Flask", "Google Auth", "Payment API"],
    "github": "https://github.com/midhunsiby7",
    "apk": "",
    "website": "",
    "image": "",
    "icon": "🍕",
    "featured": True,
    "year": "2024",
    "status": "Completed",
    "category": "Web",
    "type": "Application",
    "order": 1
  },
  {
    "title": "Arduino Automation Projects",
    "subtitle": "Hardware & IoT",
    "description": "Multiple automation projects built with Arduino Mega including sensor-based systems, motor control, and IoT-enabled devices combining software and hardware expertise.",
    "technologies": ["Arduino Mega", "C++", "Electronics", "IoT", "Sensors"],
    "github": "https://github.com/midhunsiby7",
    "apk": "",
    "website": "",
    "image": "",
    "icon": "🤖",
    "featured": True,
    "year": "2023",
    "status": "Completed",
    "category": "Hardware",
    "type": "IoT",
    "order": 2
  },
  {
    "title": "Electronics & Hardware Builds",
    "subtitle": "Custom Circuitry",
    "description": "Self-designed inverter circuits, walkman device restorations, and custom electronic assemblies demonstrating deep hardware and electronics knowledge.",
    "technologies": ["Circuit Design", "Soldering", "Power Electronics", "PCB"],
    "github": "",
    "apk": "",
    "website": "",
    "image": "",
    "icon": "⚡",
    "featured": True,
    "year": "2022",
    "status": "Completed",
    "category": "Electronics",
    "type": "Hardware",
    "order": 3
  }
]

skills_data = [
  { "title": "Languages", "icon": "{ }", "skills": ["Python", "Java", "C", "JavaScript", "HTML", "CSS"] },
  { "title": "Frameworks & Tech", "icon": "⚡", "skills": ["React", "Node.js", "Flask", "DBMS"] },
  { "title": "Tools & Platforms", "icon": "🛠", "skills": ["VS Code", "MySQL", "Firebase", "Git", "Arduino", "PyCharm", "VMware", "MySQL Workbench"] },
  { "title": "Cloud & DevOps", "icon": "☁", "skills": ["AWS", "Google Compute Engine", "Microsoft Azure", "Cloudflare", "VPS Hosting"] },
  { "title": "Operating Systems", "icon": "🖥", "skills": ["Kali Linux", "CentOS", "Ubuntu", "Windows"] },
  { "title": "AI & Problem Solving", "icon": "🧠", "skills": ["Claude", "ChatGPT", "Gemini", "Logical Reasoning", "Backend Development"] }
]

education_data = [
  {
    "year": "2023 — Present",
    "title": "Bachelor of Computer Applications",
    "institution": "BVM Holy Cross College, Cherpunkal",
    "link": "https://bvmcollege.com/",
    "logo": "/images/college-logo.png"
  },
  {
    "year": "Completed",
    "title": "Higher Secondary & Schooling",
    "institution": "St. Antony's Public School, Anakkal",
    "link": "https://www.saps.ac.in/",
    "logo": "/images/school-logo.png"
  }
]

interests_data = [
  { "title": "Astrophysics", "description": "Fascinated by the cosmos — black holes, quantum mechanics, and the mysteries of the universe.", "icon": "🔭" },
  { "title": "Electronics & Hardware", "description": "Building inverter circuits, restoring walkman devices, and experimenting with custom PCBs.", "icon": "🔌" },
  { "title": "Vehicle Mechanics", "description": "Understanding the engineering behind vehicles — engines, transmission systems, and mechanics.", "icon": "🏎" },
  { "title": "Physics & Science", "description": "Deep curiosity for the laws that govern our universe, from sub-atomic particles to cosmic scales.", "icon": "⚛" }
]

socials_data = {
  "github": "https://github.com/midhunsiby7",
  "linkedin": "https://www.linkedin.com/in/midhun-siby-bb6010377/",
  "instagram": "https://www.instagram.com/_.m_.i_.d._h._u._n.____s?igsh=MXY5NGs1ZTEzNXFiaw==",
  "email": "midhunsibi123@gmail.com",
  "linkedin_name": "Midhun Siby",
  "instagram_handle": "@_.m_.i_.d._h._u._n.____s",
  "github_username": "midhunsiby7"
}

certificates_data = []
achievements_data = []

files = {
  "profile.json": profile_data,
  "projects.json": projects_data,
  "skills.json": skills_data,
  "education.json": education_data,
  "interests.json": interests_data,
  "socials.json": socials_data,
  "certificates.json": certificates_data,
  "achievements.json": achievements_data
}

for filename, data in files.items():
  filepath = os.path.join(base_dir, filename)
  with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Created all JSON files successfully.")
