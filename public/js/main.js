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

//loader overlay on form submit (product create/edit)
document.addEventListener("DOMContentLoaded", () => {

  // FORM LOADER (product create/edit)
  document.querySelectorAll("form").forEach(form => {
    form.addEventListener("submit", () => {
      document.getElementById("loaderOverlay").classList.remove("hidden");
    });
  });

  if (form) {
    form.addEventListener("submit", () => {
      const loader = document.getElementById("loaderOverlay");
      loader.classList.remove("hidden");

      // disable button (prevent double click)
      const btn = form.querySelector("button[type='submit']");
      if (btn) {
        btn.disabled = true;
        btn.innerText = "Processing...";
      }
    });
  }

});