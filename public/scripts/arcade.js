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
document.addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||'')){e.preventDefault();search?.focus()}});
const carousel=$('[data-game-carousel]'),prev=$('[data-carousel-prev]'),next=$('[data-carousel-next]');
if(carousel){const sync=()=>{const max=carousel.scrollWidth-carousel.clientWidth;if(prev)prev.disabled=carousel.scrollLeft<4;if(next)next.disabled=carousel.scrollLeft>=max-4};prev?.addEventListener('click',()=>carousel.scrollBy({left:-carousel.clientWidth*.8,behavior:'smooth'}));next?.addEventListener('click',()=>carousel.scrollBy({left:carousel.clientWidth*.8,behavior:'smooth'}));carousel.addEventListener('scroll',sync,{passive:true});window.addEventListener('resize',sync);sync()}
const input=$('[data-category-search]'),grid=$('[data-category-grid]'),count=$('[data-category-visible]'),more=$('[data-load-more]'),sorters=$$('[data-category-sort]');
if(grid){let limit=24,mode='popular';const all=()=>$$('[data-category-item]',grid);const update=()=>{const q=(input?.value||'').trim().toLowerCase();const items=all();items.sort((a,b)=>mode==='az'?a.dataset.name.localeCompare(b.dataset.name):mode==='new'?Number(b.dataset.id)-Number(a.dataset.id):Number(a.dataset.order)-Number(b.dataset.order));items.forEach((item,i)=>{grid.append(item);item.hidden=(!!q&&!((item.dataset.name+' '+item.dataset.tags).includes(q)))||i>=limit});const matched=items.filter(item=>!q||((item.dataset.name+' '+item.dataset.tags).includes(q))).length;if(count)count.textContent=String(Math.min(matched,limit));if(more)more.hidden=matched<=limit;const empty=$('[data-category-empty]');if(empty)empty.hidden=matched!==0};input?.addEventListener('input',()=>{limit=24;update()});sorters.forEach(btn=>btn.addEventListener('click',()=>{mode=btn.dataset.categorySort;sorters.forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));limit=24;update()}));more?.addEventListener('click',()=>{limit+=24;update()});update()}
})();