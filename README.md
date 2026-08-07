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
- `/demos/enterprise-workflow/` — Demo تفاعلي لدورة الموظف والمدير والموافقة.
- `/projects/coding-academy/` — صفحة أكاديمية البرمجة.
- `/demos/coding-academy/` — Demo تعليمي: درس Python → تمرين → تقدم.
- `/projects/mahsoob/` — صفحة محسوب.
- `/demos/mahsoob/` — Demo كاشير: منتج → سلة → دفع → إيصال.
- `/projects/masroofi/` — صفحة مصروفي.
- `/demos/masroofi/` — Demo مصاريف: إضافة → تحديث الرصيد → حذف.
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
بيانات الـInteractive Demos تكون معلّمة بوضوح على أنها بيانات تجريبية وليست بيانات حقيقية.

## Interactive Demos

الـDemos عبارة عن محاكاة صغيرة لأهم تدفق في كل مشروع وليست نسخاً كاملة من التطبيقات الأصلية.

- كل Demo يحافظ على الهوية البصرية الحقيقية للمشروع قدر الإمكان من مصدره الفعلي.
- الحالة داخل `sessionStorage` فقط.
- لا توجد حسابات حقيقية أو Backend حقيقي داخل الـDemo.
- Enterprise Workflow يبدّل الثيم حسب الدور: Employee فاتح/أبيض وManager داكن.
- جميع التدفقات الرئيسية مغطاة باختبارات Playwright حقيقية داخل Chromium.

## Browser QA

يشغل GitHub Actions فحص Playwright عند فتح Pull Request نحو `main`:

- Desktop + Mobile screenshots.
- فحص Console/Page errors.
- فحص العربية والإنكليزية.
- فحص روابط صفحات المشاريع والـDemos.
- E2E لكل Interactive Demo.

## اتجاه التصميم الحالي

القرارات الحالية المعتمدة لتطوير الصفحة الرئيسية، هوية المشاريع، قسم المهارات، الصورة الشخصية، والـInteractive Project Demos موثقة في:

- [`docs/CURRENT-DESIGN-DIRECTION.md`](./docs/CURRENT-DESIGN-DIRECTION.md) — المرجع الحالي المعتمد.
- [`docs/PORTFOLIO-REDESIGN-ROADMAP.md`](./docs/PORTFOLIO-REDESIGN-ROADMAP.md) — أفكار وخطة أقدم تبقى كمرجع تاريخي.

عند التعارض بين الملفين، يعتمد `CURRENT-DESIGN-DIRECTION.md`.

## النشر

الموقع مهيأ للنشر من جذر فرع `main` باستخدام GitHub Pages وملف `.nojekyll`.