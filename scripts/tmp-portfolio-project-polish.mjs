import fs from 'node:fs';
import path from 'node:path';

function normalizeTanween(text) {
  let next = text;
  let previous;
  const misplaced = /([\u0621-\u064A]+)([\u064B-\u064D])([\u0621-\u064A]+)(?=[^\u0621-\u064A]|$)/gu;
  do {
    previous = next;
    next = next.replace(misplaced, '$1$3$2');
  } while (next !== previous);
  return next;
}

function project(content, slug) {
  const item = content.projects.find((entry) => entry.slug === slug);
  if (!item) throw new Error(`Missing project ${slug}`);
  return item;
}

const arPath = 'content/portfolio.ar.json';
const enPath = 'content/portfolio.en.json';
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

project(ar, 'enterprise-workflow').demo = { path: 'enterprise-workflow' };
project(en, 'enterprise-workflow').demo = { path: 'enterprise-workflow' };
project(ar, 'mahsoob').demo = { path: 'mahsoob' };
project(en, 'mahsoob').demo = { path: 'mahsoob' };
delete project(ar, 'coding-academy').demo;
delete project(en, 'coding-academy').demo;
delete project(ar, 'masroofi').demo;
delete project(en, 'masroofi').demo;

const academyAr = project(ar, 'coding-academy');
Object.assign(academyAr, {
  status: 'مستمر',
  summary: 'منصة عربية لتعلّم البرمجة بأسلوب عملي ومنظم. مسار Python متاح حاليا بالدروس والتمارين، بينما C++ وC++ OOP ضمن المسارات القادمة قريبا.',
  facts: ['Python متاح حاليا', 'دروس وتمارين عملية بالعربية', 'C++ وC++ OOP قريبا'],
  previewImage: './assets/projects/coding-academy/01-home-current.png',
  previewAlt: 'الصفحة الرئيسية الحالية لأكاديمية X7do0',
  resumeSummary: 'منصة عربية لتعلّم البرمجة بأسلوب عملي، مع Python متاح حاليا ومسارات C++ قادمة.',
  metrics: [
    { value: 'Python', label: 'المسار المتاح حاليا' },
    { value: '2', label: 'مساران قادمان: C++ وC++ OOP' },
    { value: 'RTL', label: 'تجربة عربية مصممة من البداية' }
  ],
  media: [
    { src: './assets/projects/coding-academy/01-home-current.png', featured: true, alt: 'الصفحة الرئيسية الحالية لأكاديمية X7do0', caption: 'الواجهة الرئيسية تجمع الوصول إلى مسارات التعلّم والتقدم الشخصي ضمن تجربة عربية واضحة.' },
    { src: './assets/projects/coding-academy/02-courses-current.png', alt: 'صفحة الدورات الحالية في أكاديمية X7do0', caption: 'صفحة الدورات تميّز بوضوح بين Python المتاح والمسارات القادمة C++ وC++ OOP.' },
    { src: './assets/projects/coding-academy/03-python-overview-current.png', alt: 'نظرة عامة على مسار Python في أكاديمية X7do0', caption: 'نظرة المسار تربط الدروس والتمارين والتقدم في مكان واحد.' },
    { src: './assets/projects/coding-academy/04-python-lessons-current.png', alt: 'صفحة دروس Python في أكاديمية X7do0', caption: 'الدروس منظمة لتسهيل الانتقال من المفهوم إلى المثال والتطبيق.' },
    { src: './assets/projects/coding-academy/05-python-practice-current.png', alt: 'صفحة تمارين Python في أكاديمية X7do0', caption: 'مساحة التمارين تدعم التدريب العملي والبحث والتصفية ومتابعة الإنجاز.' },
    { src: './assets/projects/coding-academy/06-home-mobile-current.png', device: 'phone', alt: 'أكاديمية X7do0 على الهاتف', caption: 'النسخة المتجاوبة تحافظ على التصفح ومسار التعلم بصورة مريحة على الهاتف.' }
  ],
  caseStudy: {
    title: 'من محتوى Python إلى أكاديمية برمجة قابلة للتوسع',
    intro: 'بدأت الأكاديمية كمساحة عربية عملية لتعلّم Python، ثم تطورت بنيتها لتصبح منصة متعددة المسارات. الهدف هو الحفاظ على تجربة تعلم واضحة اليوم، مع إمكانية إضافة دورات جديدة بدون خلط بنية كل دورة أو إعادة بناء الموقع من الصفر.',
    sections: [
      { title: 'الفكرة', body: 'تقديم محتوى برمجي عربي لا يكتفي بالنص النظري، بل يربط الدرس بالأمثلة والتمارين ومتابعة التقدم.', items: ['واجهة عربية RTL', 'تنقل واضح بين الدروس والتمارين', 'تجربة مناسبة لسطح المكتب والهاتف'] },
      { title: 'المحتوى الحالي', body: 'Python هو المسار المتاح حاليا، ويضم الدروس والتمارين العملية. C++ وC++ OOP ظاهران كمسارات قادمة من دون الادعاء بأن محتواهما مكتمل.', items: ['Python متاح', 'C++ قريبا', 'C++ OOP قريبا'] },
      { title: 'بنية التوسع', body: 'أعيد تنظيم صفحات الدورات والقوالب المشتركة حتى تكون إضافة مسار جديد امتدادا طبيعيا للمنصة، لا نسخة منفصلة من الموقع.', items: ['صفحة دورات مركزية', 'قوالب مشتركة للمسارات', 'فصل واضح بين محتوى كل دورة'] },
      { title: 'التجربة', body: 'التركيز الأساسي هو جعل المتعلم يعرف أين هو، ماذا أنجز، وما الخطوة التالية، مع إبقاء المحتوى والتمارين هما العنصر الأهم.', items: ['حالة تقدم واضحة', 'بحث وتصفية في التمارين', 'تصميم متجاوب'] }
    ]
  }
});

const academyEn = project(en, 'coding-academy');
Object.assign(academyEn, {
  status: 'Active',
  summary: 'An Arabic programming-learning platform built around practical, structured learning. Python is currently available with lessons and exercises, while C++ and C++ OOP are the next planned tracks.',
  facts: ['Python available now', 'Practical Arabic lessons and exercises', 'C++ and C++ OOP coming next'],
  previewImage: './assets/projects/coding-academy/01-home-current.png',
  previewAlt: 'Current X7do0 Academy home page',
  resumeSummary: 'An Arabic programming-learning platform with Python available now and C++ tracks planned next.',
  metrics: [
    { value: 'Python', label: 'Current available track' },
    { value: '2', label: 'Upcoming tracks: C++ and C++ OOP' },
    { value: 'RTL', label: 'Arabic-first learning experience' }
  ],
  media: [
    { src: './assets/projects/coding-academy/01-home-current.png', featured: true, alt: 'Current X7do0 Academy home page', caption: 'The home experience brings learning paths and personal progress into one clear Arabic-first interface.' },
    { src: './assets/projects/coding-academy/02-courses-current.png', alt: 'Current X7do0 Academy courses page', caption: 'The courses page clearly separates the available Python track from upcoming C++ and C++ OOP tracks.' },
    { src: './assets/projects/coding-academy/03-python-overview-current.png', alt: 'Current Python track overview in X7do0 Academy', caption: 'The track overview connects lessons, exercises, and progress in one place.' },
    { src: './assets/projects/coding-academy/04-python-lessons-current.png', alt: 'Current Python lessons page in X7do0 Academy', caption: 'Lessons are organized to move from concepts into examples and practical application.' },
    { src: './assets/projects/coding-academy/05-python-practice-current.png', alt: 'Current Python practice page in X7do0 Academy', caption: 'The practice area supports hands-on work, search, filtering, and progress tracking.' },
    { src: './assets/projects/coding-academy/06-home-mobile-current.png', device: 'phone', alt: 'X7do0 Academy on mobile', caption: 'The responsive experience keeps navigation and the learning path comfortable on a phone.' }
  ],
  caseStudy: {
    title: 'From Python content to an extensible programming academy',
    intro: 'The Academy started as a practical Arabic space for learning Python, then evolved into a multi-track learning platform. The goal is to keep today’s learning experience clear while allowing new courses to be added without rebuilding the site around each one.',
    sections: [
      { title: 'The idea', body: 'Deliver Arabic programming content that connects explanations with examples, exercises, and visible learning progress.', items: ['Arabic-first RTL interface', 'Clear lesson and exercise navigation', 'Desktop and mobile support'] },
      { title: 'Current content', body: 'Python is the active track with lessons and practical exercises. C++ and C++ OOP are presented as upcoming tracks without claiming unfinished content is already available.', items: ['Python available', 'C++ coming soon', 'C++ OOP coming soon'] },
      { title: 'Extensible structure', body: 'The course page and shared templates were reorganized so a new track can extend the Academy rather than become a separate copy of the site.', items: ['Central course directory', 'Shared course templates', 'Clear course-content boundaries'] },
      { title: 'Learning experience', body: 'The interface focuses on helping the learner understand where they are, what they completed, and what comes next while keeping lessons and practice central.', items: ['Visible progress state', 'Practice search and filtering', 'Responsive design'] }
    ]
  }
});

const mahsoobAr = project(ar, 'mahsoob');
mahsoobAr.developmentNotice = {
  title: 'قيد التطوير',
  body: 'محسوب ما يزال قيد التطوير. المعروض هنا يوضح فكرة المنتج واتجاه تجربة نقاط البيع الحالية، بينما التفاصيل والخصائص النهائية ستتحدد مع استمرار بناء المشروع.'
};
const mahsoobEn = project(en, 'mahsoob');
mahsoobEn.developmentNotice = {
  title: 'In Development',
  body: 'Mahsoob is still in development. This page presents the product idea and current point-of-sale direction; final capabilities will be defined as the project continues to evolve.'
};

for (const content of [ar, en]) {
  if (content.projectPage?.demoExperiences) {
    delete content.projectPage.demoExperiences['coding-academy'];
    delete content.projectPage.demoExperiences.masroofi;
  }
}

ar.skillsSection.items = ar.skillsSection.items.filter((item) => !item.title.includes('الذكاء الاصطناعي'));
en.skillsSection.items = en.skillsSection.items.filter((item) => !/AI-assisted/i.test(item.title));

fs.writeFileSync(arPath, normalizeTanween(JSON.stringify(ar, null, 2) + '\n'));
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n');

const appPath = 'app.js';
let app = fs.readFileSync(appPath, 'utf8');
app = app.replace(
  '      article.dataset.project = project.slug;\n      article.innerHTML = `',
  '      article.dataset.project = project.slug;\n      const liveLink = (project.links || []).find((item) => item.kind === "live");\n      const primaryHref = project.demo ? localizedUrl(`./projects/${project.slug}/?demo=1#demo`) : liveLink?.url || localizedUrl(`./projects/${project.slug}/`);\n      const primaryLabel = project.demo ? content.home.tryDemo : liveLink?.label || content.home.fullDetails;\n      const primaryAttrs = !project.demo && liveLink ? ` target="_blank" rel="noopener noreferrer"` : "";\n      const primaryClass = `button button--primary${project.demo ? " demo-trigger" : ""}`;\n      article.innerHTML = `'
);
app = app.replace(
  '          <a class="button button--primary demo-trigger" href="${localizedUrl(`./projects/${project.slug}/?demo=1#demo`)}">${content.home.tryDemo}<span aria-hidden="true">${state.language === "ar" ? "←" : "→"}</span></a>',
  '          <a class="${primaryClass}" href="${primaryHref}"${primaryAttrs}>${primaryLabel}<span aria-hidden="true">${state.language === "ar" ? "←" : "→"}</span></a>'
);
app = app.replace('    const iconNames = ["backend", "database", "quality", "git", "projects", "ai"];', '    const iconNames = ["backend", "database", "quality", "git", "projects"];');
fs.writeFileSync(appPath, app);

const projectPath = 'project.js';
let projectJs = fs.readFileSync(projectPath, 'utf8');
projectJs = projectJs.replace(
  '    if (demoLink) demoLink.classList.toggle("project-demo-cta--secondary", externalLinks.some((item) => item.kind === "live"));\n    if (hint) hint.textContent = content.projectPage.demoHint;',
  '    const hasDemo = Boolean(project.demo?.path);\n    actions.classList.toggle("project-demo-actions--external-only", !hasDemo);\n    if (demoLink) {\n      if (hasDemo) demoLink.classList.toggle("project-demo-cta--secondary", externalLinks.some((item) => item.kind === "live"));\n      else demoLink.remove();\n    }\n    if (hint) {\n      if (hasDemo) hint.textContent = content.projectPage.demoHint;\n      else hint.remove();\n    }'
);
projectJs = projectJs.replace(
  '  function renderCaseStudy(project, content) {',
  '  function renderDevelopmentNotice(project) {\n    qs(".project-development-notice")?.remove();\n    if (!project.developmentNotice) return;\n    const notice = document.createElement("aside");\n    notice.className = "project-development-notice shell reveal";\n    notice.setAttribute("role", "status");\n    notice.innerHTML = `<span class="project-development-notice__icon" aria-hidden="true">◆</span><div><strong>${project.developmentNotice.title}</strong><p>${project.developmentNotice.body}</p></div>`;\n    qs(".project-hero").after(notice);\n  }\n\n  function renderCaseStudy(project, content) {'
);
projectJs = projectJs.replace('    renderProjectLinks(project, content);\n    renderCaseStudy(project, content);', '    renderProjectLinks(project, content);\n    renderDevelopmentNotice(project);\n    renderCaseStudy(project, content);');
projectJs = projectJs.replace('    if (demoLink) {\n      demoLink.href = language === "en"\n        ? `${root}demos/${slug}/?lang=en`\n        : `${root}demos/${slug}/`;', '    if (demoLink && project.demo?.path) {\n      demoLink.href = language === "en"\n        ? `${root}demos/${project.demo.path}/?lang=en`\n        : `${root}demos/${project.demo.path}/`;');
projectJs = projectJs.replace('              const canUseCompactDesktop = innerHeight <= 760 && ["coding-academy", "masroofi"].includes(slug);', '              const canUseCompactDesktop = false;');
fs.writeFileSync(projectPath, projectJs);

const cssPath = 'project-details.css';
let css = fs.readFileSync(cssPath, 'utf8');
css += `\n\n/* Development-state notice */\n.project-development-notice {\n  margin: 1.25rem auto 0;\n  display: grid;\n  grid-template-columns: auto 1fr;\n  gap: 1rem;\n  align-items: start;\n  padding: 1.15rem 1.25rem;\n  border: 1px solid rgba(245, 158, 11, .4);\n  border-radius: 18px;\n  background: linear-gradient(135deg, rgba(245, 158, 11, .14), rgba(251, 191, 36, .05));\n  box-shadow: 0 18px 50px rgba(0, 0, 0, .16);\n}\n.project-development-notice__icon { color: #f59e0b; font-size: 1.05rem; line-height: 1.5; }\n.project-development-notice strong { display: block; color: #fbbf24; font-size: .78rem; letter-spacing: .12em; text-transform: uppercase; margin-bottom: .35rem; }\n.project-development-notice p { margin: 0; color: var(--text-secondary, #b9c3d0); line-height: 1.8; max-width: 76ch; }\n.project-demo-actions--external-only { align-items: flex-start; }\n@media (max-width: 640px) { .project-development-notice { grid-template-columns: 1fr; gap: .55rem; padding: 1rem; } }\n`;
fs.writeFileSync(cssPath, css);

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (['.html', '.json', '.md', '.js'].includes(path.extname(entry.name))) {
      const original = fs.readFileSync(full, 'utf8');
      const updated = normalizeTanween(original);
      if (updated !== original) fs.writeFileSync(full, updated);
    }
  }
}
walk(process.cwd());

console.log('Portfolio project positioning, demo routing, development notice, and Arabic text style updated.');
