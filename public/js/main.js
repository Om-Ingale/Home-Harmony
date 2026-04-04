// public/js/main.js

document.addEventListener("DOMContentLoaded", () => {

  // ── Mobile menu toggle ───────────────────────
  const menuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }

  // ── Password visibility toggle ───────────────
  document.querySelectorAll("#toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      btn.innerHTML = isHidden
        ? '<i data-lucide="eye-off" class="w-4 h-4"></i>'
        : '<i data-lucide="eye"     class="w-4 h-4"></i>';
      lucide.createIcons();
    });
  });

  // ── Star rating widget (product show page) ───
  const stars = document.querySelectorAll(".star-btn");
  const ratingInput = document.getElementById("rating-input");
  if (stars.length && ratingInput) {
    const paint = (val) => {
      stars.forEach((s) => {
        s.classList.toggle("text-amber-400", parseInt(s.dataset.val) <= val);
        s.classList.toggle("text-stone-300", parseInt(s.dataset.val) > val);
      });
    };
    paint(parseInt(ratingInput.value) || 5);
    stars.forEach((s) => {
      s.addEventListener("click", () => {
        ratingInput.value = s.dataset.val;
        paint(parseInt(s.dataset.val));
      });
      s.addEventListener("mouseenter", () => paint(parseInt(s.dataset.val)));
      s.addEventListener("mouseleave", () => paint(parseInt(ratingInput.value)));
    });
  }

  // ── Show rentPerMonth field only when type=rent ──
  const typeSelect = document.getElementById("type");
  const rentPerMonthField = document.getElementById("rentPerMonthField");
  if (typeSelect && rentPerMonthField) {
    const toggle = () => {
      rentPerMonthField.classList.toggle("hidden", typeSelect.value !== "rent");
    };
    toggle();
    typeSelect.addEventListener("change", toggle);
  }

  // ── Auto-dismiss flash messages after 4s ────
  setTimeout(() => {
    document.querySelectorAll(".flash-success, .flash-error").forEach((el) => {
      el.style.transition = "opacity 0.5s";
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 500);
    });
  }, 4000);

});
// loader overlay on form submit (product create/edit)
document.addEventListener("DOMContentLoaded", () => {

  const loader = document.getElementById("globalLoader");

  function showLoader() {
    if (!loader) return;
    loader.classList.remove("pointer-events-none", "opacity-0");
    loader.classList.add("opacity-100");
  }

  function hideLoader() {
    if (!loader) return;
    loader.classList.remove("opacity-100");
    loader.classList.add("opacity-0");

    setTimeout(() => {
      loader.classList.add("pointer-events-none");
    }, 300);
  }

  // 🔥 LINKS
  document.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      if (
        link.target === "_blank" ||
        link.href.includes("#") ||
        link.hasAttribute("download")
      ) return;

      showLoader();
    });
  });

  // 🔥 FORMS
  document.querySelectorAll("form").forEach(form => {
    form.addEventListener("submit", () => {
      showLoader();
    });
  });

  // 🔥 PAGE LOAD COMPLETE
  window.addEventListener("pageshow", () => {
    hideLoader();
  });

});

// ── Product listing skeleton loader (index page) ──
document.addEventListener("DOMContentLoaded", () => {

  const skeleton = document.getElementById("skeletonGrid");
  const real = document.getElementById("realGrid");

  if (!skeleton || !real) return;

  // Step 1: skeleton visible immediately
  skeleton.style.display = "grid";
  real.classList.add("hidden");

  // Step 2: after small delay → show real content
  setTimeout(() => {
    skeleton.style.display = "none";
    real.classList.remove("hidden");
  }, 400); // ⚡ sweet spot (200–300ms)

});