/* God Of Barber — comportamento do site. Sem dependências. */
(function () {
  "use strict";
  var doc = document;
  var cfg = window.GOB_CONFIG || {};

  /* 1. Botões de contato: WhatsApp quando houver número configurado */
  var number = String(cfg.whatsapp || "").replace(/\D/g, "");
  if (number.length >= 12) {
    doc.querySelectorAll("[data-cta]").forEach(function (el) {
      var text = el.getAttribute("data-wa-text") || "Olá!";
      el.setAttribute("href", "https://wa.me/" + number + "?text=" + encodeURIComponent(text));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
      var label = el.getAttribute("data-label-wa");
      var span = el.querySelector("span");
      if (label && span) span.textContent = label;
    });
    doc.querySelectorAll("[data-whatsapp-item]").forEach(function (li) { li.hidden = false; });
  }

  /* 2. Menu no celular */
  var toggle = doc.querySelector(".menu-toggle");
  var nav = doc.getElementById("menu");
  function setMenu(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width:900px)").addEventListener("change", function (m) {
      if (m.matches) setMenu(false);
    });
  }

  /* 3. Sombra no cabeçalho ao rolar */
  var header = doc.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 80);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* 4. Destaque do item de menu da seção visível */
  var links = Array.prototype.slice.call(doc.querySelectorAll('.main-nav ul a[href^="#"]'));
  if ("IntersectionObserver" in window && links.length) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = map[en.target.id];
        if (!a) return;
        if (en.isIntersecting) {
          links.forEach(function (l) { l.removeAttribute("aria-current"); });
          a.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(map).forEach(function (id) {
      var s = doc.getElementById(id);
      if (s) io.observe(s);
    });
  }

  /* 5. Movimento reduzido: pausa a animação do formato da foto */
  var blob = doc.querySelector(".hero-photo .blob");
  if (blob && blob.pauseAnimations && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    blob.pauseAnimations();
  }

  /* 6. Slideshow da foto do hero: troca a cada 5 s, pausa ao passar o mouse/focar */
  var photo = doc.querySelector(".hero-photo");
  if (photo) {
    var slides = Array.prototype.slice.call(photo.querySelectorAll(".slide"));
    var dots = Array.prototype.slice.call(photo.querySelectorAll(".dot"));
    var DELAY = 5000, cur = 0, timer = null, flash = null;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var show = function (n) {
      cur = n;
      slides.forEach(function (s, k) { s.classList.toggle("is-active", k === n); });
      dots.forEach(function (d, k) {
        d.classList.remove("is-active");
        d.setAttribute("aria-current", k === n ? "true" : "false");
      });
      void photo.offsetWidth; /* reinicia a barra de progresso */
      dots[n].classList.add("is-active");
      photo.classList.add("is-changing");
      clearTimeout(flash);
      flash = setTimeout(function () { photo.classList.remove("is-changing"); }, 900);
    };
    var stop = function () { clearInterval(timer); timer = null; };
    var play = function () {
      if (reduced || timer || slides.length < 2) return;
      timer = setInterval(function () { show((cur + 1) % slides.length); }, DELAY);
    };
    var pause = function () { stop(); photo.classList.add("is-paused"); };
    var resume = function () { photo.classList.remove("is-paused"); show(cur); play(); };
    dots.forEach(function (d, k) {
      d.addEventListener("click", function () { stop(); show(k); if (!photo.classList.contains("is-paused")) play(); });
    });
    /* só o mouse e o teclado pausam (um toque no celular não deve travar a troca) */
    photo.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") pause(); });
    photo.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") resume(); });
    photo.addEventListener("focusin", function (e) { if (e.target.matches(":focus-visible")) pause(); });
    photo.addEventListener("focusout", resume);
    doc.addEventListener("visibilitychange", function () { if (doc.hidden) pause(); else resume(); });
    if (reduced) { photo.classList.add("is-paused"); } else { play(); }
  }

  /* 7. Animações de entrada: cada bloco anima quando aparece na tela */
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* títulos: separa em palavras para cada uma subir de dentro de uma máscara */
  if (!calm) {
    doc.querySelectorAll(".split-title").forEach(function (h) {
      var text = h.textContent.replace(/\s+/g, " ").trim();
      h.setAttribute("aria-label", text);
      h.textContent = "";
      text.split(" ").forEach(function (word, i, all) {
        var w = doc.createElement("span"), inner = doc.createElement("span");
        w.className = "sw"; w.setAttribute("aria-hidden", "true"); w.style.setProperty("--w", i);
        inner.textContent = word; w.appendChild(inner); h.appendChild(w);
        if (i < all.length - 1) h.appendChild(doc.createTextNode(" "));
      });
    });
  }
  /* números que contam até o valor final */
  var counters = Array.prototype.slice.call(doc.querySelectorAll("[data-count]"));
  if (!calm) counters.forEach(function (el) { el.textContent = (0).toFixed(parseInt(el.getAttribute("data-decimals") || "0", 10)).replace(".", ","); });
  function countUp(root) {
    if (calm) return;
    Array.prototype.forEach.call(root.querySelectorAll("[data-count]"), function (el, idx) {
      var to = parseFloat(el.getAttribute("data-count")), dec = parseInt(el.getAttribute("data-decimals") || "0", 10), t0 = null, dur = 1300;
      function frame(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = (to * e).toFixed(dec).replace(".", ",");
        if (p < 1) window.requestAnimationFrame(frame);
      }
      window.setTimeout(function () { window.requestAnimationFrame(frame); }, 300 + idx * 130);
    });
  }
  var reveals = Array.prototype.slice.call(doc.querySelectorAll("[data-reveal]"));
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reveals.length) {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      reveals.forEach(function (el) { el.classList.add("is-in"); });
      counters.forEach(function (el) {
        var d = parseInt(el.getAttribute("data-decimals") || "0", 10);
        el.textContent = parseFloat(el.getAttribute("data-count")).toFixed(d).replace(".", ",");
      });
    } else {
      var rio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("is-in"); countUp(en.target); rio.unobserve(en.target); }
        });
      }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
      reveals.forEach(function (el) { rio.observe(el); });
    }
  }

  /* 9. Efeito: ao rolar, a logo do hero é "sugada" para dentro da barra do menu.
        A logo grande vira uma cópia fixa (por cima da barra), que encolhe, estica,
        some em desfoque e dá lugar à logo do menu com um brilho. Tudo acompanha a rolagem. */
  (function () {
    var heroBrand = doc.querySelector(".hero-brand");
    var heroImg = heroBrand && heroBrand.querySelector("img");
    var bar = doc.querySelector(".header-inner");
    var brand = bar && bar.querySelector(".brand");
    var brandImg = brand && brand.querySelector("img");
    if (!heroImg || !brand || !brandImg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var fly = doc.createElement("div");
    fly.className = "fly-logo";
    fly.setAttribute("aria-hidden", "true");
    var flyImg = heroImg.cloneNode(false);
    flyImg.alt = "";
    fly.appendChild(flyImg);
    doc.body.appendChild(fly);
    doc.documentElement.classList.add("fly-on");

    var D = 240, w = 160, h = 213, kEnd = 0.22, ticking = false;
    function ss(a, b, x) {
      var t = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return t * t * (3 - 2 * t);
    }
    function scrollY() { return Math.max(0, window.pageYOffset || doc.documentElement.scrollTop || 0); }
    function measure() {
      w = heroImg.offsetWidth || w;
      h = heroImg.offsetHeight || h;
      fly.style.width = w + "px";
      fly.style.height = h + "px";
      kEnd = (brandImg.offsetHeight || 48) / h;
      var hb = heroBrand.getBoundingClientRect();
      var br = bar.getBoundingClientRect();
      var natural = hb.top + scrollY() + hb.height / 2;
      var target = br.top + scrollY() + br.height / 2;
      D = Math.max(200, (natural - target) * 1.5);
    }
    function update() {
      ticking = false;
      var p = Math.min(1, scrollY() / D);
      var e = p * p * (3 - 2 * p);
      var hb = heroBrand.getBoundingClientRect();
      var br = bar.getBoundingClientRect();
      var nx = hb.left + hb.width / 2, ny = hb.top + hb.height / 2;
      var tx = br.left + br.width / 2, ty = br.top + br.height / 2;
      var cx = nx + (tx - nx) * e, cy = ny + (ty - ny) * e;
      var base = 1 + (kEnd - 1) * e;
      var sx = base * (1 - 0.24 * e), sy = base * (1 + 0.1 * e);
      var fade = ss(0.5, 0.97, p);
      var pull = ss(0.35, 1, p);
      var opened = nav && nav.classList.contains("open");
      fly.style.transform = "translate3d(" + (cx - w / 2).toFixed(2) + "px," + (cy - h / 2).toFixed(2) + "px,0) scale(" + sx.toFixed(4) + "," + sy.toFixed(4) + ")";
      fly.style.opacity = (1 - fade).toFixed(3);
      fly.style.filter = pull > 0.01 ? "blur(" + (pull * 3.5).toFixed(2) + "px) brightness(" + (1 + pull * 0.6).toFixed(3) + ")" : "none";
      fly.style.visibility = (opened || fade >= 0.995) ? "hidden" : "visible";

      var show = ss(0.52, 0.94, p);
      var flash = Math.sin(Math.PI * Math.min(1, Math.max(0, (p - 0.62) / 0.38)));
      brand.style.opacity = show.toFixed(3);
      brand.style.pointerEvents = show > 0.6 ? "auto" : "none";
      brand.style.setProperty("--bs", (0.55 + 0.45 * ss(0.45, 1, p)).toFixed(3));
      bar.style.setProperty("--flash", (flash * flash).toFixed(3));
    }
    function request() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", function () { measure(); request(); });
    window.addEventListener("load", function () { measure(); request(); });
    if (nav && "MutationObserver" in window) {
      new MutationObserver(request).observe(nav, { attributes: true, attributeFilter: ["class"] });
    }
    measure();
    update();
  })();

  /* 10. Depoimentos: botões anterior/próximo e contador do carrossel */
  (function () {
    var track = doc.querySelector(".review-track");
    var prev = doc.querySelector(".review-prev");
    var next = doc.querySelector(".review-next");
    var count = doc.querySelector(".review-count");
    if (!track || !prev || !next) return;
    var cards = track.children;
    var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function step() {
      var gap = parseFloat(window.getComputedStyle(track).columnGap) || 16;
      return cards[0].getBoundingClientRect().width + gap;
    }
    function update() {
      var i = Math.round(track.scrollLeft / step());
      var end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      if (end) i = cards.length - 1;
      if (count) count.textContent = (i + 1) + " / " + cards.length;
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = end;
    }
    function go(dir) {
      track.scrollBy({ left: dir * step(), behavior: calm ? "auto" : "smooth" });
    }
    prev.addEventListener("click", function () { go(-1); });
    next.addEventListener("click", function () { go(1); });
    track.addEventListener("scroll", function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener("resize", update);
    update();
  })();

  /* 11. Botão flutuante do WhatsApp: abre a conversa com o número de js/config.js e aparece ao rolar */
  (function () {
    var wa = doc.getElementById("wa-float");
    if (!wa) return;
    var msg = encodeURIComponent("Olá! Gostaria de consultar horários na God Of Barber.");
    wa.setAttribute("href", "https://wa.me/" + (number.length >= 12 ? number : "") + "?text=" + msg);
    function toggle() { wa.classList.toggle("is-visible", (window.pageYOffset || doc.documentElement.scrollTop || 0) > 240); }
    window.addEventListener("scroll", toggle, { passive: true });
    toggle();
  })();

  /* 8. Ano no rodapé */
  var year = doc.getElementById("ano");
  if (year) year.textContent = new Date().getFullYear();
})();
