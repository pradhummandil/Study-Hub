<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0B2A4A,50:1B4B7A,100:6D3FA0&height=280&section=header&text=Study%20Hub&fontSize=80&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Where%20dreams%20rise%20through%20the%20silence.&descAlignY=58&descSize=22" width="100%"/>

<a href="https://study-hub-app.vercel.app">
  <img src="https://img.shields.io/badge/🌐_Live_Site-Visit_Now-6D3FA0?style=for-the-badge&labelColor=0B2A4A" />
</a>
<a href="#-features">
  <img src="https://img.shields.io/badge/✨_Features-Explore-1B4B7A?style=for-the-badge&labelColor=0B2A4A" />
</a>
<a href="#-getting-started">
  <img src="https://img.shields.io/badge/🚀_Quick_Start-Deploy-D97706?style=for-the-badge&labelColor=0B2A4A" />
</a>

<br/><br/>

<img src="https://readme-typing-svg.demolab.com?font=Instrument+Serif&size=28&duration=3500&pause=800&color=D0A9F5&center=true&vCenter=true&width=650&lines=A+quiet+space+for+focused+study.;One+mentor%2C+real+conversations.;Roadmaps%2C+resources%2C+and+a+free+call+away." alt="Typing SVG" />

<br/>

![Repo size](https://img.shields.io/github/repo-size/pradhummandil/Study-Hub?style=flat-square&color=6D3FA0&labelColor=0B2A4A)
![Last commit](https://img.shields.io/github/last-commit/pradhummandil/Study-Hub?style=flat-square&color=D97706&labelColor=0B2A4A)
![Issues](https://img.shields.io/github/issues/pradhummandil/Study-Hub?style=flat-square&color=1B4B7A&labelColor=0B2A4A)
![Stars](https://img.shields.io/github/stars/pradhummandil/Study-Hub?style=flat-square&color=D0A9F5&labelColor=0B2A4A)
![License](https://img.shields.io/badge/license-MIT-1B4B7A?style=flat-square&labelColor=0B2A4A)

</div>

<br/>

## 🎬 See it in motion

<div align="center">

<!-- Replace this with a real screen recording. GitHub supports .mp4 / .mov / .webm
     uploaded via drag-and-drop directly into an Issue/PR/README edit box — it will
     generate a real githubusercontent.com URL you can drop below. -->

**[⬇ Drop your own demo GIF/video URL here — GitHub auto-hosts anything you drag into the README editor]**

<img src="https://your-demo-clip-url-goes-here.gif" width="85%" alt="Study Hub walkthrough" />

<sub>Hero video · Auth flow · Focus Room timer · Dashboard roadmap · Resource library</sub>

</div>

<br/>

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 🎥 Cinematic Landing
Full-bleed looping video hero, liquid-glass navigation, Instrument Serif typography, and a starfield-to-study-desk visual arc that sets the tone before a word is read.

### 🔐 Real Auth
Email + Google OAuth via Supabase. Instant sign-up, no dead-end verification emails, personalized nav with live avatar.

### 📅 Live Booking
Inline Cal.com embed for free 1-on-1 guidance calls — book, reschedule, and manage entirely inside the site.

</td>
<td width="50%" valign="top">

### 📚 Resource Library
Searchable, filterable archive of GATE, JEE Advanced, and more — official papers and answer keys, bookmarkable per-user.

### ⏱️ Focus Room
A circular-progress study timer with streaks, session history, and encouragement that adapts to your momentum.

### 🗺️ Personal Dashboard
Supabase-backed roadmap tracker and saved resources — your prep plan, tied to your account, everywhere you log in.

</td>
</tr>
</table>

<br/>

## 🏗️ Architecture

```mermaid
flowchart TD
    A["🎨 React + Vite + TypeScript<br/>Tailwind CSS · shadcn/ui"] --> B["🔐 Supabase Auth<br/>Email + Google OAuth"]
    A --> C["🗄️ Supabase Postgres<br/>Roadmap · Saved Resources · Newsletter"]
    A --> D["📦 Supabase Storage<br/>Resource PDFs · Thumbnails"]
    A --> E["📅 Cal.com Embed<br/>Live guidance booking"]
    A --> F["🌐 Vercel<br/>Deployment"]

    style A fill:#1B4B7A,stroke:#D0A9F5,color:#fff
    style B fill:#0B2A4A,stroke:#D0A9F5,color:#fff
    style C fill:#0B2A4A,stroke:#D0A9F5,color:#fff
    style D fill:#0B2A4A,stroke:#D0A9F5,color:#fff
    style E fill:#0B2A4A,stroke:#D0A9F5,color:#fff
    style F fill:#6D3FA0,stroke:#D0A9F5,color:#fff
```

<br/>

## 🧰 Tech Stack

<div align="center">

<img src="https://skillicons.dev/icons?i=react,vite,ts,tailwind,supabase,vercel,nodejs,figma&theme=dark" />

</div>

<br/>

<table align="center">
<tr>
<th>Layer</th><th>Technology</th>
</tr>
<tr><td>Frontend</td><td>React · Vite · TypeScript · Tailwind CSS · shadcn/ui</td></tr>
<tr><td>Auth</td><td>Supabase Auth (Email + Google OAuth)</td></tr>
<tr><td>Database</td><td>Supabase Postgres with Row Level Security</td></tr>
<tr><td>Storage</td><td>Supabase Storage (public resource buckets)</td></tr>
<tr><td>Booking</td><td>Cal.com embed (@calcom/embed-react)</td></tr>
<tr><td>Icons</td><td>lucide-react</td></tr>
<tr><td>Deployment</td><td>Vercel</td></tr>
</table>

<br/>

## 📊 Repo Stats

<div align="center">
<img src="https://github-readme-stats.vercel.app/api?username=pradhummandil&repo=Study-Hub&show_icons=true&theme=radical&hide_border=true&bg_color=0B2A4A&title_color=D0A9F5&icon_color=D97706&text_color=ffffff" width="48%"/>
<img src="https://github-readme-stats.vercel.app/api/top-langs/?username=pradhummandil&repo=Study-Hub&layout=compact&theme=radical&hide_border=true&bg_color=0B2A4A&title_color=D0A9F5&text_color=ffffff" width="38%"/>
</div>

<br/>

## 🚀 Getting Started

```bash
# Clone
git clone https://github.com/pradhummandil/Study-Hub.git
cd Study-Hub

# Install
npm install

# Environment
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Run
npm run dev
```

<details>
<summary><b>📦 Environment variables needed</b></summary>

<br/>

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side only, for bulk resource uploads — never exposed client-side |

</details>

<br/>

## 🗺️ Roadmap

```mermaid
timeline
    title Study Hub — Build Timeline
    Hero & Landing : Cinematic video hero : Liquid-glass nav : Fade animations
    Booking : Cal.com integration : Live guidance calls
    Auth : Supabase email + Google OAuth : Personalized nav
    Growth : Resource library : Focus Room streaks : Dashboard roadmap
    Next : Community hub : Referral system : Multi-year archives
```

<br/>

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

```bash
git checkout -b feature/your-feature
git commit -m "Add: your feature"
git push origin feature/your-feature
```

<br/>

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

<br/>

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6D3FA0,50:1B4B7A,100:0B2A4A&height=150&section=footer" width="100%"/>

**Built by [Pradhum Mandil](https://github.com/pradhummandil)**
<br/>
<sub>Full-stack developer · GATE 2027 aspirant · Quiet-grind believer</sub>

</div>
