/* js/data.js — Single source of truth for all portfolio content.
   Edit THIS file to update your portfolio. No HTML changes needed. */

const PORTFOLIO = {

    // ─── Personal Info & Header ───
    personal: {
        name: "Aishwarya Kendle",
        location: "Pune, IN",
        email: "aishkendle6999@gmail.com",
        pageTitle: "Aishwarya | Engineering & Security",
        resumeUrl: ""
    },

    social: {
        linkedin: "https://linkedin.com/in/aishwarya-kendle",
        twitter: "https://x.com/aish_kendle",
        github: "https://github.com/SocioDroid"
    },

    tabs: ["engineering", "exploits", "renders"],

    // ─── Engineering Tab ───
    engineering: {

        techStack: {
            languages: [
                { icon: "fab fa-cuttlefish", title: "C#" },
                { icon: "fab fa-python", title: "Python" },
                { icon: "fab fa-js", title: "JavaScript" },
                { icon: "fas fa-database", title: "SQL / NoSQL" }
            ],
            frameworks: [
                { icon: "fab fa-microsoft", title: ".NET Core" },
                { icon: "fab fa-angular", title: "Angular" },
                { icon: "fab fa-react", title: "React" },
                { icon: "fab fa-node", title: "Node.js" }
            ],
            tools: [
                { icon: "fab fa-docker", title: "Docker" },
                { icon: "fab fa-git-alt", title: "Git" },
                { icon: "fas fa-cloud", title: "Azure" }
            ]
        },

        experience: [
            {
                company: "Arctera (Veritas)",
                period: "Nov 2024 - Present",
                highlights: [
                    'Optimized real-time analytics dashboards, boosting system monitoring efficiency by 35%.',
                    'Boosted server performance by 30% via dynamic context updates.',
                    'Optimized retrieval from <strong>11 data centers</strong> by 40%.',
                    '🏆 Winner: Innovate 2025 Hackathon.'
                ]
            },
            {
                company: "Veritas Technologies",
                period: "Apr 2023 - Nov 2024",
                highlights: [
                    'Engineered .NET backend for billing & provisioning.',
                    'Hardened service security; patched critical API vulnerabilities.',
                    'Built Angular dashboards for usage insights.'
                ]
            },
            {
                company: "Veritas Technologies (Assoc)",
                period: "Jul 2021 - Apr 2023",
                highlights: [
                    'Fixed critical <strong>P1 IDOR</strong> vulnerability impacting client data.',
                    'Automated 100+ workflows.'
                ]
            }
        ],

        projects: [
            { name: "TnPVision (Django/React)", url: "https://github.com/SocioDroid/TnPVision" },
            { name: "leetcode-py-cli (Python)", url: "https://github.com/SocioDroid/leetcode-py-cli" },
            { name: "Hackstagram (Rails)", url: "https://github.com/SocioDroid/Hackstagram" }
        ],

        talks: [
            {
                title: "AI Power Playbook",
                venue: "IIDL Mumbai",
                date: "Jan 2026",
                url: "https://www.linkedin.com/posts/aishwarya-kendle_ai-politics-softwareengineer-activity-7419056922269691905-KL9_?utm_source=share&utm_medium=member_desktop&rcm=ACoAACp7R60ByQfMdkt8nKttza4OEjZ4VwBk1oE"
            },
            {
                title: "Charting Your Course",
                venue: "Laxmanrao Apte",
                date: "Aug 2024",
                url: "https://www.linkedin.com/posts/aishwarya-kendle_inculcated-the-newly-joined-students-of-class-activity-7229328323863052288-JGwb?utm_source=share&utm_medium=member_desktop&rcm=ACoAACp7R60ByQfMdkt8nKttza4OEjZ4VwBk1oE"
            }
        ]
    },

    // ─── Exploits Tab ───
    exploits: {

        profiles: [
            { name: "HackerOne", url: "https://hackerone.com/aishkendle" },
            { name: "Bugcrowd", url: "https://bugcrowd.com/AishKendle" },
            { name: "Synack", url: "https://acropolis.synack.com/inductees/aish", icon: "fas fa-shield-alt" }
        ],

        hallOfFame: [
            { name: "CERT-EU", url: "https://cert.europa.eu/hall-of-fame#:~:text=Aishwarya%20Kendle" },
            { name: "Bosch PSIRT", url: "https://psirt.bosch.com/hall-of-fame/websites-hall-of-fame.html" },
            { name: "REA Group", url: "https://www.rea-group.com/about-us/news-and-insights/blog/responsible-vulnerability-disclosure-program-hall-of-fame/#:~:text=2020-,Aishwarya%20Kendle,-Prateek%20Thakare" },
            { name: "Aliter", url: "https://www.aliter.com/en/hall-of-fame-of-security-vulnerability-whistleblowers#:~:text=the%20WordPress%20system-,Aishwarya%20Kendle,-reported%20the%20existence" },
            { name: "Charanga", url: "https://charanga.com/hall_of_fame" },
            { name: "Utrecht Uni", url: "https://www.uu.nl/en/organisation/information-and-technology-services-its/hall-of-fame-responsible-disclosure#:~:text=Prateek%20Thakare%20/-,Aishwarya%20Kendle,-1" },
            { name: "NRK", url: "https://info.nrk.no/responsible-disclosure-policy/?/lxdampihdgn#:~:text=%40sumgr0)-,Aishwarya%20Kendle,-(Linkedin)" },
            { name: "Pepperfry", url: "https://www.pepperfry.com/tnc/whitehat.html?srsltid=AfmBOoqSt3HQxPZV3st23OzRMXYpw0pda7VyhjTsOMGUeckJACBi_TlG#:~:text=2020-,Aishwarya%20Kendle,-Vaibhav%20Joshi" },
            { name: "MYOB", url: "https://www.myob.com/au/legal/report-security-vulnerability?srsltid=AfmBOoo46HxvfU6V-NMHaxBONvwNer77SLJhn1-ce8mOkTb57Vwf21Tn#:~:text=Asaf%20Aprozper%20(Reposify)-,Aishwarya%20Kendle,-Badal%20Sardhara" },
            { name: "Accenture", url: "https://accenture.responsibledisclosure.com/hc/en-us/articles/360040573233-Acknowledgments#:~:text=in/prateek%2Dthakare-,Aishwarya%20Kendle,-linkedin.com/in" },
            { name: "Erasmus Uni", url: "https://www.eur.nl/en/campus/locations/campus-woudestein/security-safety/information-security/hall-fame#:~:text=Opens%20external-,Aishwarya%20Kendle,-%2C%20LinkedIn" },
            { name: "U-Blox", url: "https://www.u-blox.com/en/report-security-issues#:~:text=Ronak%20Nahar-,Aishwarya%20Kendle,-Ali%20Razzaq" },
            { name: "Sony", url: "" },
            { name: "Dutch Govt", url: "" }
        ],

        writeups: [
            { platform: "fas fa-file-invoice", title: "Lark Technologies: Improper Access Control", url: "https://hackerone.com/reports/1470076" },
            { platform: "fas fa-file-invoice", title: "Stripo: Password token leak via Host header", url: "https://hackerone.com/reports/737042" },
            { platform: "fas fa-file-invoice", title: "Stripo: OLD SESSION DOES NOT EXPIRE AFTER PASSWORD CHANGE", url: "https://hackerone.com/reports/737039" },
            { platform: "fas fa-file-invoice", title: "Stripo: Bypass email verification and create email template with the editor", url: "https://hackerone.com/reports/737169" },
            { platform: "fab fa-medium", title: "How we Hijacked 26+ Subdomains", url: "https://medium.com/@aishwaryakendle/how-we-hijacked-26-subdomains-9c05c94c7049" }
        ],

        talks: [
            {
                title: "How we Hijacked 26+ Subdomains",
                venue: "OWASP Banglore",
                youtubeUrl: "https://www.youtube.com/watch?v=xCunHBH8ZQ4"
            }
        ],

        highlights: {
            handle: "@aish_kendle",
            quote: "Just hit P1 Warrior Level 1 on Bugcrowd! Huge thanks to the community.",
            profileUrl: "https://x.com/aish_kendle"
        }
    },

    // ─── Renders Tab ───
    renders: {

        header: {
            title: "Visual Computing",
            subtitle: "Graphics Programming & HPC"
        },

        projects: [
            { title: "The Child's Play", youtubeUrl: "https://www.youtube.com/watch?v=uY4C57MjGRI", tags: ["OpenGL", "C++"] },
            { title: "Kashmakash", youtubeUrl: "https://www.youtube.com/watch?v=eA5rpQYYEks", tags: ["WebGL"] },
            { title: "उद्भव", youtubeUrl: "https://www.youtube.com/watch?v=7FFgWpg8gIM", tags: ["OpenGL", "CUDA"] },
            { title: "Fluid Simulator", youtubeUrl: "https://www.youtube.com/watch?v=_suU6vHqEkY", tags: ["OpenGL", "Multi-Texturing"] },
            { title: "Water Rendering", youtubeUrl: "https://www.youtube.com/watch?v=23d-7b3-FM4", tags: ["CUDA", "OpenGL"] },
            { title: "विजयोत्सव", youtubeUrl: "https://www.youtube.com/watch?v=7lvOipkrSE0", tags: ["OpenGL FFP", "C++"] },
            { title: "Pandora", youtubeUrl: "https://www.youtube.com/watch?v=D9cCJg2vMwA", tags: ["OpenGL", "C++"] },
            { title: "मोगरा फुलला", youtubeUrl: "https://www.youtube.com/watch?v=gleYAecmiXU", tags: ["OpenGL FFP", "Win32 SDK"] },
            { title: "3D Holograph", youtubeUrl: "https://www.youtube.com/watch?v=MQ6WWSP_2PI", tags: ["OpenGL ES 3.2", "Android"] },
            { title: "OpenAL 3D Audio", youtubeUrl: "https://www.youtube.com/watch?v=L9VeSRkPwHU", tags: ["OpenAL", "OpenGL"] }
        ],

        talks: [
            {
                title: "Next Gen Computer Graphics with WebGL",
                venue: "MIT Alandi",
                date: "Jan 2026",
                url: "https://www.linkedin.com/posts/aishwarya-kendle_webgl-techeducation-futuredevelopers-activity-7382509245788762112-BjxZ?utm_source=share&utm_medium=member_desktop&rcm=ACoAACp7R60ByQfMdkt8nKttza4OEjZ4VwBk1oE"
            },
            {
                title: "Wonders of Computer Graphics",
                venue: "D.Y. Patil",
                date: "Sept 2024",
                url: "https://www.linkedin.com/posts/aishwarya-kendle_computergaphics-opengl-directx-activity-7240430754512416768-mNkw?utm_source=share&utm_medium=member_desktop&rcm=ACoAACp7R60ByQfMdkt8nKttza4OEjZ4VwBk1oE"
            }
        ]
    }
};
