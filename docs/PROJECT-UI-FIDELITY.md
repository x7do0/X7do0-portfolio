# Project UI Fidelity Reference

> هذا الملف هو المرجع العملي لمحاكاة واجهات المشاريع داخل البورتفوليو. الهدف ليس نسخ التطبيقات Pixel-for-pixel، وإنما الحفاظ على شكل وهوية وبنية الواجهة الأصلية قدر الإمكان داخل Preview/Demo مصغر.

## قاعدة عامة

- الـPortfolio هو الإطار الخارجي فقط.
- كل Project Preview وInteractive Demo يستخدم هوية المشروع الأصلي، لا هوية البورتفوليو.
- لا نخترع ألوان أو مكونات إذا كان المستودع الحقيقي متوفرًا.
- عند التعارض بين Preview قديم وكود المشروع الحقيقي، **المشروع الحقيقي هو المصدر المعتمد**.
- الـDemos تبقى Product Showcases مصغرة، وليست نسخًا كاملة من التطبيقات.

## عرض هوية المشروع حول الـPreview

الـPreview وحده لا يكفي لفهم المشروع بسرعة. داخل الصفحة الرئيسية يجب أن تكون هوية المشروع النصية واضحة وقريبة منه:

- رقم المشروع عنصر ثانوي صغير، وليس العنصر البصري الأكبر.
- نوع المشروع يظهر كسطر صغير واضح فوق الاسم.
- **اسم المشروع هو أقوى عنصر نصي** قرب الـPreview، بحجم كبير ووزن واضح.
- الوصف مختصر بصريًا إلى سطرين تقريبًا؛ التفاصيل الأطول تبقى في صفحة المشروع.
- زر التفاصيل يبقى قريبًا من الاسم والوصف.
- الـLive Preview نفسه يحتوي CTA واضح للتجربة المباشرة.
- على Mobile يجب أن تأتي هوية المشروع النصية أولًا ثم الـPreview مباشرة، بدون فصل كبير بينهما.
- لا نكرر اسم المشروع كـOverlay ضخم داخل الواجهة المصغرة إذا كان ذلك يشتت عن UI الحقيقي.

## Demo Controls مقابل Product UI

أي Controls خاصة بمحاكاة البورتفوليو وليست جزءًا حقيقيًا من المنتج يجب فصلها بصريًا عن واجهة المشروع.

### Enterprise Role Switcher

- تبديل Employee / Manager هو **Demo control** وليس feature ظاهرة داخل واجهة Enterprise الأصلية.
- لذلك يكون Floating Dock مستقلًا عن الـapp shell والـsidebar.
- عنصر الـRole Switcher نفسه ينقل إلى مستوى `body` خارج DOM الخاص بواجهة التطبيق حتى لا يرث stacking/layout من المشروع.
- الـDock يحتفظ بمظهر Portfolio utility محايد، حتى عند تبدل Light/Dark داخل المشروع.
- Desktop: Floating compact dock قرب حافة الشاشة.
- Mobile: Floating segmented control بعرض آمن داخل الـviewport.
- يجب ألا يؤدي الفصل البصري إلى كسر الـRole state أو الـworkflow؛ التبديل يظل وظيفيًا بالكامل.

## الأرقام والتواريخ

قرار معتمد لكل المشاريع:

- النص يمكن أن يكون عربيًا RTL.
- **الأرقام تبقى Latin/English digits دائمًا:** `0 1 2 3 4 5 6 7 8 9`.
- يمنع عرض Arabic-Indic digits: `٠١٢٣٤٥٦٧٨٩` أو `۰۱۲۳۴۵۶۷۸۹`.
- المبالغ تستخدم grouping إنكليزي مثل `1,250` و`1,500,000`.
- التاريخ/الوقت يعرض بصيغة إنكليزية واضحة مثل `07 Aug 2026, 21:53` حتى داخل الواجهة العربية.
- التاريخ الإنجليزي داخل سطر RTL يجب أن يكون BiDi-isolated (`dir="ltr"` / `unicode-bidi: isolate`) حتى لا ينعكس ترتيبه بصريًا.

## Enterprise Workflow

**المصدر المعتمد:** `x7do0/EnterpriseWorkflow-archive`

لا تستخدم `x7do0/EnterpriseWorkflow` كمصدر إلا بطلب صريح.

مصادر الواجهة التي تمت مراجعتها:

- `src/Company.Workflow.Web/src/app/globals.css`
- `src/Company.Workflow.Web/src/app/(dashboard)/layout.tsx`
- `src/Company.Workflow.Web/src/components/layout/sidebar.tsx`

### واجهة Employee الأساسية

الواجهة الأصلية الافتراضية Light ومحايدة، لذلك هذا هو الشكل الأساسي في الـDemo والـPreview:

- background قريب من `#fafafa`
- cards بيضاء
- borders رمادية فاتحة قريبة من `#e5e7eb`
- primary neutral dark قريب من `#292e35`
- sidebar بعرض يقارب `256px` (`w-64`)
- header يقارب `56px` (`h-14`) في المشروع الحقيقي
- active navigation بخلفية هادئة مع **3px indicator** عند inline-start
- radius متوسط وقريب من shadcn-style surfaces

لا تجعل Employee أزرق بالكامل؛ الأزرق/الألوان تستخدم كـsemantic accents وليس كصبغة للواجهة كلها.

### Manager

داخل الـPortfolio Demo يبقى Manager بالنسخة الداكنة/Modern لتمييز تبديل الدور بصريًا، مع الحفاظ على نفس بنية النظام والـworkflow.

## Mahsoob POS

**المصدر:** `x7do0/MahsoobPOS`

مصادر تمت مراجعتها:

- `src/MahsoobPOS.UI/wwwroot/app.css`
- `src/MahsoobPOS.UI/Components/MainShell.razor`
- `src/MahsoobPOS.UI/Pages/CashierPage.razor`

### Tokens وبنية رئيسية

- brand: `#126b50`
- sidebar: `#10291f`
- sidebar active: `#1a4938`
- app background: `#f4f7f5`
- text: `#17221d`
- line: `#dbe5df`
- card line: `#e3ebe6`
- sidebar width: `235px`
- topbar: `70px`, white
- cards: `16px` radius
- primary buttons: تقريبًا `11px` radius
- cashier main grid: `1.6fr / .75fr`

الـCashier Preview/Demo يجب أن يقرأ مباشرة كـPOS: barcode/search + products/cart + total/payment، وليس Dashboard عام.

## Masroofi

**المصدر:** `x7do0/Masroofi`

مصادر تمت مراجعتها:

- `DESIGN.md`
- `src/pages/HomePage.tsx`
- `src/styles/global.css`

### Tokens

- background: `#f5f8f6`
- green 950: `#073d2c`
- green 900: `#07543b`
- green 700: `#0a7a50`
- green 500: `#18a36f`
- green 50: `#eefaf3`
- red 700: `#bd3e49`
- red 50: `#fff3f4`
- text: `#18231f`
- muted: `#74817c`
- border: `#e4ebe7`
- surface: white

### بنية Home

- balance card كبير، light-green gradient، `30px` radius، min-height يقارب `250px`
- income/expense summary cards قرابة `24px` radius
- recent transactions panel
- bottom navigation: الرئيسية / المصروفات / الدخل / السجل
- RTL Light

**Greeting الشخصي غير معتمد**؛ لا تضف Greeting للمحاكاة إلا إذا تغير قرار المنتج لاحقًا.

## X7do0 Coding Academy

**المصدر:** `x7do0/X7do0-Academy`

مصدر tokens تمت مراجعته:

- `assets/css/variables.css`

### Light semantic tokens

- surface: `#f2f5fa`
- surface soft: `#e8eef7`
- elevated: `#fbfcfe`
- interactive: `#e5ebf5`
- text: `#17213a`
- muted: `#64748b`
- border: `#b7c3d4` / `#cbd5e1`
- accent: `#2457d6`
- accent soft: `#e2ebff`
- code background: `#101d36`

### Dark semantic tokens

- surface: `#10192b`
- soft: `#15223a`
- elevated: `#192740`
- interactive: `#20314f`
- text: `#f2f6ff`
- muted: `#93a4bf`
- border: `#536887` / `#3b4e6e`
- accent: `#5b86f7`
- accent soft: `#203b72`
- code background: `#0b1426`

الـPreview/Demo يعرض بيئة تعلم حقيقية: lesson navigation + explanation + code/editor + progress، وليس card عامة باسم الأكاديمية.

## Portrait / Hero anchoring

الصورة الشفافة في الـHero يجب ألا تبدو معلقة أو مقصوصة في الهواء.

القاعدة الحالية:

- portrait يدخل بصريًا داخل Platform/Base واضح بأسفل الصورة.
- الـBase له top edge مضيء خفيف، سطح داكن، وshadow تحته.
- على الهاتف ينكمش ارتفاع الـvisual حتى لا يبقى dead blue zone كبير بين الصورة وقسم المشاريع.
- لا نرجع إلى baseline سمكه `1px` فقط.
- المرجع البصري الحاسم هو Screenshot فعلي من Playwright على Mobile، وليس CSS inspection فقط.

## QA المطلوب لأي تعديل لاحق

قبل دمج تغييرات project UI:

1. Playwright E2E لكل Demo يبقى Pass.
2. Desktop/Mobile screenshots تراجع بصريًا.
3. لا horizontal overflow.
4. لا Console/Page errors.
5. لا Arabic-Indic digits داخل project previews/demos.
6. English dates تبقى مرتبة بصريًا داخل RTL.
7. كل مشروع يبقى واضح الهوية بدون الحاجة إلى قراءة اسمه أولًا.
8. اسم المشروع ونوعه يبقيان واضحين قرب الـPreview في Desktop/Mobile.
9. Demo-only controls لا تبدو كأنها جزء أصلي من المنتج.
