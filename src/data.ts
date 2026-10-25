// Node-based publishing checks also read this content; only Vite supplies env.
export const BASE = import.meta.env?.BASE_URL ?? "/";
export const img = (f: string) => `${BASE}images/${f}`;
export const RESUME = `${BASE}documents/je-kailash-resume.pdf`;

export const CONTACT = {
  email: "pulipati.kailash@gmail.com",
  linkedin: "https://www.linkedin.com/in/je-pulipati/",
  github: "https://github.com/pjsk02",
  scholar: "https://scholar.google.com/citations?user=BicdD1sAAAAJ&hl=en",
};

export type Thread = "AI systems" | "Data engineering" | "Analytics" | "Product";

export type Section = { h: string; p?: string[]; list?: string[] };

export type Project = {
  slug: string;
  title: string;
  short: string;
  line: string;
  threads: Thread[];
  context: string;
  cover: string;
  coverAlt: string;
  stack: string[];
  sections: Section[];
  gallery?: { src: string; caption: string }[];
  boundary?: string;
  links: { label: string; href: string }[];
  tier: "lead" | "feature" | "archive";
};

export const PROJECTS: Project[] = [
  {
    slug: "medfind",
    title: "MedFind",
    short: "Federated search for pediatric imaging, without centralizing a single record.",
    line: "Find where the data lives, ask permission at the source.",
    threads: ["AI systems", "Data engineering"],
    context: "The Open Accelerator Hackathon · Team winner",
    cover: "xiuWhxxcqu2iekfpMQyPLV8Cw-7ab020c1b1b4dcbf.jpeg",
    coverAlt: "The MedFind team holding prizes and a Certificate of Achievement at The Open Accelerator hackathon",
    stack: ["FastAPI", "Python", "Query expansion", "Distributed search", "Role-based access"],
    tier: "lead",
    sections: [
      { h: "The problem", p: [
        "A child treated for a brain tumor is scanned every few months. Models that help specialists measure change need examples from many children, scanners and hospitals, but pediatric brain tumors are rare, so no single hospital has enough cases.",
        "Researchers usually approach hospitals one at a time, spending months on contacts and approvals before learning whether suitable data even exists.",
      ] },
      { h: "What we built", p: [
        "A distributed search network. A central gateway takes a researcher's natural-language query, expands it into the clinical vocabulary each hospital uses in its reports, and fans it out to every hospital node in parallel.",
        "Each node runs its own database and evaluates the query, and separately any retrieval request, against its own local access policy. The gateway never stores patient data and never overrides a hospital's decision. It carries the researcher's identity token and aggregates what hospitals are willing to disclose.",
      ] },
      { h: "Key decision", list: [
        "Authorization lives at the hospital, not the gateway.",
        "Discovery (does data exist, how much) is separated from retrieval (may this role see a de-identified study).",
        "Every node is an independent FastAPI service, so the demo behaves like a network, not a monolith.",
      ] },
    ],
    boundary: "Hackathon prototype built by a team. Each hospital node holds a synthetic dataset in memory; it is not a deployed clinical platform.",
    links: [{ label: "Source on GitHub", href: "https://github.com/pjsk02/TOA-HealthHack-MedFind" }],
  },
  {
    slug: "tripsync-ai",
    title: "TripSync AI",
    short: "Group-trip planning where agents argue for each traveler and a mediator decides.",
    line: "Make disagreement a first-class input.",
    threads: ["AI systems", "Product"],
    context: "Multi-agent orchestration",
    cover: "yVU0FPlyVDfDOI6HX1qDJ6aDFQ-24e52203f3a46d49.png",
    coverAlt: "TripSync AI interface showing a negotiated Paris trip with per-traveler agent scores",
    stack: ["Sequential orchestration", "LLM agents", "Heuristic validators", "Consensus scoring"],
    tier: "lead",
    sections: [
      { h: "The problem", p: ["Group trips fail quietly: the loudest preferences win and someone pays for a plan they never wanted. TripSync treats each traveler's priorities as something to represent, not average away."] },
      { h: "The cast", list: [
        "Preference, activity, food, accommodation and transportation agents propose options.",
        "Budget and logistics agents are deterministic heuristic validators, not LLMs, so hard constraints stay hard.",
        "Traveler-advocate agents take a support, neutral or object stance with a utility score for their person.",
        "A consensus mediator accepts, revises or rejects each proposal; an orchestrator sequences the run.",
      ] },
      { h: "Key decision", p: ["Sequential rather than free-for-all orchestration: each stage reads a settled state, which makes the trace explainable. The product surfaces why an item was chosen, for example \"strongly satisfies Alex's top priority, neutral-positive for all\"."] },
    ],
    links: [{ label: "Source on GitHub", href: "https://github.com/pjsk02/TripSync-AI" }],
  },
  {
    slug: "endoseg",
    title: "EndoSeg",
    short: "Ovarian-lesion ultrasound segmentation trained in the cloud, inferred in the browser.",
    line: "Put the model where the scan already is.",
    threads: ["AI systems"],
    context: "Nebius Serverless AI Builders Challenge · Team project",
    cover: "WMF4am0ZB1u9Lh0Odwb0dUmjEM-9cbcdc74da03f30b.webp",
    coverAlt: "EndoSeg ultrasound segmentation interface",
    stack: ["2D U-Net", "MMOTU dataset", "Nebius Serverless Jobs", "ONNX Runtime Web", "WebGPU / WASM"],
    tier: "feature",
    sections: [
      { h: "The idea", p: ["Most medical-imaging demos ask you to upload a scan. EndoSeg inverts that: a compact model is fine-tuned in the cloud, then shipped inside a static page so default inference runs on the user's device."] },
      { h: "Pipeline", list: [
        "Three serverless jobs: preprocessing, GPU training, ONNX export.",
        "Compact 2D U-Net on MMOTU ovarian-tumor ultrasound, quantized to under 50 MB at 256x256.",
        "In-browser inference via ONNX Runtime Web with WebGPU and a WASM fallback; weights are fetched once and cached.",
        "An optional, clearly labelled \"compare to cloud\" path sends the image through a token-hiding proxy to a heavier UltraSam / MedSAM2 fine-tune on a Nebius endpoint.",
      ] },
      { h: "Key decision", p: ["A two-model split: privacy and zero wait by default, higher-capacity comparison only when the user opts in and knows where the data goes."] },
    ],
    boundary: "Experimental team project, not clinically validated. Local inference is the default; the opt-in cloud comparison does send the image off-device.",
    links: [],
  },
  {
    slug: "momcart",
    title: "MomCart",
    short: "A Telegram grocery bot built around how my mother already shops.",
    line: "Fit the workflow people already have.",
    threads: ["AI systems", "Product"],
    context: "Google Gemma challenge entry",
    cover: "OnaQm12gILMypvgAQ0wolxyx7jU-72dc1c73c71ad5f5.png",
    coverAlt: "MomCart Telegram grocery bot screens",
    stack: ["Telegram Bot API", "Voice, photo and text input", "Hinglish", "Persistent carts"],
    tier: "feature",
    sections: [
      { h: "The problem", p: ["My mother spends days hand-writing the monthly pantry list, photographs it, and sends it to the neighborhood shopkeeper on WhatsApp. Items get forgotten, corrections follow, and both sides lose time. The grocery apps ignore this workflow entirely."] },
      { h: "How it works", list: [
        "Speak a Hinglish voice note, \"do kilo aata, ek paav haldi\", send a photo, or type. Items land in a cart that persists across days.",
        "Edit in natural language: \"no, make it 3 kg potato\". Check anytime with /cart.",
        "Only \"bhej do\" ships the order, as a structured message with per-item status buttons for the shopkeeper.",
        "Out-of-stock items get same-category substitutes and are remembered in a wishlist for the next cycle.",
      ] },
    ],
    links: [],
  },
  {
    slug: "solarsketch",
    title: "SolarSketch",
    short: "Draw a roof with a stylus, get a panel layout and a rough capacity estimate.",
    line: "Geometry first, estimates second.",
    threads: ["Product"],
    context: "Rooftop solar feasibility MVP",
    cover: "ucLQZDraSrNWJ6KMJqvq8c3wOXs-6a9045ea5ff1ee97.png",
    coverAlt: "SolarSketch canvas with a roof polygon and generated panel grid",
    stack: ["SVG canvas", "Polygon geometry", "Browser-only"],
    tier: "feature",
    sections: [
      { h: "Flow", list: [
        "Upload an aerial or map screenshot and draw on it with mouse or stylus.",
        "Calibrate: draw a line over a known distance, enter its length, get pixels-per-foot.",
        "Sketch the installable roof polygon and any keep-outs for HVAC, paths and obstructions.",
        "Auto orientation aligns to the longest roof edge and picks the angle that maximizes panel count; manual takes a fixed angle.",
        "Results: roof and keep-out areas, panel count, kWdc, kWac from a DC/AC ratio, and indicative annual kWh from specific yield.",
      ] },
    ],
    boundary: "Indicative feasibility only; energy figures come from user-supplied assumptions.",
    links: [{ label: "Source on GitHub", href: "https://github.com/pjsk02/Solar-Sketch" }],
  },
  {
    slug: "langup",
    title: "LangUp",
    short: "Learn a language by code-switching it into the English you already read.",
    line: "Meet new words inside context you care about.",
    threads: ["AI systems", "Product"],
    context: "Language-learning product",
    cover: "rVpFgBbhXFW6p27onOG6kOxOwpg-c98451edf6deb010.png",
    coverAlt: "LangUp Input Studio for configuring target language and immersion level",
    stack: ["Supabase", "GPT-4o-mini", "Per-user language profiles"],
    tier: "feature",
    sections: [
      { h: "The idea", p: ["LangUp blends a target language into any English passage, the code-switching that linguists observe in bilingual environments, instead of drilling flashcards in isolation."] },
      { h: "The loop", list: [
        "Paste text in the Input Studio and choose language and immersion level.",
        "A live blend preview classifies and swaps eligible words before you read.",
        "In the Reader, click a blended word to reveal its translation and log a vocabulary hit.",
        "Insights and a vocabulary archive track session accuracy and mastery over time.",
      ] },
    ],
    gallery: [
      { src: "AmjHWjrUyC4LosDsHa92iDhhzLs-b15dead5aaf405d8.png", caption: "Authentication with per-user language profiles" },
      { src: "rVpFgBbhXFW6p27onOG6kOxOwpg-c98451edf6deb010.png", caption: "Input Studio" },
      { src: "lIfrUu6UcZbMjnhedX3XaW8WmA-9ba2423ade8b8420.png", caption: "Live blend preview" },
      { src: "cdRzCMAfZ8H4Gk8uakck4RCVEU-522223e00e1c2632.png", caption: "Immersive Reader" },
      { src: "QvgZPb7ZgfHiC9Ti8b4aC4JWbI-03aa9b40c5fc984c.png", caption: "Insights dashboard" },
      { src: "cQxGmEjUWTYc1jIxBqDc4xOrXA-9e092a15f8ab86af.png", caption: "Vocabulary archive" },
    ],
    links: [],
  },
  {
    slug: "energy-cto",
    title: "Energy CTO",
    short: "Grid signals in, ranked stress events out, explained in a streaming chat.",
    line: "Rank the problem before you talk about it.",
    threads: ["AI systems"],
    context: "Energy monitoring concept",
    cover: "UoVODr1K8sph0tTCUyCOe6TYsqQ-b84e418730656872.png",
    coverAlt: "Energy CTO advisor dashboard",
    stack: ["Stress-detection rules", "Event ranking", "Claude streaming chat"],
    tier: "archive",
    sections: [
      { h: "Overview", p: ["Designed to take SCADA, renewable generation, weather and demand signals, evaluate each against thresholds and pattern rules, persist and rank detected events, and surface them through a streaming chat interface powered by Claude."] },
    ],
    boundary: "Demo interface. At last check it showed sample brief content and could not reach monitoring systems; treat it as a concept demo, not live grid data.",
    links: [{ label: "Demo app", href: "https://energy-cto.lovable.app/" }],
  },
  {
    slug: "sec-pipeline",
    title: "Multistage SEC Data Platform",
    short: "SEC filings to Snowflake, three representations benchmarked, served by API and UI.",
    line: "Store the same data three ways and measure.",
    threads: ["Data engineering"],
    context: "End-to-end data engineering",
    cover: "GZDVDHuPPi5tf2eMMm6ZX9Cly10-97a4a55c0d9098ae.png",
    coverAlt: "Architecture diagram of the SEC data pipeline",
    stack: ["Airflow", "AWS S3", "Snowflake", "FastAPI", "Streamlit"],
    tier: "feature",
    sections: [
      { h: "Lifecycle", list: [
        "Programmatically pulls quarterly ZIP archives from SEC.gov.",
        "Transforms the same source three ways: raw TSV, JSON and denormalized fact tables, to compare storage and query tradeoffs.",
        "Stages every artifact in S3, then bulk-loads Snowflake with COPY INTO.",
        "FastAPI for programmatic access; Streamlit for interactive SQL and CSV export.",
      ] },
    ],
    links: [{ label: "Source on GitHub", href: "https://github.com/pjsk02/Automated-Multi-Stage-Data-Pipeline-Platform" }],
  },
  {
    slug: "food-inspections",
    title: "City Food Inspections",
    short: "Dallas and Chicago inspection records modelled into a medallion warehouse and Power BI.",
    line: "Two cities, one model.",
    threads: ["Analytics", "Data engineering"],
    context: "Analytics platform",
    cover: "zJkfuBBDI37gHQf9nTAILbfDmQ-bb7d0b28760add92.png",
    coverAlt: "Power BI dashboard of city food inspections",
    stack: ["ADF", "Databricks", "Snowflake", "Alteryx", "Power BI / DAX"],
    tier: "archive",
    sections: [{ h: "Overview", p: ["Bronze, silver and gold layers unify two cities' inspection schemas into fact and dimension tables, with KPIs and DAX measures for stakeholder dashboards."] }],
    links: [],
  },
  {
    slug: "imdb-bi",
    title: "IMDb Pipeline & BI",
    short: "Eight raw IMDb datasets modelled dimensionally and reported in Tableau.",
    line: "Model before you visualize.",
    threads: ["Analytics", "Data engineering"],
    context: "Warehouse and reporting",
    cover: "amqqNzREmZrQYKZQemSwdaAgA-eb486f28bd754094.png",
    coverAlt: "IMDb data model and Tableau report",
    stack: ["ADF", "Hadoop", "Alteryx", "Snowflake", "Tableau", "ER Studio"],
    tier: "archive",
    sections: [{ h: "Overview", p: ["ER and dimensional modelling over eight raw datasets, ETL pipelines into Snowflake, and KPI reporting in Tableau."] }],
    links: [],
  },
  {
    slug: "nypd-analysis",
    title: "NYPD Arrest Data Analysis",
    short: "Historical arrest records cleaned, checked for anomalies and mapped by precinct.",
    line: "Know what the data can and cannot say.",
    threads: ["Analytics"],
    context: "Public-data analysis",
    cover: "bdrre6QbmVmN35X1haIcqJYr0w-605a7a7c98707b35.png",
    coverAlt: "NYPD arrest data dashboard",
    stack: ["Airflow", "Azure", "Databricks", "Snowflake", "Power BI"],
    tier: "archive",
    sections: [{ h: "Overview", p: ["Large public arrest dataset processed with anomaly detection and precinct-level geographic dashboards."] }],
    boundary: "Analysis of historical arrest data, which reflects enforcement patterns; not a validated crime-prediction system and not operationally adopted.",
    links: [],
  },
  {
    slug: "airline-system",
    title: "Airline Management System",
    short: "An early relational backend for scheduling and bookings.",
    line: "Where the schemas started.",
    threads: ["Data engineering"],
    context: "Foundations",
    cover: "LKDZ7TFowHgdOBNyrSNkGE4AAZU-d5145d4851d17404.png",
    coverAlt: "Airline management system database project",
    stack: ["SQL", "Python", "Oracle JDBC", "BigQuery"],
    tier: "archive",
    sections: [{ h: "Overview", p: ["Relational design for flights, scheduling and bookings with automated search and booking through Python and Oracle JDBC."] }],
    links: [],
  },
];

export const EXPERIENCE = [
  { org: "Boviet Solar Technologies", role: "Data Engineer", when: "Jul 2025 – Jan 2026", points: [
    "ETL pipelines integrating SAP, Oracle and Microsoft Fabric into Power BI reporting used across departments.",
    "Python RPA (Playwright, PyAutoGUI) that automated recurring SAP data extraction.",
    "CDC replication with Debezium, Kafka and Docker from Oracle into PostgreSQL and Azure Data Lake.",
  ] },
  { org: "Align Associates", role: "Data Analyst", when: "Mar 2023 – Apr 2024", points: [
    "Delivery forecasting with clustering and regression.",
    "Data profiling and validation supporting QA operations.",
    "KPI definition and ETL/reporting work in Agile sprints.",
  ] },
  { org: "Multi-D Technologies", role: "Autonomous Systems Engineer Intern", when: "Jun – Aug 2023", points: [
    "Autonomous drone for gas-pipeline leak inspection with Python, QGroundControl, ArduPilot and Pixhawk.",
  ] },
  { org: "VIT Chennai", role: "Research Intern, Employee Attrition", when: "Jul – Sep 2023", points: [
    "Predictive models and hypothesis testing; R dashboards for HR stakeholders.",
  ] },
];

export const PAPERS = [
  { title: "Evaluating Employee Attrition and Its Factors Using Machine Learning Approaches", year: "2023", href: "https://ieeexplore.ieee.org/abstract/document/10276069" },
  { title: "Predicting and Evaluating Train Occupancy in Belgium Using Weather Data by Developing Ensemble Stacking Classifier", year: "2023", href: "https://ieeexplore.ieee.org/abstract/document/10480805" },
  { title: "Analysis of Online Fake News Using Machine Learning Techniques", year: "2024", href: "https://ieeexplore.ieee.org/abstract/document/10493794" },
  { title: "A Novel Meta-heuristic Hybrid Machine Learning Model for Disseminating the Factors Corresponding to Type II Diabetes with Devised Clinical Trials", year: "2024", href: "https://ieeexplore.ieee.org/abstract/document/10580444" },
];
