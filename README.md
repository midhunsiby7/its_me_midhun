# 🌌 Midhun Siby | Interactive Space-Themed Portfolio

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.3.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-Vanilla-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

An immersive, responsive, and visually stunning developer portfolio website themed around the cosmos and interstellar exploration. Built using React and Vite, it showcases personal projects, skills, education, and interests, wrapped in a premium dark glassmorphism interface.

🔗 **Live Link:** [https://midhunsiby7.github.io/its_me_midhun/](https://midhunsiby7.github.io/its_me_midhun/)

---

## 📸 Preview

![Portfolio Home](a.png)
*(Screenshot of the Interactive Space-Themed Interface)*

---

## ✨ Key Features

*   **🚀 Endurance Spacecraft Cursor:** A realistic custom SVG cursor styled after the *Endurance* spacecraft from Interstellar. It features slow-spring physics, lag trails, and dynamic engine particle sparks that respond directly to velocity.
*   **🌌 Dynamic Starfield Background:** A high-performance canvas-based starfield simulator that makes the workspace feel alive and expansive.
*   **🔮 Dark Glassmorphism Design:** Curated dark-themed color palettes with vibrant accent gradients, glowing neon hubs, and premium frosted-glass cards (`glass-card`).
*   **📱 Responsive & Fluid Layout:** Optimized for all desktop viewports, tablets, and mobile screens with adaptive layouts.
*   **✨ Scroll & Transition Animations:** Custom page transition animations and reveal-on-scroll elements.

---

## 🗺️ Portfolio Sections

1.  **🛰️ Home (Hero):** Welcome dashboard featuring a greeting, animated roles (Developer • Programmer • Tech Enthusiast), key stats, social links, and links to explore projects.
2.  **📝 About Me:** Personal profile highlighting core educational milestones (BVM Holy Cross College & St. Antony's Public School) along with core characteristics like *Adaptive*, *Minimal*, *Confident*, *Risk-taker*, and *Problem Solver*.
3.  **⚡ Skills:** Categorized layout of software languages, web frameworks, DevOps/Cloud systems (AWS, Azure, Google Compute Engine), Operating Systems (Kali Linux, CentOS, Ubuntu), and hardware tooling.
4.  **🎨 Featured Projects:** Showcase of software and hardware accomplishments:
    *   *College Canteen Food Ordering App* (Flask, Google Auth, Payment API)
    *   *Arduino Automation Projects* (C++, IoT, Sensors)
    *   *Electronics & Hardware Builds* (Inverter circuit design, walkman restoration, PCB)
5.  **🔭 Beyond Code:** Personal interests that inspire Midhun, including Astrophysics, Electronics & Hardware, Vehicle Mechanics, and Physics.
6.  **✉️ Connect:** Interactive layout for direct communication through Email, GitHub, LinkedIn, or Instagram.

---

## 🛠️ Tech Stack & Libraries

*   **Framework:** [React 19](https://react.dev/) (Functional components, Hooks: `useState`, `useEffect`, `useRef`, `useCallback`)
*   **Bundler & Dev Server:** [Vite 7](https://vite.dev/)
*   **Styling:** Custom Vanilla CSS (Modern CSS variables, Flexbox, Grid, custom scrollbars, keyframe animations)
*   **Interactions:** HTML5 Canvas API (rendered via React component lifecycles)
*   **Linting:** [ESLint 9](https://eslint.org/)

---

## 📂 Project Structure

```text
its_me_midhun/
├── public/                 # Static assets (favicons, manifest, public files)
├── src/
│   ├── assets/             # Profile pictures, logos, and local image assets
│   ├── components/         # Reusable presentation and layout components
│   │   ├── About.css / .jsx      # Education timeline and traits
│   │   ├── Contact.css / .jsx    # Social link directory and email connect
│   │   ├── Footer.css / .jsx     # Clean copyright footer
│   │   ├── Hero.css / .jsx       # Intro text, stats, and primary actions
│   │   ├── Interests.css / .jsx  # Hobbies grid (Astrophysics, Physics, etc.)
│   │   ├── Navbar.css / .jsx     # Fluid floating navigation
│   │   ├── Projects.css / .jsx   # Work items & Github repository integrations
│   │   ├── Skills.css / .jsx     # Technology grid with categorized skill chips
│   │   └── Starfield.css / .jsx  # HTML5 Starfield canvas generator
│   ├── App.css             # Main styling, page wrappers, spacecraft cursor
│   ├── App.jsx             # Spacecraft cursor engine, scroll reveals, routing
│   └── main.jsx            # React root entry point
├── eslint.config.js        # Linting rules
├── index.html              # Core template with SEO meta tags
├── package.json            # Scripts & dependency definitions
└── vite.config.js          # Vite configurations (GH Pages root configuration)
```

---

## 🚀 Getting Started

To run this project locally on your machine, follow these steps:

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/midhunsiby7/its_me_midhun.git
    cd its_me_midhun
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    This starts the local web server. Open `http://localhost:5173` in your browser to view it.

4.  **Build for Production:**
    ```bash
    npm run build
    ```
    The output files will be built into the `dist/` folder, ready for hosting.

5.  **Preview Production Build locally:**
    ```bash
    npm run preview
    ```

---

## 📧 Contact & Socials

Feel free to connect with Midhun:

*   **Email:** [midhunsibi123@gmail.com](mailto:midhunsibi123@gmail.com)
*   **LinkedIn:** [Midhun Siby](https://www.linkedin.com/in/midhun-siby-bb6010377/)
*   **GitHub:** [@midhunsiby7](https://github.com/midhunsiby7)
*   **Instagram:** [@\_.m\_.i\_.d\_.h\_.u\_.n.\_\_\_\_s](https://www.instagram.com/_.m_.i_.d._h._u._n.____s?igsh=MXY5NGs1ZTEzNXFiaw==)

---

Developed with ❤️ by [Midhun Siby](https://github.com/midhunsiby7).
