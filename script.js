/* ============================================
   BEAR&BLADE Barbers — script.js
   Vanilla JS: smooth scroll, header, mobile
   menu overlay, lightbox, scroll reveal
   ============================================ */

(function () {
  'use strict';

  /* ---- Cache DOM ---- */
  var header        = document.getElementById('site-header');
  var hamburger     = document.getElementById('hamburger');
  var overlay       = document.getElementById('mobile-overlay');
  var mobileLinks   = document.querySelectorAll('.mobile-nav-link');
  var lightbox      = document.getElementById('lightbox');
  var lbImg         = lightbox.querySelector('.lightbox-img');
  var lbClose       = lightbox.querySelector('.lightbox-close');
  var lbPrev        = lightbox.querySelector('.lightbox-prev');
  var lbNext        = lightbox.querySelector('.lightbox-next');
  var lbCounter     = lightbox.querySelector('.lightbox-counter');
  var galleryItems  = document.querySelectorAll('.gallery-item');

  /* ============================================
     HEADER — style shift on scroll
     ============================================ */
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 80);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============================================
     SMOOTH SCROLL — custom easing for buttery feel
     ============================================ */
  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function smoothScrollTo(targetY, duration) {
    duration = duration || 900;
    var startY = window.scrollY;
    var diff   = targetY - startY;
    var start  = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var elapsed  = timestamp - start;
      var progress = Math.min(elapsed / duration, 1);
      var ease     = easeInOutCubic(progress);
      window.scrollTo(0, startY + diff * ease);
      if (elapsed < duration) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var offset = target.getBoundingClientRect().top + window.scrollY - 72;
      smoothScrollTo(offset, 900);
      closeMobile();
    });
  });

  /* ============================================
     MOBILE MENU — full-screen overlay
     ============================================ */
  function openMobile() {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  }

  function closeMobile() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    overlay.classList.contains('open') ? closeMobile() : openMobile();
  });

  /* Close when clicking a mobile nav link */
  mobileLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMobile();
    });
  });

  /* Close on Escape key */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeMobile();
    }
  });

  /* ============================================
     LIGHTBOX
     ============================================ */
  var currentIndex = 0;
  var images = [];

  /* Build the images array from gallery items */
  galleryItems.forEach(function (item, idx) {
    var img = item.querySelector('img');
    images.push({ src: img.src, alt: img.alt });

    /* Click to open */
    item.addEventListener('click', function () {
      openLightbox(idx);
    });

    /* Keyboard accessibility */
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(idx);
      }
    });
  });

  function openLightbox(index) {
    currentIndex = index;
    showImage();
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function showImage() {
    var data = images[currentIndex];
    lbImg.src = data.src;
    lbImg.alt = data.alt;
    lbCounter.textContent = (currentIndex + 1) + ' / ' + images.length;
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    showImage();
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage();
  }

  lbClose.addEventListener('click', closeLightbox);
  lbNext.addEventListener('click', nextImage);
  lbPrev.addEventListener('click', prevImage);

  /* Close on backdrop / wrapper click */
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target.classList.contains('lightbox-img-wrap')) {
      closeLightbox();
    }
  });

  /* Keyboard: Escape, ArrowLeft, ArrowRight */
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft')  prevImage();
  });

  /* Touch swipe support */
  var touchStartX = 0;
  lightbox.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', function (e) {
    var diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextImage() : prevImage();
    }
  }, { passive: true });

  /* ============================================
     SCROLL REVEAL — IntersectionObserver
     ============================================ */
  var reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(function (el) { io.observe(el); });
  } else {
    /* Fallback — show everything */
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

})();
