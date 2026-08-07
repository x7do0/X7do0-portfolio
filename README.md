# x7do0 Portfolio

البورتفوليو الرسمي لـ **حيدره مهند** والهوية الرقمية **x7do0**.

## التقنية

الموقع Static بالكامل ومصمم للنشر المباشر على GitHub Pages:

- Semantic HTML
- Modern CSS
- Vanilla JavaScript
- محتوى عربي وإنكليزي منفصل داخل JSON
- لا توجد تبعيات Production أو Build step

## التشغيل محلياً

يجب تشغيل خادم Static حتى تُحمّل ملفات JSON:

```powershell
python -m http.server 8080
```

ثم افتح:

```text
http://localhost:8080/
```

## الصفحات

- `/` — الصفحة الرئيسية.
- `/?lang=en` — النسخة الإنكليزية.
- `/projects/enterprise-workflow/` — صفحة Enterprise Workflow.
- `/projects/coding-academy/` — صفحة أكاديمية البرمجة.
- `/resume/` — السيرة الذاتية داخل الموقع.
- `/404.html` — صفحة غير موجودة ثنائية اللغة.

## إدارة المحتوى

المحتوى المعتمد موجود في:

- `content/portfolio.ar.json`
- `content/portfolio.en.json`

يجب تحديث الملفين معاً والحفاظ على نفس `slug` وترتيب المشاريع والروابط بين اللغتين.

المحتوى المؤجل يبقى فارغاً:

- روابط البريد وLinkedIn وYouTube وInstagram.
- دراسات الحالة.
- صور وفيديوهات المشاريع.
- فيديوهات مشاركة المعرفة ورابط القناة.
- ملفات السيرة PDF.

لا تُستخدم بيانات أو روابط أو وسائط وهمية بدل المحتوى الحقيقي.

## اتجاه التصميم الحالي

القرارات الحالية المعتمدة لتطوير الصفحة الرئيسية، هوية المشاريع، قسم المهارات، الصورة الشخصية، والـInteractive Project Demos موثقة في:

- [`docs/CURRENT-DESIGN-DIRECTION.md`](./docs/CURRENT-DESIGN-DIRECTION.md) — المرجع الحالي المعتمد.
- [`docs/PORTFOLIO-REDESIGN-ROADMAP.md`](./docs/PORTFOLIO-REDESIGN-ROADMAP.md) — أفكار وخطة أقدم تبقى كمرجع تاريخي.

عند التعارض بين الملفين، يعتمد `CURRENT-DESIGN-DIRECTION.md`.

## النشر

الموقع مهيأ للنشر من جذر فرع `main` باستخدام GitHub Pages وملف `.nojekyll`.