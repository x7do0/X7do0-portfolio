(() => {
  'use strict';

  const KEY = 'x7do0-mahsoob-demo-v1';
  const LANGUAGE_KEY = 'x7do0-language';
  const products = [
    { id: '1001', ar: 'ماء معدني', en: 'Mineral water', price: 750 },
    { id: '1002', ar: 'عصير برتقال', en: 'Orange juice', price: 1500 },
    { id: '1003', ar: 'بسكويت', en: 'Biscuits', price: 1250 },
    { id: '1004', ar: 'حليب', en: 'Milk', price: 2000 }
  ];

  const i18n = {
    ar: { portfolio:'البورتفوليو',sample:'بيانات تجريبية فقط',reset:'إعادة التجربة',store:'متجر محسوب التجريبي',offline:'يعمل محليًا · بدون إنترنت',cashier:'الكاشير',catalog:'المنتجات',reports:'التقارير',goal:'هدف التجربة',goalCopy:'أضف منتجًا للسلة، أدخل المبلغ المستلم، ثم أكمل البيع وشاهد الإيصال.',cashierTitle:'نقطة البيع',cashierCopy:'الباركود والسلة والدفع في شاشة واحدة.',ready:'جاهز للبيع',quickProducts:'منتجات سريعة',quickCopy:'اضغط على أي منتج لإضافته للسلة.',barcode:'الباركود',add:'إضافة',cart:'السلة',items:'عنصر',clear:'تفريغ',total:'الإجمالي',received:'المبلغ المستلم',change:'الباقي',complete:'إكمال البيع',receiptDemo:'إيصال تجريبي',thanks:'شكرًا لزيارتكم',newSale:'عملية جديدة',emptyTitle:'السلة فارغة',emptyCopy:'اختر منتجًا أو أدخل باركود تجريبي.',notFound:'الباركود غير موجود في بيانات الـDemo.',added:'تمت إضافة المنتج إلى السلة.',needCash:'أدخل مبلغًا مستلمًا يساوي الإجمالي أو يزيد عليه.',done:'تمت عملية البيع التجريبية.' },
    en: { portfolio:'Portfolio',sample:'Sample data only',reset:'Reset demo',store:'Mahsoob demo store',offline:'Local-first · works offline',cashier:'Cashier',catalog:'Products',reports:'Reports',goal:'Demo goal',goalCopy:'Add a product, enter received cash, complete the sale, and view the receipt.',cashierTitle:'Point of sale',cashierCopy:'Barcode, cart, and payment in one screen.',ready:'Ready for sale',quickProducts:'Quick products',quickCopy:'Click any product to add it to the cart.',barcode:'Barcode',add:'Add',cart:'Cart',items:'items',clear:'Clear',total:'Total',received:'Cash received',change:'Change',complete:'Complete sale',receiptDemo:'Demo receipt',thanks:'Thank you',newSale:'New sale',emptyTitle:'Cart is empty',emptyCopy:'Choose a product or enter a demo barcode.',notFound:'Barcode is not available in the demo data.',added:'Product added to cart.',needCash:'Enter received cash equal to or above the total.',done:'Demo sale completed.' }
  };

  const qs = (s, p=document) => p.querySelector(s);
  const qsa = (s, p=document) => [...p.querySelectorAll(s)];
  let language = new URLSearchParams(location.search).get('lang') === 'en' || localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'ar';
  const embedded = new URLSearchParams(location.search).get('embedded') === '1';
  let toastTimer;

  function defaultState(){ return { cart:{}, cash:0 }; }
  function load(){ try { return { ...defaultState(), ...JSON.parse(sessionStorage.getItem(KEY) || '{}') }; } catch { return defaultState(); } }
  let state = load();
  function save(){ sessionStorage.setItem(KEY, JSON.stringify(state)); }
  function t(k){ return i18n[language][k] || k; }
  function money(v){ return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(v)} ${language==='ar'?'د.ع':'IQD'}`; }
  function total(){ return Object.entries(state.cart).reduce((sum,[id,qty]) => sum + (products.find(p=>p.id===id)?.price || 0)*qty,0); }
  function notifyParent(){
    if(!embedded||parent===window)return;
    const sum=total();const cash=Number(qs('[data-cash]').value||state.cash||0);const receiptOpen=qs('[data-receipt]').open;
    parent.postMessage({source:'mahsoob-demo',type:'state',progress:{
      product:sum>0?'complete':'current',
      payment:sum>0?(cash>=sum?'complete':'current'):'idle',
      checkout:receiptOpen?'complete':cash>=sum&&sum>0?'current':'idle',
      receipt:receiptOpen?'current':'idle'
    }},location.origin);
  }
  function showToast(text){ const el=qs('[data-toast]'); el.textContent=text; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),1800); }

  function applyLanguage(){
    document.documentElement.lang=language; document.documentElement.dir=language==='ar'?'rtl':'ltr'; localStorage.setItem(LANGUAGE_KEY,language);
    qsa('[data-i18n]').forEach(el=>{ if(i18n[language][el.dataset.i18n]) el.textContent=i18n[language][el.dataset.i18n]; });
    qs('[data-lang]').textContent=language==='ar'?'EN':'AR';
    qs('[data-back]').href=language==='en'?'../../?lang=en#projects':'../../#projects';
    const url=new URL(location.href); language==='en'?url.searchParams.set('lang','en'):url.searchParams.delete('lang'); history.replaceState({},'',url);
    document.title=language==='ar'?'محسوب — تجربة الكاشير':'Mahsoob — Cashier Demo';
  }

  function renderProducts(){
    const host=qs('[data-products]'); host.replaceChildren(...products.map(p=>{
      const b=document.createElement('button'); b.type='button'; b.className='product'; b.dataset.product=p.id;
      b.innerHTML=`<span>${p.id}</span><strong>${language==='ar'?p.ar:p.en}</strong><b>${money(p.price)}</b>`;
      b.addEventListener('click',()=>addProduct(p.id)); return b;
    }));
  }

  function addProduct(id){
    const product=products.find(p=>p.id===id); if(!product){ showToast(t('notFound')); return; }
    state.cart[id]=(state.cart[id]||0)+1; save(); renderCart(); showToast(t('added'));
  }

  function changeQty(id,delta){
    const next=(state.cart[id]||0)+delta; if(next<=0) delete state.cart[id]; else state.cart[id]=next; save(); renderCart();
  }

  function renderCart(){
    const host=qs('[data-cart]'); const entries=Object.entries(state.cart).filter(([,q])=>q>0); host.replaceChildren();
    if(!entries.length){
      const empty=document.createElement('div'); empty.className='empty'; empty.innerHTML=`<span>🛒</span><strong>${t('emptyTitle')}</strong><p>${t('emptyCopy')}</p>`; host.append(empty);
    } else entries.forEach(([id,qty])=>{
      const p=products.find(x=>x.id===id); const row=document.createElement('div'); row.className='cart-row';
      row.innerHTML=`<div class="cart-copy"><strong>${language==='ar'?p.ar:p.en}</strong><small>${money(p.price)} · ${money(p.price*qty)}</small></div><div class="qty"><button type="button" data-minus>-</button><b>${qty}</b><button type="button" data-plus>+</button></div>`;
      row.querySelector('[data-minus]').addEventListener('click',()=>changeQty(id,-1)); row.querySelector('[data-plus]').addEventListener('click',()=>changeQty(id,1)); host.append(row);
    });
    const count=entries.reduce((s,[,q])=>s+q,0); const sum=total(); const cash=Number(qs('[data-cash]').value || state.cash || 0); state.cash=cash;
    qs('[data-cart-count]').textContent=String(count); qs('[data-total]').textContent=money(sum); qs('[data-change]').textContent=money(Math.max(0,cash-sum)); qs('[data-checkout]').disabled=!sum || cash<sum; save(); notifyParent();
  }

  function openReceipt(){
    const sum=total(); const cash=Number(qs('[data-cash]').value||0); if(!sum || cash<sum){ showToast(t('needCash')); return; }
    const lines=qs('[data-receipt-lines]'); lines.replaceChildren(...Object.entries(state.cart).map(([id,qty])=>{
      const p=products.find(x=>x.id===id); const line=document.createElement('div'); line.className='receipt-line'; line.innerHTML=`<span>${language==='ar'?p.ar:p.en} × ${qty}</span><b>${money(p.price*qty)}</b>`; return line;
    }));
    qs('[data-receipt-total]').textContent=money(sum); qs('[data-receipt-cash]').textContent=money(cash); qs('[data-receipt-change]').textContent=money(cash-sum); qs('[data-receipt]').showModal(); notifyParent(); showToast(t('done'));
  }

  function reset(){ state=defaultState(); save(); qs('[data-cash]').value=''; const receipt=qs('[data-receipt]'); if(receipt.open) receipt.close(); renderCart(); }
  qs('[data-barcode-form]').addEventListener('submit',e=>{e.preventDefault(); addProduct(qs('[data-barcode]').value.trim());});
  qs('[data-cash]').addEventListener('input',()=>{ state.cash=Number(qs('[data-cash]').value||0); renderCart(); });
  qs('[data-clear]').addEventListener('click',()=>{state.cart={};save();renderCart();});
  qs('[data-checkout]').addEventListener('click',openReceipt);
  qs('[data-receipt-close]').addEventListener('click',()=>{qs('[data-receipt]').close(); reset();});
  qs('[data-reset]').addEventListener('click',reset);
  addEventListener('message',event=>{if(embedded&&event.origin===location.origin&&event.data?.source==='x7do0-portfolio'&&event.data.type==='reset')reset()});
  qs('[data-lang]').addEventListener('click',()=>{language=language==='ar'?'en':'ar';applyLanguage();renderProducts();renderCart();});

  applyLanguage(); renderProducts(); qs('[data-cash]').value=state.cash||''; renderCart();
})();
