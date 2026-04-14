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
     STAT BRIDGE — SCROLL-DRIVEN 6 → 1 COUNTER
     ======================================== */
  var statSection = document.getElementById('statBridge');
  var statNumber = document.getElementById('statNumber');
  var statText = document.getElementById('statText');

  if (statSection && statNumber && statText) {
    var counting = false;
    var currentNum = 6;

    function runCountdown() {
      if (!counting) return;
      if (currentNum <= 1) {
        statNumber.textContent = '1';
        statNumber.classList.add('at-one');
        statText.innerHTML = 'Centralize your release<br><span class="nyght" style="font-weight:300;">with Team.</span>';
        counting = false;
        return;
      }
      currentNum--;
      statNumber.textContent = currentNum;
      setTimeout(runCountdown, 100);
    }

    function resetToSix() {
      counting = false;
      currentNum = 6;
      statNumber.textContent = '6';
      statNumber.classList.remove('at-one');
      statText.innerHTML = 'tools the average release team<br>juggles every day';
    }

    var statObserver = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        if (currentNum === 6 && !counting) {
          counting = true;
          setTimeout(runCountdown, 500);
        }
      } else {
        resetToSix();
      }
    }, { threshold: 0.5 });
    statObserver.observe(statSection);
  }

  /* ========================================
     PARTICLE NETWORK — Interactive neuron canvas
     ======================================== */
  (function() {
    var container = document.getElementById('particleCanvas');
    if (!container) return;

    var canvas = document.createElement('canvas');
    container.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var particles = [];
    var pulses = [];
    var mouseX = -9999, mouseY = -9999;
    var mouseRadius = 150;
    var PARTICLE_COUNT = 120;
    var CONNECTION_DIST = 110;
    var MAX_PULSES = 15;
    var running = false;
    var dpr = window.devicePixelRatio || 1;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      canvas.width = container.offsetWidth * dpr;
      canvas.height = container.offsetHeight * dpr;
      canvas.style.width = container.offsetWidth + 'px';
      canvas.style.height = container.offsetHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initParticles() {
      particles = [];
      pulses = [];
      var w = container.offsetWidth;
      var h = container.offsetHeight;
      for (var i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.5 + 1
        });
      }
    }

    // Spawn a pulse that travels between two connected particles
    function spawnPulse() {
      if (pulses.length >= MAX_PULSES || particles.length < 2) return;
      var a = Math.floor(Math.random() * particles.length);
      // Find a nearby connected particle
      for (var tries = 0; tries < 10; tries++) {
        var b = Math.floor(Math.random() * particles.length);
        if (b === a) continue;
        var dx = particles[a].x - particles[b].x;
        var dy = particles[a].y - particles[b].y;
        if (Math.sqrt(dx * dx + dy * dy) < CONNECTION_DIST) {
          pulses.push({ from: a, to: b, t: 0, speed: 0.015 + Math.random() * 0.015 });
          return;
        }
      }
    }

    function draw() {
      if (!running) return;
      var w = container.offsetWidth;
      var h = container.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // Randomly spawn pulses
      if (Math.random() < 0.08) spawnPulse();

      // Update positions
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > w) { p.x = w; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > h) { p.y = h; p.vy *= -1; }

        // Mouse repulsion
        var dx = p.x - mouseX;
        var dy = p.y - mouseY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseRadius && dist > 0) {
          var force = (mouseRadius - dist) / mouseRadius * 3;
          p.vx += (dx / dist) * force * 0.4;
          p.vy += (dy / dist) * force * 0.4;
        }

        // Dampen velocity
        p.vx *= 0.98;
        p.vy *= 0.98;
      }

      // Draw connections
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            var alpha = (1 - dist / CONNECTION_DIST) * 0.2;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(245, 96, 2, ' + alpha + ')';
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw particles (nodes)
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        // Outer glow
        var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r + 4);
        grad.addColorStop(0, 'rgba(245, 96, 2, 0.5)');
        grad.addColorStop(1, 'rgba(245, 96, 2, 0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 96, 2, 0.6)';
        ctx.fill();
      }

      // Draw travelling pulses
      for (var i = pulses.length - 1; i >= 0; i--) {
        var pulse = pulses[i];
        pulse.t += pulse.speed;
        if (pulse.t >= 1) { pulses.splice(i, 1); continue; }
        var pA = particles[pulse.from];
        var pB = particles[pulse.to];
        var px = pA.x + (pB.x - pA.x) * pulse.t;
        var py = pA.y + (pB.y - pA.y) * pulse.t;
        var pulseAlpha = Math.sin(pulse.t * Math.PI); // fade in and out
        var pulseGrad = ctx.createRadialGradient(px, py, 0, px, py, 6);
        pulseGrad.addColorStop(0, 'rgba(245, 96, 2, ' + (0.9 * pulseAlpha) + ')');
        pulseGrad.addColorStop(1, 'rgba(245, 96, 2, 0)');
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = pulseGrad;
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }

    // Track mouse within the section (allow pointer events on section, not canvas)
    var statBridgeEl = document.querySelector('.stat-bridge');
    if (statBridgeEl) {
      statBridgeEl.addEventListener('mousemove', function(e) {
        var rect = container.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
      });
      statBridgeEl.addEventListener('mouseleave', function() {
        mouseX = -9999;
        mouseY = -9999;
      });
    }

    // Start/stop when section is visible
    var particleObserver = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        if (!running) {
          running = true;
          resize();
          if (particles.length === 0) initParticles();
          draw();
        }
      } else {
        running = false;
      }
    }, { threshold: 0.05 });

    particleObserver.observe(container);
    window.addEventListener('resize', function() {
      resize();
      initParticles();
    });
  })();

  /* ========================================
     FLOW LINES — Dynamic SVG from tool icons to destination
     ======================================== */
  var flowSvg = document.getElementById('flowSvg');
  var flowContainer = document.getElementById('flowLines');
  var toolNodesEl = document.getElementById('toolNodes');
  var teamDest = document.querySelector('.team-destination__frame');

  function drawFlowLines() {
    if (!flowSvg || !flowContainer || !toolNodesEl || !teamDest) return;
    var containerRect = flowContainer.getBoundingClientRect();
    var destRect = teamDest.getBoundingClientRect();
    var destX = destRect.left + destRect.width / 2 - containerRect.left;
    var destY = containerRect.height;
    var icons = toolNodesEl.querySelectorAll('.tool-node__icon');
    var ns = 'http://www.w3.org/2000/svg';

    flowSvg.innerHTML = '';

    var defs = document.createElementNS(ns, 'defs');
    flowSvg.appendChild(defs);

    icons.forEach(function(icon, i) {
      var iconRect = icon.getBoundingClientRect();
      var startX = iconRect.left + iconRect.width / 2 - containerRect.left;
      var startY = 0;
      var cpY = containerRect.height * 0.5;

      var pathId = 'dynfl' + i;
      var path = document.createElementNS(ns, 'path');
      path.setAttribute('d', 'M' + startX + ',' + startY + ' C' + startX + ',' + cpY + ' ' + destX + ',' + cpY + ' ' + destX + ',' + destY);
      path.setAttribute('class', 'flow-line');
      path.setAttribute('id', pathId);
      flowSvg.appendChild(path);

      var orb = document.createElementNS(ns, 'circle');
      orb.setAttribute('r', '4');
      orb.setAttribute('class', 'flow-orb');
      // Varied durations only — no begin delay, so orbs are never at 0,0
      var dur = (2.0 + i * 0.4 + Math.random() * 0.5).toFixed(1);
      var anim = document.createElementNS(ns, 'animateMotion');
      anim.setAttribute('dur', dur + 's');
      anim.setAttribute('repeatCount', 'indefinite');
      anim.setAttribute('keyPoints', '0;1');
      anim.setAttribute('keyTimes', '0;1');
      anim.setAttribute('calcMode', 'spline');
      anim.setAttribute('keySplines', '0.4 0 0.2 1');
      var mpath = document.createElementNS(ns, 'mpath');
      mpath.setAttribute('href', '#' + pathId);
      anim.appendChild(mpath);
      orb.appendChild(anim);
      flowSvg.appendChild(orb);
    });
  }

  // Delay drawing until layout is settled, then fade in after orb begin delays have kicked in
  setTimeout(function() {
    drawFlowLines();
    // Wait a bit more so all animateMotion begin delays have started
    setTimeout(function() {
      if (flowSvg) flowSvg.style.opacity = '1';
    }, 500);
  }, 800);
  window.addEventListener('resize', drawFlowLines);

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
  var HS_URL = 'https://api-na2.hsforms.com/submissions/v3/integration/submit/' + HS_PORTAL + '/' + HS_FORM;

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
    var hutk = document.cookie.replace(/(?:(?:^|.*;\s*)hubspotutk\s*=\s*([^;]*).*$)|^.*$/, '$1');
    if (hutk) data.context.hutk = hutk;

    try {
      fetch(HS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch(e) {}
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
  } else if (heroBookBtn) {
    // Connected-tools hero: no inline form, open popup instead
    heroBookBtn.addEventListener('click', function(e) {
      e.preventDefault();
      openFormPopup();
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
    var maxPad = 32; // matches default side padding
    var maxW = 1120; // --max-w

    function updateProductExpand() {
      var rect = productSection.getBoundingClientRect();
      var vh = window.innerHeight;
      var frameRect = productFrame.getBoundingClientRect();
      var frameCenter = frameRect.top + frameRect.height / 2;
      var vpCenter = vh / 2;

      // Progress with a dead zone — stays at 1.0 when near centre
      var dist = Math.abs(frameCenter - vpCenter);
      var deadZone = vh * 0.12; // stays fully expanded within this range
      var range = vh * 0.5;
      var adjustedDist = Math.max(0, dist - deadZone);
      var adjustedRange = range - deadZone;
      var progress = Math.max(0, Math.min(1, 1 - (adjustedDist / adjustedRange)));

      // Ease the progress for smoother feel
      var t = progress * progress;

      // Interpolate values
      var radius = maxRadius * (1 - t);
      var pad = maxPad * (1 - t);
      var width = maxW + (window.innerWidth - maxW) * t;

      productInner.style.maxWidth = Math.round(width) + 'px';
      productInner.style.padding = '0 ' + Math.round(pad) + 'px';
      productFrame.style.borderRadius = radius.toFixed(1) + 'px';
      productFrame.style.borderColor = t > 0.8 ? 'transparent' : '';
      productFrame.style.boxShadow = t > 0.5 ? 'none' : '';
    }
    window.addEventListener('scroll', updateProductExpand, { passive: true });
    window.addEventListener('resize', updateProductExpand, { passive: true });
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
