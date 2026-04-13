(function() {
  'use strict';

  /* ========================================
     NAV SCROLL STATE
     ======================================== */
  var navWrapper = document.getElementById('navWrapper');
  function updateNav() {
    navWrapper.classList.toggle('scrolled', window.scrollY > 50);
  }
  window.addEventListener('scroll', updateNav, { passive: true });

  /* ========================================
     HERO PARALLAX + IDLE FLOAT
     ======================================== */
  var hero = document.getElementById('hero');
  var notifs = document.querySelectorAll('#notifLayer .notif');
  var mouseX = 0.5, mouseY = 0.5;
  var currentX = 0.5, currentY = 0.5;

  hero.addEventListener('mousemove', function(e) {
    var rect = hero.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / rect.width;
    mouseY = (e.clientY - rect.top) / rect.height;
  });

  /* ---- HERO NOTIFICATIONS: animate in on load ---- */
  notifs.forEach(function(n, i) {
    setTimeout(function() { n.classList.add('notif-in'); }, 400 + i * 120);
  });

  /* ---- HERO NOTIFICATIONS: out on scroll, back in on scroll up ---- */
  var heroNotifsVisible = true;
  function updateHeroNotifs() {
    var heroRect = hero.getBoundingClientRect();
    var heroVisible = heroRect.bottom > 100;
    if (heroVisible && !heroNotifsVisible) {
      heroNotifsVisible = true;
      notifs.forEach(function(n, i) {
        setTimeout(function() { n.classList.add('notif-in'); }, i * 80);
      });
    } else if (!heroVisible && heroNotifsVisible) {
      heroNotifsVisible = false;
      notifs.forEach(function(n) { n.classList.remove('notif-in'); });
    }
  }
  window.addEventListener('scroll', updateHeroNotifs, { passive: true });

  /* ---- FORM SECTION PARALLAX ---- */
  var formSectionEl = document.querySelector('.form-cta');
  var formNotifs = document.querySelectorAll('.form-notif');
  var fcx = 0.5, fcy = 0.5, ftx = 0.5, fty = 0.5;
  formSectionEl.addEventListener('mousemove', function(e) {
    var r = formSectionEl.getBoundingClientRect();
    ftx = (e.clientX - r.left) / r.width;
    fty = (e.clientY - r.top) / r.height;
  });
  formSectionEl.addEventListener('mouseleave', function() { ftx = 0.5; fty = 0.5; });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animateParallax(time) {
    currentX += (mouseX - currentX) * 0.05;
    currentY += (mouseY - currentY) * 0.05;

    var dx = currentX - 0.5;
    var dy = currentY - 0.5;

    for (var i = 0; i < notifs.length; i++) {
      var n = notifs[i];
      var depth = parseFloat(n.dataset.depth) || 0.03;
      var fy = parseFloat(n.dataset.floatY) || 0;
      var fx = parseFloat(n.dataset.floatX) || 0;
      var dur = parseFloat(n.dataset.floatDur) || 5;
      var phase = depth * 1000;
      var t = (time / 1000 + phase);
      var period = 2 * Math.PI / dur;

      var floatX = Math.sin(t * period) * fx;
      var floatY = Math.sin(t * period + 0.5) * fy;

      var px = dx * depth * 2400 + floatX;
      var py = dy * depth * 2400 + floatY;
      n.style.transform = 'translate(' + px.toFixed(2) + 'px, ' + py.toFixed(2) + 'px)';
    }

    /* Form section parallax */
    fcx = lerp(fcx, ftx, 0.04);
    fcy = lerp(fcy, fty, 0.04);
    var fdx = (fcx - 0.5), fdy = (fcy - 0.5);
    formNotifs.forEach(function(fn) {
      var d = parseFloat(fn.dataset.depth) || 0.025;
      fn.style.transform = 'translate(' + (fdx * d * 1500).toFixed(1) + 'px,' + (fdy * d * 1500).toFixed(1) + 'px)';
    });

    requestAnimationFrame(animateParallax);
  }
  requestAnimationFrame(animateParallax);

  /* ========================================
     SCROLL REVEAL (IntersectionObserver)
     ======================================== */
  var srElements = document.querySelectorAll('.sr, .sr-blur, .sr-scale');
  var srObserver = new IntersectionObserver(function(entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        entries[i].target.classList.add('visible');
        srObserver.unobserve(entries[i].target);
      }
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  for (var i = 0; i < srElements.length; i++) {
    srObserver.observe(srElements[i]);
  }

  /* ========================================
     PILLAR FEATURES — Stagger animation
     ======================================== */
  var pillarSection = document.getElementById('pillars');
  var pillarFeatureObserver = new IntersectionObserver(function(entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        var features = pillarSection.querySelectorAll('.pillar-feature');
        for (var k = 0; k < features.length; k++) {
          (function(feat, delay) {
            setTimeout(function() { feat.classList.add('show'); }, delay);
          })(features[k], k * 80);
        }
        pillarFeatureObserver.unobserve(pillarSection);
      }
    }
  }, { threshold: 0.15 });
  pillarFeatureObserver.observe(pillarSection);

  /* ========================================
     PILLAR DRAWER — HOVER (DESKTOP) / TAP (MOBILE)
     ======================================== */
  var pillarCols = document.querySelectorAll('.pillar-col');
  var isMobile = window.matchMedia('(max-width: 768px)');

  // Set trigger text based on device
  function updateTriggerText() {
    var triggers = document.querySelectorAll('.pillar-col__trigger-text');
    triggers.forEach(function(t) {
      var col = t.closest('.pillar-col');
      if (isMobile.matches) {
        t.textContent = col.classList.contains('drawer-open') ? 'Tap to close' : 'Tap for more';
      } else {
        t.textContent = 'Hover for more';
      }
    });
  }

  pillarCols.forEach(function(col) {
    // Desktop: hover — only open this one, close others
    col.addEventListener('mouseenter', function() {
      if (!isMobile.matches) {
        pillarCols.forEach(function(other) { if (other !== col) other.classList.remove('drawer-open'); });
        col.classList.add('drawer-open');
      }
    });
    col.addEventListener('mouseleave', function() {
      if (!isMobile.matches) col.classList.remove('drawer-open');
    });

    // Mobile: tap trigger
    var trigger = col.querySelector('.pillar-col__trigger');
    if (trigger) {
      trigger.addEventListener('click', function() {
        if (isMobile.matches) {
          col.classList.toggle('drawer-open');
          updateTriggerText();
        }
      });
    }
  });

  isMobile.addEventListener('change', updateTriggerText);
  updateTriggerText();

  /* ========================================
     PILLAR MOBILE TOGGLE
     ======================================== */
  var pillarMobileBtns = document.querySelectorAll('[data-pillar-mobile]');
  var pillarMobileIndicator = document.getElementById('pillarMobileIndicator');
  var pillarOrch = document.getElementById('pillar-orchestration');
  var pillarIntel = document.getElementById('pillar-intelligence');

  for (var pm = 0; pm < pillarMobileBtns.length; pm++) {
    pillarMobileBtns[pm].addEventListener('click', function() {
      var name = this.dataset.pillarMobile;
      for (var i = 0; i < pillarMobileBtns.length; i++) {
        pillarMobileBtns[i].classList.toggle('active', pillarMobileBtns[i].dataset.pillarMobile === name);
      }
      if (pillarMobileIndicator) {
        pillarMobileIndicator.classList.toggle('right', name === 'intelligence');
      }
      pillarOrch.classList.toggle('mobile-active', name === 'orchestration');
      pillarIntel.classList.toggle('mobile-active', name === 'intelligence');
      // Close drawers on switch
      pillarOrch.classList.remove('drawer-open');
      pillarIntel.classList.remove('drawer-open');
      updateTriggerText();
    });
  }

  /* ========================================
     USE CASE TABS
     ======================================== */
  var tabBtns = document.querySelectorAll('.tab-btn');
  var tabPanels = {
    label: document.getElementById('tab-label'),
    artist: document.getElementById('tab-artist'),
    marketing: document.getElementById('tab-marketing'),
    ar: document.getElementById('tab-ar')
  };

  for (var t = 0; t < tabBtns.length; t++) {
    tabBtns[t].addEventListener('click', function() {
      var tabName = this.dataset.tab;
      for (var i = 0; i < tabBtns.length; i++) {
        tabBtns[i].classList.remove('active');
      }
      this.classList.add('active');
      var tKeys = ['label', 'artist', 'marketing', 'ar'];
      for (var j = 0; j < tKeys.length; j++) {
        tabPanels[tKeys[j]].classList.toggle('active', tKeys[j] === tabName);
      }
    });
  }

  /* ========================================
     FLOATING CTA — VISIBLE FROM TOP, COLOUR SWITCH
     ======================================== */
  var floatingCta = document.getElementById('floatingCta');
  var floatingBar = document.getElementById('floatingBar');
  var darkSections = document.querySelectorAll('.chaos-hero, .form-cta, .footer');
  var formSection = document.getElementById('form');

  function updateFloating() {
    if (!floatingCta) return;
    var ctaRect = floatingCta.getBoundingClientRect();
    var ctaCenter = ctaRect.top + ctaRect.height / 2;

    // Hide over form section
    var formTop = formSection ? formSection.getBoundingClientRect().top : 99999;
    var hideOverForm = formTop < window.innerHeight * 0.6;
    floatingCta.style.opacity = hideOverForm ? '0' : '1';
    floatingCta.style.pointerEvents = hideOverForm ? 'none' : 'auto';
    if (floatingBar) {
      floatingBar.style.transform = hideOverForm ? 'translateY(100%)' : 'translateY(0)';
      floatingBar.style.opacity = hideOverForm ? '0' : '1';
      floatingBar.style.pointerEvents = hideOverForm ? 'none' : 'auto';
    }

    // Check if overlapping a dark section
    var onDark = false;
    darkSections.forEach(function(sec) {
      var r = sec.getBoundingClientRect();
      if (ctaCenter >= r.top && ctaCenter <= r.bottom) onDark = true;
    });
    floatingCta.classList.toggle('on-dark', onDark);
    if (floatingBar) floatingBar.classList.toggle('on-dark', onDark);
  }
  window.addEventListener('scroll', updateFloating, { passive: true });
  updateFloating();

  /* ========================================
     HUBSPOT FORM SUBMISSION
     ======================================== */
  var HS_PORTAL = '244049776';
  var HS_FORM = 'b9f79294-23dc-453c-a339-136bf31d99e7';
  var HS_URL = 'https://api.hsforms.com/submissions/v3/integration/submit/' + HS_PORTAL + '/' + HS_FORM;

  function submitToHubSpot(firstName, lastName, email) {
    var data = {
      fields: [
        { name: 'firstname', value: firstName },
        { name: 'lastname', value: lastName },
        { name: 'email', value: email }
      ],
      context: {
        pageUri: window.location.href,
        pageName: document.title
      }
    };
    // Get HubSpot tracking cookie if available
    var hutk = document.cookie.replace(/(?:(?:^|.*;\s*)hubspotutk\s*=\s*([^;]*).*$)|^.*$/, '$1');
    if (hutk) data.context.hutk = hutk;

    fetch(HS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  var CALENDLY_BASE = 'https://calendly.com/teamrollouts-demo/team-demo-onboarding-clone-2?hide_event_type_details=1&hide_gdpr_banner=1&primary_color=5679b5&background_color=ffffff&text_color=191919';

  function redirectToCalendly(firstName, lastName, email) {
    var url = CALENDLY_BASE
      + '&name=' + encodeURIComponent(firstName + ' ' + lastName)
      + '&email=' + encodeURIComponent(email);
    setTimeout(function() { window.location.href = url; }, 2500);
  }

  /* ========================================
     FORM SUBMIT — SUCCESS STATE
     ======================================== */
  var demoForm = document.getElementById('demoForm');
  var formSuccess = document.getElementById('formSuccess');
  var formCard = document.getElementById('formCard');

  demoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var inputs = demoForm.querySelectorAll('input');
    var fn = inputs[0].value, ln = inputs[1].value, em = inputs[2].value;
    submitToHubSpot(fn, ln, em);
    if (typeof fbq === 'function') fbq('track', 'Lead');
    demoForm.style.display = 'none';
    formCard.querySelector('.form-card__label').style.display = 'none';
    formCard.querySelector('.form-card__footer').style.display = 'none';
    formSuccess.classList.add('show');
    redirectToCalendly(fn, ln, em);
  });

  /* ========================================
     FORM POPUP
     ======================================== */
  var formPopup = document.getElementById('formPopup');
  var formPopupClose = document.getElementById('formPopupClose');
  var popupForm = document.getElementById('popupForm');

  function openFormPopup() {
    formPopup.classList.add('open');
    // Hide floating CTA/bar when popup is open
    if (floatingCta) { floatingCta.style.opacity = '0'; floatingCta.style.pointerEvents = 'none'; }
    if (floatingBar) { floatingBar.style.transform = 'translateY(100%)'; floatingBar.style.opacity = '0'; floatingBar.style.pointerEvents = 'none'; }
  }
  function closeFormPopup() {
    formPopup.classList.remove('open');
    updateFloating();
  }

  // Floating CTA click opens popup instead of navigating
  floatingCta.querySelector('a').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    openFormPopup();
  });
  if (floatingBar) {
    floatingBar.querySelector('a').addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      openFormPopup();
    });
  }

  formPopupClose.addEventListener('click', closeFormPopup);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && formPopup.classList.contains('open')) closeFormPopup();
  });

  popupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var inputs = popupForm.querySelectorAll('input');
    var fn = inputs[0].value, ln = inputs[1].value, em = inputs[2].value;
    submitToHubSpot(fn, ln, em);
    if (typeof fbq === 'function') fbq('track', 'Lead');
    popupForm.parentElement.innerHTML = '<div style="text-align:center;padding:24px 0;"><div style="font-size:16px;font-weight:700;color:#1d1d1f;margin-bottom:4px;">Thanks!</div><div style="font-size:13px;color:#86868b;">Now let\'s schedule your demo...</div></div>';
    redirectToCalendly(fn, ln, em);
  });

  /* ========================================
     VIDEO MODAL
     ======================================== */
  var playTrigger = document.getElementById('playTrigger');
  var videoModal = document.getElementById('videoModal');
  var modalVideo = document.getElementById('modalVideo');
  var videoModalClose = document.getElementById('videoModalClose');
  var videoModalBg = document.getElementById('videoModalBg');

  var soundHint = document.getElementById('soundHint');
  var soundTimer;

  function openModal() {
    videoModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    modalVideo.play();
    setTimeout(function(){ soundHint.classList.add('show'); }, 600);
    soundTimer = setTimeout(function(){ soundHint.classList.remove('show'); }, 4500);
  }
  function closeModal() {
    videoModal.classList.remove('open');
    document.body.style.overflow = '';
    modalVideo.pause();
    modalVideo.currentTime = 0;
    soundHint.classList.remove('show');
    clearTimeout(soundTimer);
  }

  playTrigger.addEventListener('click', openModal);
  videoModalClose.addEventListener('click', closeModal);
  videoModalBg.addEventListener('click', closeModal);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && videoModal.classList.contains('open')) closeModal();
  });

  /* ========================================
     HERO INLINE FORM (desktop only)
     ======================================== */
  var heroBookBtn = document.getElementById('heroBookBtn');
  var heroInlineForm = document.getElementById('heroInlineForm');
  var heroInlineClose = document.getElementById('heroInlineClose');
  var heroInlineFormEl = document.getElementById('heroInlineFormEl');

  if (heroBookBtn && heroInlineForm) {
    var heroActions = heroBookBtn.parentElement;

    function openHeroForm() {
      heroActions.classList.add('form-mode');
      heroInlineForm.classList.add('open');
      setTimeout(function() {
        var inp = heroInlineForm.querySelector('input');
        if (inp) inp.focus();
      }, 400);
    }
    function closeHeroForm() {
      heroInlineForm.classList.remove('open');
      setTimeout(function() {
        heroActions.classList.remove('form-mode');
      }, 250);
    }

    heroBookBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (window.innerWidth <= 768) {
        openFormPopup();
      } else {
        openHeroForm();
      }
    });
    heroInlineClose.addEventListener('click', closeHeroForm);
    heroInlineFormEl.addEventListener('submit', function(e) {
      e.preventDefault();
      var inputs = heroInlineFormEl.querySelectorAll('input');
      var fn = inputs[0].value, ln = inputs[1].value, em = inputs[2].value;
      submitToHubSpot(fn, ln, em);
      if (typeof fbq === 'function') fbq('track', 'Lead');
      heroInlineForm.innerHTML = '<div style="text-align:center;padding:8px 0;color:rgba(255,255,255,0.7);font-size:14px;font-weight:600;">Thanks! Now let\'s schedule your demo...</div>';
      redirectToCalendly(fn, ln, em);
    });
  }

  /* ========================================
     VALUE PROP — WORD-BY-WORD SCROLL REVEAL
     ======================================== */
  var vpEl = document.getElementById('vpText');
  if (vpEl) {
    var vpRaw = vpEl.dataset.vpText;
    var parts = vpRaw.split('|');
    var html = '';
    parts.forEach(function(part, pi) {
      var words = part.split(' ');
      words.forEach(function(w, wi) {
        var cls = pi > 0 ? 'vp-word vp-orange' : 'vp-word';
        html += '<span class="' + cls + '">' + w + '</span> ';
      });
    });
    vpEl.innerHTML = html.trim();

    var vpWords = vpEl.querySelectorAll('.vp-word');
    function updateVpWords() {
      var rect = vpEl.getBoundingClientRect();
      var vh = window.innerHeight;
      // Progress 0 to 1 as element scrolls from bottom of viewport to centre
      var progress = Math.max(0, Math.min(1, 1 - (rect.top - vh * 0.3) / (vh * 0.5)));
      var wordsToLight = Math.floor(progress * vpWords.length);
      vpWords.forEach(function(w, i) {
        w.classList.toggle('lit', i < wordsToLight);
      });
    }
    window.addEventListener('scroll', updateVpWords, { passive: true });
    updateVpWords();
  }

  /* ========================================
     PRODUCT FRAME — SCROLL-DRIVEN EXPAND
     ======================================== */
  var productInner = document.querySelector('.product-preview-inner');
  var productFrame = productInner ? productInner.querySelector('.product-frame') : null;
  var productSection = document.querySelector('.product-preview');

  if (productInner && productFrame && productSection) {
    var maxRadius = 16;
    var startScale = 0.92; // scale when far from centre
    var expandTicking = false;

    function updateProductExpand() {
      var vh = window.innerHeight;
      var frameRect = productFrame.getBoundingClientRect();
      var frameCenter = frameRect.top + frameRect.height / 2;
      var vpCenter = vh / 2;

      // Progress with a dead zone — stays at 1.0 when near centre
      var dist = Math.abs(frameCenter - vpCenter);
      var deadZone = vh * 0.12;
      var range = vh * 0.5;
      var adjustedDist = Math.max(0, dist - deadZone);
      var adjustedRange = range - deadZone;
      var progress = Math.max(0, Math.min(1, 1 - (adjustedDist / adjustedRange)));

      // Ease the progress for smoother feel
      var t = progress * progress;

      // GPU-composited transform instead of layout-triggering width/padding
      var scale = startScale + (1 - startScale) * t;
      var radius = maxRadius * (1 - t);

      productInner.style.transform = 'scale(' + scale + ')';
      productInner.style.willChange = 'transform';
      productFrame.style.borderRadius = radius.toFixed(2) + 'px';
      productFrame.style.borderColor = t > 0.8 ? 'transparent' : '';
      productFrame.style.boxShadow = t > 0.5 ? 'none' : '';
    }

    function onExpandScroll() {
      if (!expandTicking) {
        requestAnimationFrame(function() {
          updateProductExpand();
          expandTicking = false;
        });
        expandTicking = true;
      }
    }

    window.addEventListener('scroll', onExpandScroll, { passive: true });
    window.addEventListener('resize', onExpandScroll, { passive: true });
    updateProductExpand();
  }

  /* ========================================
     SMOOTH ANCHOR SCROLLING
     ======================================== */
  var anchors = document.querySelectorAll('a[href^="#"]');
  for (var a = 0; a < anchors.length; a++) {
    anchors[a].addEventListener('click', function(e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var offset = 40;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  }

})();