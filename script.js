/* =========================================================
   VISUAL INSPEÇÃO VEICULAR — script.js
   Autor: (seu nome / equipe)
   Vanilla JS · Sem dependências
   ========================================================= */

(function () {
  "use strict";

  /* ---------- 1. UTILITÁRIOS ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- 2. HEADER: sombra ao rolar ---------- */
  const header = $("#header");
  const onScrollHeader = () => {
    if (window.scrollY > 20) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- 3. MENU MOBILE ---------- */
  const hamburger = $("#hamburger");
  const nav = $("#nav");

  const toggleMenu = (force) => {
    const open = typeof force === "boolean" ? force : !nav.classList.contains("open");
    nav.classList.toggle("open", open);
    hamburger.classList.toggle("active", open);
    hamburger.setAttribute("aria-expanded", String(open));
    // Evita scroll do body quando o menu está aberto
    document.body.style.overflow = open ? "hidden" : "";
  };

  hamburger.addEventListener("click", () => toggleMenu());

  // Fecha o menu ao clicar em qualquer link
  $$(".nav__link, .nav__cta", nav).forEach((link) => {
    link.addEventListener("click", () => toggleMenu(false));
  });

  // Fecha o menu com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) toggleMenu(false);
  });

  // Fecha o menu ao clicar fora
  document.addEventListener("click", (e) => {
    if (
      nav.classList.contains("open") &&
      !nav.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      toggleMenu(false);
    }
  });

  /* ---------- 4. LINK ATIVO CONFORME SEÇÃO VISÍVEL ---------- */
  const sections = $$("section[id]");
  const navLinks = $$(".nav__link");

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      const match = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", match);
    });
  };

  if ("IntersectionObserver" in window && sections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveLink(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((sec) => navObserver.observe(sec));
  }

  /* ---------- 5. ANIMAÇÃO DE ENTRADA (.reveal) ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: mostra tudo
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- 6. CONTADOR ANIMADO (STATS) ---------- */
  const counters = $$(".stat__number");

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const duration = 1600;
    const start = performance.now();
    const isPercent = el.textContent.trim().endsWith("%") || el.dataset.suffix === "%";

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // Easing "easeOutCubic"
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = value.toLocaleString("pt-BR");
      if (progress < 1) requestAnimationFrame(step);
      else {
        el.textContent = target.toLocaleString("pt-BR");
        if (isPercent) el.textContent += "%";
      }
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window && counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => counterObserver.observe(c));
  } else {
    counters.forEach((c) => {
      c.textContent = (parseInt(c.dataset.count, 10) || 0).toLocaleString("pt-BR");
    });
  }

  /* ---------- 7. ANO AUTOMÁTICO NO FOOTER ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 8. DATA AUTOMÁTICA NA POLÍTICA DE PRIVACIDADE ---------- */
  // Substitui qualquer placeholder tipo "<%= ... %>" ou "{{DATA}}" pela data atual
  const privacyBody = $("#privacyModal .modal__body");
  if (privacyBody) {
    const firstEm = privacyBody.querySelector("em");
    if (firstEm) {
      const today = new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      firstEm.textContent = `Última atualização: ${today}`;
    }
  }

  /* ---------- 9. MÁSCARA DE TELEFONE ---------- */
  const phoneInput = $("#telefone");
  if (phoneInput) {
    const maskPhone = (value) => {
      value = value.replace(/\D/g, "").slice(0, 11);
      if (value.length <= 2) return value;
      if (value.length <= 6) return `(${value.slice(0, 2)}) ${value.slice(2)}`;
      if (value.length <= 10)
        return `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
      return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    };

    phoneInput.addEventListener("input", (e) => {
      e.target.value = maskPhone(e.target.value);
    });

    // Ao colar, também aplica máscara
    phoneInput.addEventListener("paste", (e) => {
      const pasted = (e.clipboardData || window.clipboardData).getData("text");
      if (pasted) {
        e.preventDefault();
        phoneInput.value = maskPhone(pasted);
      }
    });
  }

  /* ---------- 10. VALIDAÇÃO DO FORMULÁRIO ---------- */
  const form = $("#formContato");
  const formSuccess = $("#formSuccess");

  const showError = (field, msg) => {
    field.classList.add("invalid");
    const errEl = $(`[data-error-for="${field.id}"]`, form);
    if (errEl) errEl.textContent = msg;
  };

  const clearError = (field) => {
    field.classList.remove("invalid");
    const errEl = $(`[data-error-for="${field.id}"]`, form);
    if (errEl) errEl.textContent = "";
  };

  const validateField = (field) => {
    const value = field.value.trim();

    if (field.hasAttribute("required") && !value) {
      showError(field, "Este campo é obrigatório.");
      return false;
    }

    if (field.type === "email" && value) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!re.test(value)) {
        showError(field, "Informe um e-mail válido.");
        return false;
      }
    }

    if (field.id === "telefone" && value) {
      const digits = value.replace(/\D/g, "");
      if (digits.length < 10) {
        showError(field, "Telefone incompleto (mín. 10 dígitos).");
        return false;
      }
    }

    if (field.id === "nome" && value.length > 0 && value.length < 3) {
      showError(field, "Nome muito curto.");
      return false;
    }

    if (field.id === "mensagem" && value.length > 0 && value.length < 10) {
      showError(field, "Mensagem muito curta (mín. 10 caracteres).");
      return false;
    }

    clearError(field);
    return true;
  };

  if (form) {
    const fields = $$("input, textarea, select", form).filter(
      (f) => f.type !== "hidden" && f.tagName !== "SELECT"
    );

    // Validação em tempo real após o primeiro blur
    fields.forEach((field) => {
      field.addEventListener("blur", () => validateField(field));
      field.addEventListener("input", () => {
        if (field.classList.contains("invalid")) validateField(field);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let isValid = true;

      fields.forEach((field) => {
        if (!validateField(field)) isValid = false;
      });

      if (!isValid) {
        // Foca no primeiro campo com erro
        const firstInvalid = $(".invalid", form);
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Simula envio (aqui você integraria com backend/Formspree/EmailJS)
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        form.reset();
        fields.forEach(clearError);
        if (formSuccess) {
          formSuccess.hidden = false;
          formSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => (formSuccess.hidden = true), 6000);
        }
      }, 1200);
    });
  }

  /* ---------- 11. MODAL DE POLÍTICA DE PRIVACIDADE ---------- */
  const privacyModal = $("#privacyModal");
  const openPrivacyBtn = $("#openPrivacy");
  const closeBtns = $$("[data-close-modal]");

  let lastFocused = null;

  const openModal = () => {
    lastFocused = document.activeElement;
    privacyModal.hidden = false;
    document.body.style.overflow = "hidden";
    // Foco inicial no botão de fechar (acessibilidade)
    const closeBtn = $(".modal__close", privacyModal);
    if (closeBtn) closeBtn.focus();
  };

  const closeModal = () => {
    privacyModal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  };

  if (openPrivacyBtn) openPrivacyBtn.addEventListener("click", openModal);
  closeBtns.forEach((btn) => btn.addEventListener("click", closeModal));

  // Fecha com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && privacyModal && !privacyModal.hidden) closeModal();
  });

  // Trap de foco simples dentro do modal
  if (privacyModal) {
    privacyModal.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const focusables = $$(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        privacyModal
      ).filter((el) => !el.disabled && el.offsetParent !== null);

      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------- 12. SCROLL SUAVE PARA LINKS INTERNOS ---------- */
  // (reforço caso o navegador não suporte scroll-behavior)
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const offset = 80; // altura do header
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
      // Fecha o menu mobile, se estiver aberto
      if (nav.classList.contains("open")) toggleMenu(false);
    });
  });

  /* ---------- 13. LAZY LOAD DE IMAGENS (fallback) ---------- */
  // Caso você adicione imagens com data-src no futuro
  const lazyImages = $$("img[data-src]");
  if (lazyImages.length && "IntersectionObserver" in window) {
    const imgObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
          obs.unobserve(img);
        }
      });
    });
    lazyImages.forEach((img) => imgObserver.observe(img));
  }

  /* ---------- 14. LOG DE BOAS-VINDAS (dev only) ---------- */
  console.log(
    "%cVisual Inspeção Veicular",
    "color:#0b5fff;font-weight:700;font-size:16px;",
    "\nSite carregado com sucesso. Dúvidas? contabilidade@visualinspecao.com.br"
  );
})();
