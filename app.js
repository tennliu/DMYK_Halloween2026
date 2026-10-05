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
  mapFrame.classList.remove('is-hidden');
  landingScreen.classList.add('is-hidden');
  mapScreen.classList.remove('is-hidden');
  closeOverlay();
  syncAppScale();
  window.scrollTo(0,0);
  queueViewportSync();
}

function showLandingPage() {
  closeOverlay();
  mapFrame.classList.add('is-hidden');
  mapFrame.src = '';
  mapScreen.classList.add('is-hidden');
  landingScreen.classList.remove('is-hidden');
  syncAppScale();
  window.scrollTo(0,0);
  queueViewportSync();
}

function openOverlay() {
  overlay.scrollTop = 0;
  overlay.classList.add('is-visible');
  overlay.setAttribute('aria-hidden','false');
  queueViewportSync();
}
function closeOverlay() {
  overlay.classList.remove('is-visible');
  overlay.setAttribute('aria-hidden','true');
  queueViewportSync();
}

const MASTER_WIDTH = 390;
const PHONE_BREAKPOINT = 600;
const appStage = document.querySelector('.app-stage');
const phoneShell = document.querySelector('.phone-shell');
let viewportFrame = 0;
let viewportSettleTimer = 0;
let viewportFinalTimer = 0;

function syncAppScale() {
  const viewport = window.visualViewport;
  // Keep the layout width stable during browser pinch zoom.
  const vw = window.innerWidth;
  const unzoomed = viewport && Math.abs(viewport.scale - 1) < 0.02;
  const vh = unzoomed ? viewport.height : window.innerHeight;
  const scale = vw <= PHONE_BREAKPOINT ? vw / MASTER_WIDTH : 1;

  const mapActive = !mapScreen.classList.contains('is-hidden');
  document.documentElement.classList.toggle('map-active', mapActive);
  appStage.style.width = `${vw <= PHONE_BREAKPOINT ? vw : MASTER_WIDTH}px`;
  appStage.style.setProperty('--app-scale', String(scale));
  phoneShell.style.width = `${MASTER_WIDTH}px`;
  phoneShell.style.transform = `scale(${scale})`;
  if (mapActive) {
    syncMapViewport(viewport, unzoomed);
    // Only the button canvas follows the visible height; the iframe stays
    // independently anchored to the stable large viewport in CSS.
    appStage.style.removeProperty('height');
    phoneShell.style.removeProperty('height');
  } else {
    clearMapViewport();
    const stageHeight = Math.max(vh, 844 * scale);
    appStage.style.height = `${stageHeight}px`;
    phoneShell.style.height = `${stageHeight / scale}px`;
  }
}

function clearMapViewport() {
  document.documentElement.style.removeProperty('--map-viewport-height');
  document.documentElement.style.removeProperty('--map-viewport-top');
}

function syncMapViewport(viewport, unzoomed) {
  if (!unzoomed || !Number.isFinite(viewport.height) || viewport.height <= 0) {
    // Keep browser pinch zoom native; dynamic CSS height is the fallback.
    clearMapViewport();
    return;
  }
  const style = document.documentElement.style;
  const height = `${Math.round(viewport.height * 10) / 10}px`;
  const top = `${Math.round(Math.max(0, viewport.offsetTop || 0) * 10) / 10}px`;
  if (style.getPropertyValue('--map-viewport-height') !== height) {
    style.setProperty('--map-viewport-height', height);
  }
  if (style.getPropertyValue('--map-viewport-top') !== top) {
    style.setProperty('--map-viewport-top', top);
  }
}

function queueViewportSync() {
  // Coalesce event bursts; read again after toolbar animation has settled.
  if (!viewportFrame) {
    viewportFrame = requestAnimationFrame(() => {
      viewportFrame = 0;
      syncAppScale();
    });
  }
  clearTimeout(viewportSettleTimer);
  clearTimeout(viewportFinalTimer);
  viewportSettleTimer = setTimeout(syncAppScale, 180);
  viewportFinalTimer = setTimeout(syncAppScale, 450);
}

syncAppScale();
window.addEventListener('resize', queueViewportSync, {passive:true});
window.addEventListener('orientationchange', queueViewportSync, {passive:true});
window.addEventListener('pageshow', queueViewportSync, {passive:true});
window.addEventListener('focus', queueViewportSync, {passive:true});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) queueViewportSync();
});
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', queueViewportSync, {passive:true});
  window.visualViewport.addEventListener('scroll', queueViewportSync, {passive:true});
  window.visualViewport.addEventListener('scrollend', queueViewportSync, {passive:true});
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
