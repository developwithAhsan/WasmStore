(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const typewriter=$('[data-game-typewriter]');
if(typewriter){
 const featuredGames=['PLAY GTA 5 IN YOUR BROWSER','PLAY GTA VICE CITY IN YOUR BROWSER','PLAY MINECRAFT IN YOUR BROWSER','PLAY GTA 3 IN YOUR BROWSER','PLAY STREET FIGHTER IN YOUR BROWSER','PLAY ROAD RASH IN YOUR BROWSER'];
 const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduceMotion){typewriter.textContent=featuredGames[0]}
 else{
  let gameIndex=0,charIndex=featuredGames[0].length,deleting=true;
  typewriter.textContent=featuredGames[0];
  const tick=()=>{
   const word=featuredGames[gameIndex];
   if(deleting){
    charIndex=Math.max(0,charIndex-1);
    typewriter.textContent=word.slice(0,charIndex);
    if(charIndex===0){deleting=false;gameIndex=(gameIndex+1)%featuredGames.length;window.setTimeout(tick,350);return}
    window.setTimeout(tick,42);
   }else{
    const nextWord=featuredGames[gameIndex];
    charIndex=Math.min(nextWord.length,charIndex+1);
    typewriter.textContent=nextWord.slice(0,charIndex);
    if(charIndex===nextWord.length){deleting=true;window.setTimeout(tick,1350);return}
    window.setTimeout(tick,82);
   }
  };
  window.setTimeout(tick,1350);
 }
}
const search=$('#header-game-search');

const carousel=$('[data-game-carousel]'),prev=$('[data-carousel-prev]'),next=$('[data-carousel-next]');
if(carousel){const sync=()=>{const max=carousel.scrollWidth-carousel.clientWidth;if(prev)prev.disabled=carousel.scrollLeft<4;if(next)next.disabled=carousel.scrollLeft>=max-4};prev?.addEventListener('click',()=>carousel.scrollBy({left:-carousel.clientWidth*.8,behavior:'smooth'}));next?.addEventListener('click',()=>carousel.scrollBy({left:carousel.clientWidth*.8,behavior:'smooth'}));carousel.addEventListener('scroll',sync,{passive:true});window.addEventListener('resize',sync);sync()}
const input=$('[data-category-search]'),grid=$('[data-category-grid]'),count=$('[data-category-visible]'),more=$('[data-load-more]'),sorters=$$('[data-category-sort]');
if(grid){let limit=24,mode='popular';const all=()=>$$('[data-category-item]',grid);const update=()=>{const q=(input?.value||'').trim().toLowerCase();const items=all();items.sort((a,b)=>mode==='az'?a.dataset.name.localeCompare(b.dataset.name):mode==='new'?Number(b.dataset.id)-Number(a.dataset.id):Number(a.dataset.order)-Number(b.dataset.order));items.forEach((item,i)=>{grid.append(item);item.hidden=(!!q&&!((item.dataset.name+' '+item.dataset.tags).includes(q)))||i>=limit});const matched=items.filter(item=>!q||((item.dataset.name+' '+item.dataset.tags).includes(q))).length;if(count)count.textContent=String(Math.min(matched,limit));if(more)more.hidden=matched<=limit;const empty=$('[data-category-empty]');if(empty)empty.hidden=matched!==0};input?.addEventListener('input',()=>{limit=24;update()});sorters.forEach(btn=>btn.addEventListener('click',()=>{mode=btn.dataset.categorySort;sorters.forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));limit=24;update()}));more?.addEventListener('click',()=>{limit+=24;update()});update()}
})();

/* Live search suggestions use the full catalog search index, then keep normal form submission available. */
const searchForm=search?.closest('form');
const suggestionBox=searchForm?.querySelector('[data-search-suggestions]');
let searchIndexPromise;
const getSearchIndex=()=>searchIndexPromise||(searchIndexPromise=fetch('/search-index.json').then(r=>{if(!r.ok)throw new Error('Search index unavailable');return r.json()}).catch(()=>[]));
const closeSuggestions=()=>{if(suggestionBox){suggestionBox.hidden=true;suggestionBox.replaceChildren()}search?.setAttribute('aria-expanded','false')};
const renderSuggestions=async()=>{
 if(!search||!suggestionBox)return;
 const query=search.value.trim().toLocaleLowerCase();
 if(query.length<1){closeSuggestions();return}
 suggestionBox.hidden=false;suggestionBox.replaceChildren();
 const loading=document.createElement('div');loading.className='arcade-search-suggestion-empty';loading.textContent='Searching games…';suggestionBox.append(loading);
 search.setAttribute('aria-expanded','true');
 const index=await getSearchIndex();
 if(search.value.trim().toLocaleLowerCase()!==query)return;
 const matches=index.map(game=>{
  const haystack=[game.name,game.category,...(game.tags||[]),...(game.keywords||[])].join(' ').toLocaleLowerCase();
  const name=game.name.toLocaleLowerCase();
  const score=name.startsWith(query)?0:name.includes(query)?1:2;
  return {game,haystack,score};
 }).filter(item=>item.haystack.includes(query)).sort((a,b)=>a.score-b.score||a.game.name.localeCompare(b.game.name)).slice(0,8);
 suggestionBox.replaceChildren();
 if(!matches.length){const empty=document.createElement('div');empty.className='arcade-search-suggestion-empty';empty.textContent='No matching games. Try another title or keyword.';suggestionBox.append(empty);return}
 for(const {game} of matches){
  const link=document.createElement('a');link.className='arcade-search-suggestion';link.href='/games/'+encodeURIComponent(game.slug);link.setAttribute('role','option');
  if(game.thumbnailUrl){const img=document.createElement('img');img.src=game.thumbnailUrl;img.alt='';img.loading='lazy';link.append(img)}
  else{const placeholder=document.createElement('span');placeholder.className='arcade-search-suggestion-placeholder';placeholder.textContent=(game.name||'?').slice(0,1).toUpperCase();placeholder.setAttribute('aria-hidden','true');link.append(placeholder)}
  const copy=document.createElement('span');copy.className='arcade-search-suggestion-copy';
  const name=document.createElement('span');name.className='arcade-search-suggestion-name';name.textContent=game.name;
  const meta=document.createElement('span');meta.className='arcade-search-suggestion-meta';meta.textContent=game.category||'Browser game';
  copy.append(name,meta);link.append(copy);suggestionBox.append(link);
 }
};
search?.setAttribute('autocomplete','off');
search?.setAttribute('aria-autocomplete','list');
search?.setAttribute('aria-expanded','false');
search?.addEventListener('input',()=>{void renderSuggestions()});
search?.addEventListener('focus',()=>{if(search.value.trim())void renderSuggestions()});
search?.addEventListener('keydown',e=>{if(e.key==='Escape')closeSuggestions();if(e.key==='ArrowDown'){const first=suggestionBox?.querySelector('a');if(first){e.preventDefault();first.focus()}}});
document.addEventListener('click',e=>{if(searchForm&&!searchForm.contains(e.target))closeSuggestions()});
