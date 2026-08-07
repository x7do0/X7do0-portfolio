(() => {
  'use strict';

  const STORAGE_KEY = 'x7do0-academy-demo-v1';
  const LANGUAGE_KEY = 'x7do0-language';
  const THEME_KEY = 'x7do0-academy-demo-theme';

  const i18n = {
    ar: {
      portfolio:'البورتفوليو',demoLabel:'تجربة تعليمية مصغرة',sample:'بيانات تجريبية فقط',reset:'إعادة',python:'أساسيات بايثون',courseHint:'مسار تجريبي مصغر',progress:'التقدم',lesson:'الدرس',practice:'التمرين',result:'التقدم',goal:'هدف التجربة',goalCopy:'راجع المثال، حل تمرينًا بسيطًا، ثم شاهد تقدمك يتحدث محليًا.',lessonTitle:'المتغيرات والطباعة',lessonCopy:'المتغير يحفظ قيمة يمكن استخدامها لاحقًا. نطبع القيمة باستخدام print.',fundamentals:'الأساسيات',idea:'الفكرة',ideaCopy:'أنشئ متغيرًا باسم name، خزّن بداخله نصًا، ثم اطبع المتغير.',point1:'اسم المتغير واضح ومباشر.',point2:'النص يوضع بين علامتي اقتباس.',point3:'print تعرض القيمة في المخرجات.',tryIt:'جرّب بنفسك',output:'المخرجات',practiceTitle:'طبّق الفكرة',practiceCopy:'اكتب متغيرًا باسم name ثم اطبعه. يقبل الـDemo أكثر من قيمة نصية.',task:'المطلوب',taskCopy:'عرّف المتغير name بقيمة نصية، ثم استخدم print(name).',hint:'تلميح',example:'مثال',clear:'مسح',check:'تحقق من الحل',resultTitle:'تقدمك في هذا الـDemo',courseProgress:'تقدم المسار المصغر',reviewLesson:'مراجعة الدرس',solvePractice:'حل التمرين',saveProgress:'حفظ التقدم',reviewAgain:'راجع الدرس مرة أخرى',success:'ممتاز! الحل يعرّف name ثم يطبعه بشكل صحيح.',error:'جرّب مرة ثانية: نحتاج تعريف name بقيمة نصية ثم print(name).',resultBefore:'راجع الدرس ثم أكمل التمرين حتى يرتفع التقدم.',resultAfter:'أكملت الدرس والتمرين بنجاح. هذا التقدم محفوظ داخل جلسة الـDemo فقط.',toastSuccess:'تم التحقق من الحل وتحديث التقدم.'
    },
    en: {
      portfolio:'Portfolio',demoLabel:'Interactive learning mini demo',sample:'Sample data only',reset:'Reset',python:'Python Fundamentals',courseHint:'Compact demo path',progress:'Progress',lesson:'Lesson',practice:'Practice',result:'Progress',goal:'Demo goal',goalCopy:'Review the example, solve a small exercise, then watch local progress update.',lessonTitle:'Variables and printing',lessonCopy:'A variable stores a value for later use. We display that value with print.',fundamentals:'Fundamentals',idea:'The idea',ideaCopy:'Create a variable named name, store text in it, then print the variable.',point1:'Use a clear variable name.',point2:'Text values go inside quotes.',point3:'print displays the value in output.',tryIt:'Try it yourself',output:'Output',practiceTitle:'Apply the idea',practiceCopy:'Create a variable named name and print it. The demo accepts different text values.',task:'Task',taskCopy:'Assign a text value to name, then use print(name).',hint:'Hint',example:'Example',clear:'Clear',check:'Check solution',resultTitle:'Your progress in this demo',courseProgress:'Mini path progress',reviewLesson:'Review lesson',solvePractice:'Solve practice',saveProgress:'Save progress',reviewAgain:'Review lesson again',success:'Great! Your solution defines name and prints it correctly.',error:'Try again: define name with a text value, then call print(name).',resultBefore:'Review the lesson and complete the practice to increase progress.',resultAfter:'You completed the lesson and practice. This progress is stored only in the demo session.',toastSuccess:'Solution verified and progress updated.'
    }
  };

  const qs=(s,p=document)=>p.querySelector(s);
  const qsa=(s,p=document)=>[...p.querySelectorAll(s)];
  let language=new URLSearchParams(location.search).get('lang')==='en'||localStorage.getItem(LANGUAGE_KEY)==='en'?'en':'ar';
  let theme=localStorage.getItem(THEME_KEY)==='dark'?'dark':'light';
  let toastTimer;

  function defaultState(){return{view:'lesson',lessonReviewed:true,practiceSolved:false};}
  function load(){try{return{...defaultState(),...JSON.parse(sessionStorage.getItem(STORAGE_KEY)||'{}')}}catch{return defaultState()}}
  let state=load();
  function save(){sessionStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
  function t(k){return i18n[language][k]||k}
  function percent(){return state.practiceSolved?100:state.lessonReviewed?50:0}

  function showToast(text){const el=qs('[data-toast]');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),1800)}

  function applyLanguage(){
    document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';localStorage.setItem(LANGUAGE_KEY,language);
    qsa('[data-i18n]').forEach(el=>{const v=i18n[language][el.dataset.i18n];if(v)el.textContent=v});
    qs('[data-lang]').textContent=language==='ar'?'EN':'AR';
    qs('[data-back]').href=language==='en'?'../../?lang=en#projects':'../../#projects';
    const url=new URL(location.href);language==='en'?url.searchParams.set('lang','en'):url.searchParams.delete('lang');history.replaceState({},'',url);
    document.title=language==='ar'?'أكاديمية X7do0 — تجربة تفاعلية':'X7do0 Academy — Interactive Demo';
  }

  function applyTheme(){document.documentElement.dataset.theme=theme;localStorage.setItem(THEME_KEY,theme);qs('button[data-theme]').textContent=theme==='dark'?'☀':'◐'}

  function setView(view){state.view=view;qsa('[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===view));qsa('[data-nav]').forEach(btn=>btn.classList.toggle('active',btn.dataset.nav===view));renderProgress();save()}

  function renderProgress(){
    const value=percent();qs('[data-progress-label]').textContent=`${value}%`;qs('[data-progress-bar]').style.width=`${value}%`;qs('[data-result-percent]').textContent=`${value}%`;qs('[data-result-bar]').style.width=`${value}%`;
    qs('[data-result-copy]').textContent=t(state.practiceSolved?'resultAfter':'resultBefore');
    qs('[data-milestone="lesson"]').classList.toggle('done',state.lessonReviewed);qs('[data-milestone="practice"]').classList.toggle('done',state.practiceSolved);qs('[data-milestone="progress"]').classList.toggle('done',state.practiceSolved);
  }

  function validPython(code){
    const normalized=code.replace(/\r/g,'');
    const assignment=/\bname\s*=\s*(['"])[^'"\n]+\1/.test(normalized);
    const print=/\bprint\s*\(\s*name\s*\)/.test(normalized);
    return assignment&&print;
  }

  function checkSolution(){
    const feedback=qs('[data-feedback]');const ok=validPython(qs('[data-editor]').value);
    feedback.className=`feedback ${ok?'success':'error'}`;feedback.textContent=t(ok?'success':'error');
    if(ok){state.practiceSolved=true;state.lessonReviewed=true;save();renderProgress();showToast(t('toastSuccess'));setTimeout(()=>setView('result'),550)}
  }

  function reset(){state=defaultState();qs('[data-editor]').value='name = "x7do0"\nprint(name)';qs('[data-feedback]').className='feedback';qs('[data-feedback]').textContent='';setView('lesson');renderProgress();save()}

  qsa('[data-nav]').forEach(btn=>btn.addEventListener('click',()=>setView(btn.dataset.nav)));
  qs('[data-go-practice]').addEventListener('click',()=>setView('practice'));
  qs('[data-back-lesson]').addEventListener('click',()=>setView('lesson'));
  qs('[data-fill]').addEventListener('click',()=>{qs('[data-editor]').value='name = "x7do0"\nprint(name)'});
  qs('[data-clear]').addEventListener('click',()=>{qs('[data-editor]').value='';qs('[data-editor]').focus()});
  qs('[data-check]').addEventListener('click',checkSolution);
  qs('[data-editor]').addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();checkSolution()}});
  qs('button[data-theme]').addEventListener('click',()=>{theme=theme==='light'?'dark':'light';applyTheme()});
  qs('[data-lang]').addEventListener('click',()=>{language=language==='ar'?'en':'ar';applyLanguage();renderProgress()});
  qs('[data-reset]').addEventListener('click',reset);

  applyLanguage();applyTheme();setView(state.view);renderProgress();
})();