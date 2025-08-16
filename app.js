// Hanzi Cards — App mobile em HTML/CSS/JS (localStorage)
(function(){
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // --- Persistência ---------------------------------------------------------
  const STORE_KEY = 'hanzi_cards_v1';

  function loadStore(){
    try{ return JSON.parse(localStorage.getItem(STORE_KEY)) || seedData(); }
    catch{ return seedData(); }
  }
  function saveStore(){ localStorage.setItem(STORE_KEY, JSON.stringify(store)); }

  function seedData(){
    const now = Date.now();
    const lists = [
      {
        id: uid(), name: 'HSK 1 — básicos', createdAt: now, updatedAt: now,
        cards: [
          {id: uid(), hanzi:'你', pinyin:'nǐ', meaning:'você', examples:['你好！','我认识你。'], alt:[]},
          {id: uid(), hanzi:'好', pinyin:'hǎo', meaning:'bom; bem', examples:['我很好。','今天天气很好。'], alt:[]},
          {id: uid(), hanzi:'我', pinyin:'wǒ', meaning:'eu', examples:['我是巴西人。','我爱学习中文。'], alt:[]},
          {id: uid(), hanzi:'人', pinyin:'rén', meaning:'pessoa; gente', examples:['他是好人。','很多人喜欢茶。'], alt:[]},
          {id: uid(), hanzi:'中国', pinyin:'Zhōngguó', meaning:'China', examples:['我去中国。','中国很大。'], alt:['中國']},
        ]
      },
      {
        id: uid(), name: 'Pronomes', createdAt: now, updatedAt: now,
        cards: [
          {id: uid(), hanzi:'他', pinyin:'tā', meaning:'ele', examples:['他是老师。','我喜欢他。'], alt:[]},
          {id: uid(), hanzi:'她', pinyin:'tā', meaning:'ela', examples:['她很好。','我认识她。'], alt:[]},
          {id: uid(), hanzi:'它', pinyin:'tā', meaning:'ele/ela (neutro, coisas/animais)', examples:['它是我的猫。','我爱它。'], alt:[]},
        ]
      }
    ];
    const obj = { lists };
    localStorage.setItem(STORE_KEY, JSON.stringify(obj));
    return obj;
  }

  let store = loadStore();

  // --- Utilidades -----------------------------------------------------------
  function uid(){ return Math.random().toString(36).slice(2, 9); }
  function fmtCount(n){ return n === 1 ? '1 cartão' : `${n} cartões`; }
  function toast(msg){
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    setTimeout(()=> t.classList.remove('show'), 1400);
  }

  // Navegação simples entre views
  function showView(id){ $$('.view').forEach(v=>v.classList.remove('active')); $(id).classList.add('active'); }

  // --- View: Listas ---------------------------------------------------------
  const listsUl = $('#lists');
  const searchList = $('#searchList');

  function renderLists(){
    const q = (searchList.value||'').trim().toLowerCase();
    const items = store.lists
      .slice()
      .sort((a,b)=> (b.updatedAt||0)-(a.updatedAt||0))
      .filter(l => l.name.toLowerCase().includes(q));

    listsUl.innerHTML = '';
    if(items.length === 0){
      listsUl.innerHTML = `<li class="card"><div class="muted">Nenhuma lista. Toque em “Nova lista”.</div></li>`;
      return;
    }

    for(const l of items){
      const li = document.createElement('li');
      li.className = 'card';
      li.innerHTML = `
        <div class="row">
          <div>
            <div class="title">${escapeHtml(l.name)}</div>
            <div class="muted">${fmtCount(l.cards.length)}</div>
          </div>
          <div class="actions">
            <button class="btn" data-act="edit">Editar</button>
            <button class="btn primary" data-act="study">Estudar ▶</button>
          </div>
        </div>`;
      li.addEventListener('click', (e)=>{
        const act = e.target.closest('button')?.dataset?.act;
        if(act === 'edit'){ openEditor(l.id); }
        else if(act === 'study'){ startStudy(l.id); }
        else { /* clique no card inicia estudo */ startStudy(l.id); }
      });
      listsUl.appendChild(li);
    }
  }

  $('#btnNewList').addEventListener('click', ()=>{
    const now = Date.now();
    const nl = { id: uid(), name: 'Nova lista', createdAt: now, updatedAt: now, cards: [] };
    store.lists.push(nl); saveStore(); openEditor(nl.id);
  });
  searchList.addEventListener('input', renderLists);

  // Exportar / Importar
  $('#btnExport').addEventListener('click', ()=>{
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(store, null, 2));
    const a = document.createElement('a'); a.href = dataStr; a.download = 'hanzi-cards-export.json'; a.click();
  });
  $('#btnImport').addEventListener('click', ()=> $('#fileImport').click());
  $('#fileImport').addEventListener('change', async (e)=>{
    const file = e.target.files?.[0]; if(!file) return;
    try{
      const text = await file.text();
      const obj = JSON.parse(text);
      if(!obj || !Array.isArray(obj.lists)) throw new Error('Formato inválido');
      store = obj; saveStore(); toast('Importado com sucesso'); renderLists();
    }catch(err){ alert('Falha ao importar: '+ err.message); }
    e.target.value = '';
  });

  // --- View: Editor ---------------------------------------------------------
  const listNameInput = $('#listName');
  const cardsUl = $('#cards');
  let editingListId = null;

  function openEditor(listId){
    editingListId = listId;
    const list = store.lists.find(l=>l.id===listId);
    if(!list) return;
    $('#editTitle').textContent = 'Editar — ' + list.name;
    listNameInput.value = list.name;
    renderCards(list);
    showView('#viewEdit');
  }
  
  function renderCards(list){
    cardsUl.innerHTML = '';
    if(list.cards.length === 0){
      cardsUl.innerHTML = `<li class="card"><div class="muted">Nenhum cartão ainda.</div></li>`;
      return;
    }
    for(const c of list.cards){
      const li = document.createElement('li');
      li.className = 'card';
      li.innerHTML = `
        <div class="row">
          <div>
            <div class="title" style="font-size:22px">${escapeHtml(c.hanzi)}</div>
            <div class="muted">${escapeHtml(c.pinyin)} · ${escapeHtml(c.meaning)}</div>
          </div>
          <div class="actions">
            <button class="btn" data-act="edit">Editar</button>
            <button class="btn danger" data-act="del">Remover</button>
          </div>
        </div>`;
      li.addEventListener('click', (e)=>{
        const act = e.target.closest('button')?.dataset?.act;
        if(act==='del'){
          if(confirm('Remover este cartão?')){
            list.cards = list.cards.filter(x=>x.id!==c.id);
            list.updatedAt = Date.now(); saveStore(); renderCards(list);
          }
        } else if(act==='edit'){
          editCardDialog(list, c);
        }
      });
      cardsUl.appendChild(li);
    }
  }

  function editCardDialog(list, card){
    const exStr = (card.examples||[]).join('\n');
    const altStr = (card.alt||[]).join(',');
    const html = `
      <div class="grid" style="gap:8px">
        <label class="label">Hanzi<input id="dlgHanzi" class="input hanzi" value="${escapeAttr(card.hanzi)}"></label>
        <label class="label">Pinyin<input id="dlgPinyin" class="input" value="${escapeAttr(card.pinyin)}"></label>
        <label class="label">Significado<input id="dlgMeaning" class="input" value="${escapeAttr(card.meaning)}"></label>
        <label class="label">Alternativas<input id="dlgAlt" class="input" value="${escapeAttr(altStr)}"></label>
        <label class="label">Exemplos<textarea id="dlgExamples" class="input" rows="4">${escapeText(exStr)}</textarea></label>
      </div>`;
    modal('Editar cartão', html, {
      okText: 'Salvar', onOk: () =>{
        card.hanzi = $('#dlgHanzi').value.trim();
        card.pinyin = $('#dlgPinyin').value.trim();
        card.meaning = $('#dlgMeaning').value.trim();
        card.alt = $('#dlgAlt').value.split(',').map(s=>s.trim()).filter(Boolean);
        card.examples = $('#dlgExamples').value.split(/\n+/).map(s=>s.trim()).filter(Boolean);
        list.updatedAt = Date.now(); saveStore(); renderCards(list);
      }
    });
  }

  // alterar nome da lista
  listNameInput.addEventListener('input', ()=>{
    const list = store.lists.find(l=>l.id===editingListId); if(!list) return;
    list.name = listNameInput.value.trim() || 'Sem nome';
    list.updatedAt = Date.now(); saveStore(); $('#editTitle').textContent = 'Editar — ' + list.name; renderLists();
  });

  // adicionar cartão
  $('#btnAddCard').addEventListener('click', ()=>{
    const list = store.lists.find(l=>l.id===editingListId); if(!list) return;
    const hanzi = $('#cardHanzi').value.trim();
    const pinyin = $('#cardPinyin').value.trim();
    const meaning = $('#cardMeaning').value.trim();
    const alt = $('#cardAlt').value.split(',').map(s=>s.trim()).filter(Boolean);
    const examples = $('#cardExamples').value.split(/\n+/).map(s=>s.trim()).filter(Boolean);
    if(!hanzi){ toast('Informe o Hanzi'); return; }
    list.cards.push({ id: uid(), hanzi, pinyin, meaning, alt, examples});
    list.updatedAt = Date.now(); saveStore(); renderCards(list);
    // limpar
    ['cardHanzi','cardPinyin','cardMeaning','cardAlt','cardExamples'].forEach(id=> $('#'+id).value='');
  });

  $('#btnDeleteList').addEventListener('click', ()=>{
    const list = store.lists.find(l=>l.id===editingListId); if(!list) return;
    if(confirm('Remover a lista inteira? Esta ação não pode ser desfeita.')){
      store.lists = store.lists.filter(x=>x.id!==list.id); saveStore(); editingListId = null; showView('#viewLists'); renderLists();
    }
  });
  $('#btnStartStudy').addEventListener('click', ()=> startStudy(editingListId));

  $('#backToLists').addEventListener('click', ()=>{ showView('#viewLists'); renderLists(); });

  // --- View: Estudo ---------------------------------------------------------
  let study = { listId:null, order:[], idx:0 };
  const hanziChar = $('#hanziChar');
  const assist = $('#assist');
  const pinyin = $('#pinyin');
  const meaning = $('#meaning');
  const examplesDiv = $('#examples');
  const answerInput = $('#answerInput');
  const progress = $('#progress');

  function startStudy(listId){
    const list = store.lists.find(l=>l.id===listId);
    if(!list || list.cards.length===0){ toast('Lista vazia'); return; }
    study.listId = listId;
    const order = list.cards.map((_,i)=>i);
    if($('#optShuffle').checked) shuffle(order);
    study.order = order; study.idx = 0;
    $('#studyTitle').textContent = 'Estudo — ' + list.name;
    showView('#viewStudy');
    showCurrent();
    setTimeout(()=>{ answerInput.focus(); }, 150);
  }

  function currentCard(){
    const list = store.lists.find(l=>l.id===study.listId); if(!list) return null;
    const i = study.order[study.idx];
    return list.cards[i];
  }

  function showCurrent(){
    const list = store.lists.find(l=>l.id===study.listId);
    const i = study.order[study.idx];
    const card = list.cards[i];
    hanziChar.textContent = card.hanzi;
    pinyin.textContent = card.pinyin || '';
    meaning.textContent = card.meaning || '';
    assist.classList.add('hidden');

    examplesDiv.innerHTML = '';
    (card.examples||[]).forEach(ex =>{
      const div = document.createElement('div');
      div.className = 'ex'; div.textContent = ex; examplesDiv.appendChild(div);
    });

    progress.textContent = `${study.idx+1} / ${study.order.length}`;
    answerInput.value = '';
    answerInput.classList.remove('error','ok');
  }

  function nextCard(){
    if(study.idx < study.order.length - 1){
      study.idx++; showCurrent();
    } else if($('#optLoop').checked){
      shuffle(study.order); study.idx = 0; showCurrent();
    } else {
      toast('Parabéns! Você terminou esta lista.');
    }
  }

  $('#answerForm').addEventListener('submit', (e)=>{
    e.preventDefault(); checkAnswer();
  });

  function normalize(s){ return (s||'').trim(); }

  function checkAnswer(){
    const c = currentCard(); if(!c) return;
    const val = normalize(answerInput.value);
    const target = normalize(c.hanzi);
    const alts = (c.alt||[]).map(normalize);
    const isOk = val && (val === target || alts.includes(val));

    if(isOk){
      answerInput.classList.remove('error');
      answerInput.classList.add('ok');
      toast('✔ Correto!');
      setTimeout(()=>{ answerInput.classList.remove('ok'); nextCard(); }, 250);
    } else {
      answerInput.classList.remove('ok');
      answerInput.classList.add('error');
      assist.classList.remove('hidden');
    }
  }

  $('#btnReveal').addEventListener('click', ()=> assist.classList.toggle('hidden'));
  $('#btnSkip').addEventListener('click', ()=> nextCard());
  $('#backToEdit').addEventListener('click', ()=>{ showView('#viewEdit'); });

  // --- Helpers de UI --------------------------------------------------------
  function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }
  function escapeHtml(s=''){ return s.replace(/[&<>]/g, ch=> ({'&':'&amp;','<':'&lt;','>':'&gt;'}[ch]) ); }
  function escapeAttr(s=''){ return s.replace(/"/g,'&quot;'); }
  function escapeText(s=''){ return s.replace(/</g,'&lt;'); }

  // Modal simples
  function modal(title, html, {okText='OK', cancelText='Cancelar', onOk}={}){
    const wrap = document.createElement('div');
    wrap.style = 'position:fixed;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.5);z-index:20;padding:16px';
    wrap.innerHTML = `
      <div style="max-width:560px;width:100%;background:#10131a;border:1px solid rgba(255,255,255,.15);border-radius:14px;box-shadow:var(--shadow)">
        <div style="padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08);font-weight:600">${title}</div>
        <div style="padding:12px 14px">${html}</div>
        <div style="display:flex;gap:8px;justify-content:flex-end;padding:12px 14px;border-top:1px solid rgba(255,255,255,.08)">
          <button class="btn ghost" id="mCancel">${cancelText}</button>
          <button class="btn primary" id="mOk">${okText}</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click', (e)=>{ if(e.target===wrap) document.body.removeChild(wrap); });
    wrap.querySelector('#mCancel').addEventListener('click', ()=> document.body.removeChild(wrap));
    wrap.querySelector('#mOk').addEventListener('click', ()=>{ onOk && onOk(); document.body.removeChild(wrap); });
  }

  // Inicialização
  renderLists();
})();
