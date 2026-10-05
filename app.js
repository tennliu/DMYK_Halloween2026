const MAPS = {
  zh: 'https://www.google.com/maps/d/u/0/embed?mid=1Rr329UWCCjnZ_wV9f5g5h2dY24nQXVo&ehbc=2E312F&noprof=1'
};

const COPY = {
  zh: {
    description: '🎃 東門永康萬聖節，一起來搗蛋！10/17（六）11:00–17:00，來逛商圈、找驚喜，享受公園手作、遊樂設施與舞台表演！👻\n\n點開地圖，探索活動店家，查詢地址與電話，開啟你的萬聖節冒險吧！🍬',
    share: '分享', home: '回到首頁', close: '關閉'
  }
};

const landingScreen = document.getElementById('landingScreen');
const mapScreen = document.getElementById('mapScreen');
const mapFrame = document.getElementById('mapFrame');
const overlay = document.getElementById('overlay');
const overlayDescription = document.getElementById('overlayDescription');
const shareBtn = document.getElementById('shareBtn');
const homeBtn = document.getElementById('homeBtn');
const closeBtn = document.getElementById('closeBtn');
const sideBtn = document.getElementById('sideBtn');
let currentLang = 'zh';

function applyOverlayCopy(lang) {
  const c = COPY[lang] || COPY.zh;
  overlayDescription.textContent = c.description;
  shareBtn.textContent = c.share;
  homeBtn.textContent = c.home;
  closeBtn.textContent = c.close;
}

function openMap(lang) {
  currentLang = lang;
  applyOverlayCopy(lang);
  mapFrame.src = MAPS[lang];
  landingScreen.classList.add('is-hidden');
  mapScreen.classList.remove('is-hidden');
  closeOverlay();
  window.scrollTo(0,0);
}

function showLandingPage() {
  closeOverlay();
  mapFrame.src = '';
  mapScreen.classList.add('is-hidden');
  landingScreen.classList.remove('is-hidden');
  window.scrollTo(0,0);
}

function openOverlay() {
  overlay.classList.add('is-visible');
  overlay.setAttribute('aria-hidden','false');
}
function closeOverlay() {
  overlay.classList.remove('is-visible');
  overlay.setAttribute('aria-hidden','true');
}

const MASTER_WIDTH = 390;
const PHONE_BREAKPOINT = 600;
const appStage = document.querySelector('.app-stage');
const phoneShell = document.querySelector('.phone-shell');

function syncAppScale() {
  const viewport = window.visualViewport;
  const vw = viewport ? viewport.width : window.innerWidth;
  const vh = viewport ? viewport.height : window.innerHeight;
  const scale = vw <= PHONE_BREAKPOINT ? vw / MASTER_WIDTH : 1;

  appStage.style.width = `${MASTER_WIDTH * scale}px`;
  appStage.style.height = `${vh}px`;
  phoneShell.style.width = `${MASTER_WIDTH}px`;
  phoneShell.style.height = `${vh / scale}px`;
  phoneShell.style.transform = `scale(${scale})`;
}

syncAppScale();
window.addEventListener('resize', syncAppScale, {passive:true});
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', syncAppScale, {passive:true});
}

document.getElementById('landingBtn').addEventListener('click', () => openMap('zh'));
sideBtn.addEventListener('click', openOverlay);
closeBtn.addEventListener('click', closeOverlay);
homeBtn.addEventListener('click', showLandingPage);
overlay.addEventListener('click', e => { if (e.target === overlay) closeOverlay(); });

shareBtn.addEventListener('click', async () => {
  const url = `${location.origin}${location.pathname}`;
  const data = {title:'2026 東門永康萬聖節', text:'10/17（六）11:00–17:00，東門永康一起來搗蛋！', url};
  try {
    if (navigator.share) await navigator.share(data);
    else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      shareBtn.textContent = currentLang === 'zh' ? '連結已複製' : 'Link copied';
      setTimeout(() => applyOverlayCopy(currentLang), 1200);
    }
  } catch (_) {}
});
