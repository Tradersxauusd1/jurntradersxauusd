// popup-ads.js — Elegant XM & Exness Popup Ads + CTA Button
function showPopupAd() {
  if (sessionStorage.getItem('popupShown')) return;
  sessionStorage.setItem('popupShown', 'true');

  const popup = document.createElement('div');
  popup.innerHTML = `
    <div id="popupOverlay" style="
      position:fixed;inset:0;background:rgba(0,0,0,0.85);
      display:flex;align-items:center;justify-content:center;
      z-index:999999;animation:fadeIn .7s ease;">
      
      <div id="popupBox" style="
        background:linear-gradient(180deg,#0d0d0d,#1a1a1a);
        border:1.5px solid #d4af37;border-radius:14px;
        padding:20px;max-width:720px;width:92%;
        text-align:center;box-shadow:0 0 30px rgba(212,175,55,0.4);
        animation:scaleUp .6s ease;position:relative;">
        
        <h2 style="color:#d4af37;font-size:1.3rem;margin-bottom:12px;">
          🎯 Promo Spesial Trader — XM & Exness
        </h2>

        <div class="promo-slider" style="position:relative;overflow:hidden;border-radius:10px;">
          <!-- Slide 1: Exness -->
          <div class="promo-slide active">
            <a href="https://one.exnessonelink.com/intl/en/a/6ctf9tyym5?platform=mobile" target="_blank">
              <img src="https://d3dpet1g0ty5ed.cloudfront.net/ID_Take_Control_728x90px.gif"
                   alt="Exness Bonus" style="width:100%;max-height:90px;border-radius:10px;">
            </a>
            <button class="cta-btn" onclick="window.open('https://one.exnessonelink.com/intl/en/a/6ctf9tyym5?platform=mobile','_blank')">
              Gabung Sekarang di Exness
            </button>
          </div>

          <!-- Slide 2: Exness Mobile -->
          <div class="promo-slide" style="display:none;">
            <a href="https://one.exnessonelink.com/intl/en/a/6ctf9tyym5?platform=mobile" target="_blank">
              <img src="https://d3dpet1g0ty5ed.cloudfront.net/ID_Spreads_Stable_pricing_for_unstable_markets_3-33_Google_320x50.jpg"
                   alt="Exness Mobile" style="width:100%;max-height:90px;border-radius:10px;">
            </a>
            <button class="cta-btn" onclick="window.open('https://one.exnessonelink.com/intl/en/a/6ctf9tyym5?platform=mobile','_blank')">
              Gabung Sekarang di Exness
            </button>
          </div>

          <!-- Slide 3: XM 1 -->
          <div class="promo-slide" style="display:none;">
            <a href="https://affs.click/lEnr0" target="_blank">
              <img src="https://ads.pipaffiliates.com/i/132162?c=1062011"
                   alt="XM Promo 1" style="width:100%;max-height:250px;border-radius:10px;">
            </a>
            <button class="cta-btn" onclick="window.open('https://affs.click/lEnr0=132162&c=1062011','_blank')">
              Gabung Sekarang di XM
            </button>
          </div>

          <!-- Slide 4: XM 2 -->
          <div class="promo-slide" style="display:none;">
            <a href="https://affs.click/lEnr0" target="_blank">
              <img src="https://ads.pipaffiliates.com/i/131312?c=1062011"
                   alt="XM Promo 2" style="width:100%;max-height:250px;border-radius:10px;">
            </a>
            <button class="cta-btn" onclick="window.open('https://affs.click/lEnr0=131312&c=1062011','_blank')">
              Gabung Sekarang di XM
            </button>
          </div>
        </div>

        <div style="margin-top:14px;">
          <button id="popupClose" style="
            padding:8px 18px;border:none;border-radius:6px;
            background:#d4af37;color:#111;font-weight:700;cursor:pointer;">
            Tutup
          </button>
        </div>
      </div>
    </div>

    <style>
      @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      @keyframes scaleUp { from{transform:scale(.85);opacity:0} to{transform:scale(1);opacity:1} }
      .cta-btn {
        margin-top:8px;
        background:#d4af37;
        color:#111;
        font-weight:700;
        border:none;
        border-radius:6px;
        padding:8px 16px;
        cursor:pointer;
        transition:background .3s;
      }
      .cta-btn:hover { background:#f6d25c; }
      @media(max-width:520px){
        #popupBox{padding:14px;max-width:92%;}
        #popupBox h2{font-size:1rem;}
        .cta-btn{font-size:0.9rem;padding:6px 14px;}
      }
    </style>
  `;

  document.body.appendChild(popup);

  // tombol tutup manual
  document.getElementById('popupClose').onclick = () => popup.remove();

  // auto close 12 detik
  setTimeout(() => popup.remove(), 12000);

  // slide bergantian
  let idx = 0;
  setInterval(() => {
    const slides = popup.querySelectorAll('.promo-slide');
    slides.forEach((s, i) => s.style.display = i === idx ? 'block' : 'none');
    idx = (idx + 1) % slides.length;
  }, 5000);
}
