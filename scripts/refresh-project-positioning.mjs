import fs from 'node:fs';

const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const writeJson = (path, value) => fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const project = (content, slug) => content.projects.find((item) => item.slug === slug);

const ar = readJson('content/portfolio.ar.json');
const en = readJson('content/portfolio.en.json');

ar.projectsSection.description = 'أربعة مشاريع ومنتجات عملية في سياقات مختلفة، من أنظمة الأعمال إلى التعليم والمال ونقاط البيع. شاهد فكرة كل مشروع، وجرّب المحاكاة المتاحة، أو افتح تفاصيله.';
en.projectsSection.description = 'Four projects and products across different contexts, from business systems to education, personal finance, and point of sale. Explore each idea, try the available simulation, or open its project page.';

Object.assign(project(ar, 'coding-academy'), {
  status: 'متاح',
  summary: 'منصة عربية لتعلّم البرمجة بالتطبيق. مسار Python متاح حالياً، مع C++ وC++ OOP كمسارات قادمة قريباً، ضمن تجربة تعليمية تتوسع تدريجياً.',
  facts: ['Python متاح حالياً', 'C++ قريباً', 'C++ OOP قريباً'],
  tech: ['HTML / CSS', 'JavaScript', 'Python', 'GitHub Pages'],
  previewImage: './assets/projects/coding-academy-current.svg',
  previewAlt: 'بطاقة تعريف حديثة لأكاديمية البرمجة تعرض Python كمسار متاح وC++ وC++ OOP كمسارات قادمة',
  resumeSummary: 'منصة عربية لتعلّم البرمجة تتوسع تدريجياً؛ Python متاح حالياً مع C++ وC++ OOP كمسارات قادمة.',
  metrics: [
    { value: 'Python', label: 'متاح حالياً' },
    { value: 'C++', label: 'قريباً' },
    { value: 'C++ OOP', label: 'قريباً' },
  ],
  media: [],
  caseStudy: [],
});

Object.assign(project(en, 'coding-academy'), {
  status: 'Live',
  summary: 'An Arabic programming learning platform that is expanding over time. Python is available now, with C++ and C++ OOP presented as upcoming learning paths.',
  facts: ['Python available now', 'C++ coming soon', 'C++ OOP coming soon'],
  tech: ['HTML', 'CSS', 'JavaScript', 'Python', 'GitHub Pages'],
  previewImage: './assets/projects/coding-academy-current.svg',
  previewAlt: 'Current Coding Academy overview showing Python as available and C++ and C++ OOP as upcoming paths',
  resumeSummary: 'An Arabic programming learning platform expanding over time, with Python available now and C++ and C++ OOP planned next.',
  metrics: [
    { value: 'Python', label: 'Available now' },
    { value: 'C++', label: 'Coming soon' },
    { value: 'C++ OOP', label: 'Coming soon' },
  ],
  media: [],
  caseStudy: [],
});

Object.assign(project(ar, 'mahsoob'), {
  status: 'قيد التطوير',
  summary: 'مشروع نظام نقاط بيع عربي قيد التطوير، موجّه للبقالات والميني ماركت والمتاجر الصغيرة في العراق، ويركز على تبسيط تجربة الكاشير وإدارة عملية البيع اليومية ضمن تطبيق Windows.',
  facts: ['قيد التطوير', 'موجّه للمتاجر الصغيرة في العراق', 'يركز على تجربة الكاشير ونقطة البيع'],
  resumeSummary: 'مشروع نظام نقاط بيع عربي قيد التطوير للمتاجر الصغيرة في العراق، يركز على تجربة كاشير واضحة وعملية.',
});
Object.assign(project(en, 'mahsoob'), {
  status: 'In Development',
  summary: 'An Arabic point-of-sale project currently in development for groceries, minimarkets, and small shops in Iraq, focused on a clear cashier experience and everyday sales workflow on Windows.',
  facts: ['In development', 'Designed for small Iraqi shops', 'Focused on cashier and point-of-sale workflow'],
  resumeSummary: 'An Arabic point-of-sale project in development for small Iraqi shops, focused on a clear and practical cashier workflow.',
});

ar.projectPage.demoExperiences.mahsoob.title = 'استكشف تصوراً لتدفق البيع';
ar.projectPage.demoExperiences.mahsoob.description = 'محاكاة مبسطة لفكرة تجربة الكاشير المستهدفة أثناء التطوير، وليست قائمة نهائية بميزات محسوب.';
en.projectPage.demoExperiences.mahsoob.title = 'Explore a target sales flow';
en.projectPage.demoExperiences.mahsoob.description = 'A simplified concept simulation of the cashier experience being developed, not a final feature list for Mahsoob.';

writeJson('content/portfolio.ar.json', ar);
writeJson('content/portfolio.en.json', en);

const academySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" role="img" aria-labelledby="title desc">
  <title id="title">X7do0 Academy</title><desc id="desc">Python is available. C++ and C++ OOP are coming soon.</desc>
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#10192b"/><stop offset="1" stop-color="#192740"/></linearGradient></defs>
  <rect width="1200" height="750" rx="36" fill="url(#bg)"/><circle cx="1010" cy="110" r="210" fill="#2457d6" opacity=".15"/>
  <text x="80" y="105" fill="#5b86f7" font-family="Arial,sans-serif" font-size="24" font-weight="700">X7DO0 ACADEMY</text>
  <text x="80" y="180" fill="#f2f6ff" font-family="Arial,sans-serif" font-size="54" font-weight="700">Programming learning paths</text>
  <text x="80" y="225" fill="#93a4bf" font-family="Arial,sans-serif" font-size="24">Arabic-first learning platform · growing course by course</text>
  <g font-family="Arial,sans-serif">
    <rect x="80" y="300" width="1040" height="100" rx="22" fill="#20314f" stroke="#536887"/><text x="120" y="360" fill="#f2f6ff" font-size="34" font-weight="700">Python</text><rect x="890" y="328" width="180" height="44" rx="22" fill="#203b72"/><text x="980" y="358" text-anchor="middle" fill="#8fb0ff" font-size="20" font-weight="700">AVAILABLE</text>
    <rect x="80" y="425" width="1040" height="100" rx="22" fill="#15223a" stroke="#3b4e6e"/><text x="120" y="485" fill="#f2f6ff" font-size="34" font-weight="700">C++</text><text x="1030" y="485" text-anchor="end" fill="#93a4bf" font-size="22" font-weight="700">COMING SOON</text>
    <rect x="80" y="550" width="1040" height="100" rx="22" fill="#15223a" stroke="#3b4e6e"/><text x="120" y="610" fill="#f2f6ff" font-size="34" font-weight="700">C++ OOP</text><text x="1030" y="610" text-anchor="end" fill="#93a4bf" font-size="22" font-weight="700">COMING SOON</text>
  </g>
</svg>\n`;
fs.writeFileSync('assets/projects/coding-academy-current.svg', academySvg);

for (const path of [
  'assets/projects/coding-academy.png',
  'assets/projects/coding-academy/01-learning-home.jpg',
  'assets/projects/coding-academy/02-python-topic-cards.jpg',
  'assets/projects/coding-academy/03-topic-code-preview.jpg',
  'assets/projects/coding-academy/04-lesson-and-source-files.jpg',
  'assets/projects/coding-academy/05-practice-library.jpg',
  'assets/projects/coding-academy/06-interactive-exercise.jpg',
  'assets/projects/coding-academy/07-mobile-topic-path.jpg',
]) fs.rmSync(path, { force: true });

const replace = (path, pairs) => {
  let text = fs.readFileSync(path, 'utf8');
  for (const [from, to] of pairs) {
    if (!text.includes(from)) throw new Error(`Expected text not found in ${path}: ${from}`);
    text = text.replace(from, to);
  }
  fs.writeFileSync(path, text);
};

replace('projects/coding-academy/index.html', [
  ['content="أكاديمية البرمجة — مشروع مختار ضمن بورتفوليو حيدره مهند."', 'content="أكاديمية البرمجة — منصة عربية متعددة المسارات، مع Python متاح ومسارات برمجية إضافية قادمة."'],
  ['content="منصة عربية تفاعلية لتعلم البرمجة بالتطبيق."', 'content="منصة عربية لتعلم البرمجة بالتطبيق؛ Python متاح حالياً، مع مسارات إضافية قادمة قريباً."'],
]);
replace('projects/mahsoob/index.html', [
  ['content="محسوب — مشروع نقاط بيع وإدارة متجر ضمن بورتفوليو حيدره مهند."', 'content="محسوب — مشروع نظام نقاط بيع عربي قيد التطوير للمتاجر الصغيرة في العراق."'],
  ['content="تطبيق نقاط بيع وإدارة متجر عربي يعمل دون اتصال بالإنترنت."', 'content="مشروع نقاط بيع عربي قيد التطوير يركز على تجربة الكاشير وتدفق البيع اليومي."'],
]);

replace('project.js', [[
  '    if (!project.caseStudy?.sections?.length || !project.media?.length) return;',
  '    if (!project.caseStudy?.sections?.length || !project.media?.length) { qs(".project-future")?.remove(); return; }',
]]);

console.log('Portfolio project positioning refreshed.');
