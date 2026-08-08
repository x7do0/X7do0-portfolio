# Hero & Scroll Atmosphere — Current Direction

> هذا الملف هو المرجع الأحدث للـHero والصورة الشخصية وخلفية الصفحة المتحركة. عند التعارض مع أي ملاحظة أقدم تخص هذه الأجزاء في `CURRENT-DESIGN-DIRECTION.md` أو `PORTFOLIO-REDESIGN-ROADMAP.md`، يعتمد هذا الملف.

## 1. Editorial Anchored Portrait

الاختيار المعتمد للصورة الشخصية هو **Editorial Anchored Portrait**.

### قواعد غير قابلة للرجوع

- الصورة ليست CSS background ولا pseudo-element.
- الصورة عنصر HTML حقيقي داخل `<picture>/<img>`.
- الأصل المعروض: `assets/profile/profile-cutout.png`.
- تحميل الصورة يبدأ بأولوية عالية من أول الصفحة:
  - preload في `<head>`.
  - `loading="eager"`.
  - `fetchpriority="high"`.
  - أبعاد معلنة لتجنب Layout Shift.
- لا Fade ولا entrance animation ولا IntersectionObserver gate للصورة.
- Hero copy نفسه لا ينتظر reveal animation؛ العنوان والصورة يظهران في أول Paint.
- الصورة تنتهي داخل Composition لها قاعدة حقيقية، وليس بخط رفيع يحاول إخفاء قص الصورة.
- `X7DO0` والـgrid/orbit عناصر خلفية Editorial هادئة، وليست واجهة تطبيق وهمية.
- الـSystem Window القديم لم يعد جزءًا من Hero الحالي.

### Above-the-fold requirement

على Desktop وMobile يجب أن يكون العنوان ظاهرًا في أول Viewport، ويجب أن يظهر جزء واضح من الصورة الشخصية في أول Viewport أيضًا.

Playwright يختبر هذا صراحة حتى لا تعود مشكلة الشاشة الفارغة أو تأخر ظهور الصورة.

### الملفات الحالية

- `index.html` — markup + preload + `<picture>/<img>`.
- `editorial-hero-v2.css` — تركيب الصورة والقاعدة والـresponsive.

## 2. Scroll-reactive Background Atmosphere

الخلفية ليست صورة ثابتة أثناء النزول والصعود.

### السلوك المعتمد

- توجد طبقات خلفية ثابتة بالنسبة للviewport لكن **محتواها يتحرك مع scroll progress**.
- النزول يحرك Grid / Orbs / Lines باتجاه محسوب.
- الصعود يعكس الحركة تلقائيًا.
- سرعة الحركة أخف من المحتوى حتى تعطي Depth/Parallax بدون إحساس Game UI.
- يتغير الجو اللوني تدريجيًا حسب القسم الحالي:
  - Home
  - Projects
  - Skills / Capabilities
  - Education
  - Knowledge
  - Contact
- الحركة تستخدم `requestAnimationFrame` بدل تنفيذ ثقيل لكل scroll event.
- يتم احترام `prefers-reduced-motion` وإيقاف التحولات الحركية عند طلب المستخدم ذلك.
- لا يسمح لأي background utility أن يدخل document flow أو يدفع المحتوى؛ خصوصًا `pointer-glow` يبقى fixed.

### الملفات الحالية

- `scroll-atmosphere.css` — الطبقات، الألوان، transitions والـresponsive.
- `scroll-atmosphere.js` — scroll direction، active section وCSS variables.

## 3. Quality Gates

الـBrowser QA يجب أن يتحقق من:

- الصورة محملة فعليًا وليست CSS background.
- الصورة eager/high-priority ولا تمتلك fade animation.
- عدم وجود `.system-window` في Hero.
- العنوان داخل أول Viewport.
- جزء معتبر من الصورة داخل أول Viewport على Mobile.
- الخلفية تغير موضعها عند النزول.
- `data-scroll-direction` يتحول بين `down` و`up`.
- الرجوع للأعلى يعكس حركة الخلفية.
- لا Horizontal Overflow.
- Desktop وMobile screenshots لأول Viewport.
- Screenshots عند Projects / Capabilities / Contact لمراجعة تغير الجو البصري.

## 4. Current visual principle

الـHero يجب أن يقرأ بهذا الترتيب من أول ثانية:

**الشخص → التخصص → ما الذي يبنيه → المشاريع.**

والخلفية تخدم الإحساس بالعمق والحركة فقط، ولا تنافس النص أو الصورة أو المشاريع.
