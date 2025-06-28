export const gmeniJobResponseExample = `json
{

  "required_match_score": 7.8,
  "category": "Talent",
  "feedback": "Thank you for providing your profile information. We are updating your job profile.",
  "done": true,
  "updates": [
  {
    "field": "trust_score",
    "values": [
        "8.5"
    ]
},
  {
    "field": "trust_note",
    "values": [
        "The post seams to be well trusted it is fine"
    ]
},
  {
    "field": "emails",
    "values": [
        "example@gmail.com",
        "example2@gmail.com"
    ]
},
    {
      "field": "description",
      "values": [
        "Self-taught full-stack developer with a background in physics and deep expertise in blockchain engineering. Proven track record leading Web3 product architecture with real-world success, obtained a $35K DFINITY grant. Skilled in Rust, Python, and decentralized systems, with strong principles in test-driven development (TDD). Passionate about designing systems with scientific rigor and building dev tools that scale."
      ]
    },
    {
      "field": "job_titles",
      "values": [
        "Full stack developer",
        "Senior Blockchain developer",
        "ICP specialist",
        "Web3 Architect",
        "TDD specialist",
        "Lead Backend Architect",
        "Blockchain Engineer",
        "Backend Lead"
      ]
    },
    {
      "field": "proficiency_level",
      "values": [
        "Senior"
      ]
    },
    {
      "field": "skills",
      "values": [
        "Rust",
        "ICP Canisters",
        "Solidity",
        "Ethereum",
        "ckUSDC Integration",
        "IC Stable Structures",
        "OpenZeppelin",
        "Python",
        "FastAPI",
        "Django REST",
        "GraphQL",
        "Node.js",
        "Web3.js",
        "Ethers.js",
        "OAuth2",
        "JWT",
        "React",
        "Angular",
        "Vue",
        "HTML5/CSS3",
        "AWS",
        "Docker",
        "PostgreSQL",
        "MongoDB",
        "Hardhat",
        "Git",
        "Monorepo Architecture",
        "Test-Driven Development (TDD)",
        "Vitest",
        "Pytest",
        "Chai",
        "Mocha",
        "Smart Contract Auditing",
        "Agile Development",
        "Remote Team Leadership",
        "Proposal Writing",
        "Asana",
        "GitHub"
      ]
    },
    {
      "field": "education",
      "values": [
        "B.Sc. in General Physics"
      ]
    },
    {
      "field": "certifications",
      "values": [
        "Polkadot Blockchain Academy"
      ]
    },
    {
      "field": "links",
      "values": [
        "https://odoc.app",
        "https://github.com/aliscie",
        "https://www.linkedin.com/in/alisci",
        "https://x.com/alihushamsci",
        "https://youtube.com/@odocic",
        "https://app.kajabi.com/certificates/9b82fde3"
      ]
    },
    {
      "field": "contacts",
      "values": [
          "http://x.com/username",
          "https://t.me/OdocBot"
      ]
  }
  ]
}
`;

export const parsedRespnoseExample = [
  {
    field: "trust_score",
    values: ["8.5"],
  },
  {
    field: "trust_note",
    values: ["The post seams to be well trusted it is fine"],
  },
  {
    field: "emails",
    values: ["example@gmail.com", "example2@gmail.com"],
  },
  {
    field: "job_titles",
    values: [
      "Full stack developer",
      "Senior Blockchain developer",
      "Layer 1 developer",
      "Layer 2 developer",
      "ICP specialist",
      "Web3 Architect",
      "Rust specialist",
      "TDD specialist",
      "Lead Backend Architect",
      "Blockchain Engineer",
      "Backend Lead",
    ],
  },
  {
    field: "description",
    values: [
      "Self-taught full-stack developer with a background in physics and deep expertise in blockchain engineering. Proven track record leading Web3 product architecture with real-world success, obtained a $35K DFINITY grant. Skilled in Rust, Python, and decentralized systems, with strong principles in test-driven development (TDD). Passionate about designing systems with scientific rigor and building dev tools that scale.",
    ],
  },
  {
    field: "skills",
    values: [
      "Rust",
      "ICP Canisters",
      "Solidity",
      "Ethereum",
      "ckUSDC Integration",
      "IC Stable Structures",
      "OpenZeppelin",
      "Python",
      "FastAPI",
      "Django REST",
      "GraphQL",
      "Node.js",
      "Web3.js",
      "Ethers.js",
      "OAuth2",
      "JWT",
      "React",
      "Angular",
      "Vue",
      "HTML5/CSS3",
      "AWS",
      "Docker",
      "PostgreSQL",
      "MongoDB",
      "Hardhat",
      "Git",
      "Monorepo Architecture",
      "Test-Driven Development (TDD)",
      "Vitest",
      "Pytest",
      "Chai",
      "Mocha",
      "Smart Contract Auditing",
      "Agile Development",
      "Remote Team Leadership",
      "Proposal Writing",
      "Asana",
      "GitHub",
    ],
  },
  {
    field: "education",
    values: [
      "B.Sc. in General Physics, University of Baghdad, Iraq (2017-2020)",
    ],
  },
  {
    field: "certifications",
    values: ["Polkadot Blockchain Academy"],
  },
  {
    field: "experience",
    values: [
      "Lead Backend Architect at Odoc.app (2022–2023)",
      "Blockchain Engineer at Blockczech.io (2021–2022)",
      "Backend Lead at Crowdbotics via Upwork (2018–2021)",
    ],
  },
  {
    field: "links",
    values: [
      "https://odoc.app",
      "https://github.com/aliscie",
      "https://www.linkedin.com/in/alisci",
      "https://x.com/alihushamsci",
      "https://youtube.com/@odocic",
    ],
  },
  {
    field: "contacts",
    values: ["http://x.com/username", "https://t.me/OdocBot"],
  },
];
