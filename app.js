const STORAGE_KEY="umrah-pack-v1";
const starterItems=[
["Essentials","Passport"],["Essentials","Visa / entry documents (if required)"],["Essentials","Flight tickets / booking details"],["Essentials","Hotel booking and address"],["Essentials","Wallet, cash and bank card"],["Essentials","Phone and charger"],["Essentials","Power bank (in hand luggage; check airline rules)"],["Essentials","Travel adapter"],["Essentials","Emergency contact details"],
["Ihram","Ihram garments (men) / modest prayer clothing (women)"],["Ihram","Comfortable sandals suitable for ihram"],["Ihram","Small drawstring bag"],["Ihram","Belt or ihram pouch (if needed)"],
["Clothing","Underwear"],["Clothing","Socks"],["Clothing","Loose, comfortable outfits"],["Clothing","Sleepwear"],["Clothing","Light layer for air-conditioned spaces"],["Clothing","Comfortable walking shoes"],
["Toiletries","Toothbrush and toothpaste"],["Toiletries","Unscented toiletries for ihram"],["Toiletries","Shampoo / body wash"],["Toiletries","Deodorant (unscented for ihram)"],["Toiletries","Small towel"],["Toiletries","Wet wipes and tissues"],["Toiletries","Sunscreen and lip balm"],
["Health","Regular medication in original packaging"],["Health","Prescriptions / medical documents if needed"],["Health","Plasters / blister care"],["Health","Hand sanitiser"],["Health","Reusable water bottle"],
["Travel","Luggage tags"],["Travel","Laundry bag"],["Travel","Reusable tote bag"],["Travel","Sleep mask / earplugs"],["Travel","Printed backup copies of key bookings"]
];
const defaults=()=>({items:starterItems.map((x,i)=>({id:"d"+i,category:x[0],name:x[1],done:false,custom:false})),notes:""});
let state; try{state=JSON.parse(localStorage.getItem(STORAGE_KEY))||defaults()}catch{state=defaults()}
let currentFilter="All"; let deferredPrompt=null;
const $=s=>document.querySelector(s);
function persist(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));renderProgress();$("#savedLine").textContent="Saved on this device · "+new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function renderProgress(){const total=state.items.length,done=state.items.filter(x=>x.done).length,pct=total?Math.round(done/total*100):0;$("#progressBar").style.width=pct+"%";$("#progressText").textContent=pct+"% packed";$("#countText").textContent=`${done} of ${total} items packed`}
function render(){const list=$("#checklist");list.innerHTML="";const categories=["Essentials","Ihram","Clothing","Toiletries","Health","Travel","Other"];let items=state.items.filter(x=>currentFilter==="All"||x.category===currentFilter);if(!items.length){list.innerHTML='<div class="empty">Nothing in this category yet. Tap + to add an item.</div>';renderProgress();return}
categories.forEach(cat=>{const group=items.filter(x=>x.category===cat);if(!group.length)return;const done=group.filter(x=>x.done).length;const card=document.createElement("section");card.className="category-card";card.innerHTML=`<div class="category-head"><span>${esc(cat)}</span><span>${done}/${group.length} packed</span></div>`+group.map(x=>`<label class="item-row ${x.done?"done":""}"><input type="checkbox" data-check="${esc(x.id)}" ${x.done?"checked":""} aria-label="Mark ${esc(x.name)} packed"><span class="item-label">${esc(x.name)}</span>${x.custom?`<button type="button" class="delete-item" data-delete="${esc(x.id)}" aria-label="Delete ${esc(x.name)}">×</button>`:""}</label>`).join("");list.appendChild(card)});renderProgress()}
document.addEventListener("change",e=>{if(e.target.matches("[data-check]")){const item=state.items.find(x=>x.id===e.target.dataset.check);if(item){item.done=e.target.checked;persist();render()}}});
document.addEventListener("click",e=>{const del=e.target.closest("[data-delete]");if(del){state.items=state.items.filter(x=>x.id!==del.dataset.delete);persist();render();toast("Item removed")}});
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{currentFilter=b.dataset.filter;document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t===b));render()}));
$("#addToggle").addEventListener("click",()=>{$("#addForm").classList.toggle("hidden");if(!$("#addForm").classList.contains("hidden"))$("#itemName").focus()});
$("#cancelAdd").addEventListener("click",()=>{$("#addForm").classList.add("hidden");$("#itemName").value=""});
$("#addForm").addEventListener("submit",e=>{e.preventDefault();const name=$("#itemName").value.trim();if(!name)return;state.items.push({id:"c"+Date.now().toString(36)+Math.random().toString(36).slice(2,6),name,category:$("#itemCategory").value,done:false,custom:true});persist();currentFilter="All";document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.filter==="All"));render();$("#addForm").reset();$("#addForm").classList.add("hidden");toast("Item added")});
$("#notes").value=state.notes||"";let noteTimer;$("#notes").addEventListener("input",()=>{state.notes=$("#notes").value;$("#savedLine").textContent="Saving…";clearTimeout(noteTimer);noteTimer=setTimeout(persist,250)});
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)}
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("#installBtn").classList.remove("hidden")});
$("#installBtn").addEventListener("click",async()=>{if(!deferredPrompt){toast("Use your browser menu to install this app");return}deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("#installBtn").classList.add("hidden")});
window.addEventListener("appinstalled",()=>toast("Umrah Pack installed"));
if("serviceWorker" in navigator && location.protocol!=="file:"){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}))}
renderProgress();render();