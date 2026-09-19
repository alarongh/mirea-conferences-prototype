(function () {
  "use strict";

  const index = window.PORTAL_SEARCH_INDEX || [];
  const normalize = (value) => String(value || "").toLocaleLowerCase("ru-RU").trim();
  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function renderShell() {
    const headerTarget = document.querySelector("[data-site-header]");
    const footerTarget = document.querySelector("[data-site-footer]");
    const current = headerTarget ? headerTarget.dataset.current : "";
    const navItems = [
      ["conferences", "Конференции", "conferences.html"],
      ["program", "Программа", "program.html"],
      ["archive", "Архив", "archive.html"],
      ["materials", "Материалы", "materials.html"],
      ["gallery", "Галерея", "gallery.html"]
    ];

    if (headerTarget) {
      headerTarget.outerHTML = `
        <header class="site-header">
          <div class="container site-header__inner">
            <a class="brand" href="index.html" aria-label="На главную">
              <span class="brand__mark" aria-hidden="true">РТУ</span>
              <span>Конференции<span class="brand__sub">кафедра истории и документоведения</span></span>
            </a>
            <button class="menu-button" type="button" data-menu-toggle aria-expanded="false" aria-controls="site-nav">Меню</button>
            <nav class="site-nav" id="site-nav" data-site-nav aria-label="Основная навигация">
              ${navItems.map(([key, label, href]) => `<a href="${href}"${current === key ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
              <button class="icon-button" type="button" data-open-search aria-label="Открыть поиск">Поиск</button>
            </nav>
          </div>
        </header>`;
    }

    if (footerTarget) {
      footerTarget.outerHTML = `
        <footer class="site-footer">
          <div class="container site-footer__grid">
            <section class="site-footer__about" aria-labelledby="footer-about">
              <h2 class="visually-hidden" id="footer-about">О портале</h2>
              <p><strong>Конференции кафедры РТУ МИРЭА</strong></p>
              <p class="site-footer__note">Программы, доклады, документы и архив мероприятий одной из кафедр университета. Контент прототипа подготовлен к последующей загрузке из Django.</p>
            </section>
            <nav aria-label="Разделы портала">
              <p><strong>Разделы</strong></p>
              <ul class="plain-list stack-sm">
                <li><a href="conferences.html">Конференции</a></li>
                <li><a href="archive.html">Архив</a></li>
                <li><a href="materials.html">Материалы</a></li>
              </ul>
            </nav>
            <nav aria-label="Дополнительные разделы">
              <p><strong>Найти</strong></p>
              <ul class="plain-list stack-sm">
                <li><a href="program.html">Программа</a></li>
                <li><a href="gallery.html">Галерея</a></li>
                <li><a href="search.html">Глобальный поиск</a></li>
              </ul>
            </nav>
          </div>
          <div class="container">
            <p class="meta">© <span data-current-year></span> Кафедра истории и документоведения РТУ МИРЭА</p>
            <p class="site-footer__signature">fronted by alaron</p>
          </div>
        </footer>`;
    }

    if (!document.querySelector("#search-overlay")) {
      document.body.insertAdjacentHTML("beforeend", `
        <dialog class="search-dialog" id="search-overlay" aria-labelledby="search-overlay-title">
          <div class="search-dialog__inner">
            <div class="search-dialog__header">
              <h2 id="search-overlay-title">Поиск по порталу</h2>
              <button class="icon-button" type="button" data-close-search aria-label="Закрыть поиск">Закрыть</button>
            </div>
            <form class="search-form" role="search">
              <label class="visually-hidden" for="overlay-query">Конференция, докладчик, доклад или документ</label>
              <input class="search-input" id="overlay-query" data-overlay-query type="search" placeholder="Конференция, докладчик, документ…" autocomplete="off">
              <button class="button" type="submit">Все результаты</button>
            </form>
            <div class="search-dialog__results search-results" data-overlay-results aria-live="polite"></div>
          </div>
        </dialog>`);
    }
  }

  function searchItems(query, type) {
    const term = normalize(query);
    return index.filter((item) => {
      const matchesType = !type || type === "all" || normalize(item.type) === normalize(type);
      const haystack = normalize([item.title, item.meta, item.text, ...(item.tags || [])].join(" "));
      return matchesType && (!term || haystack.includes(term));
    });
  }

  function renderResults(target, items, emptyMessage) {
    if (!target) return;
    if (!items.length) {
      target.innerHTML = `<div class="empty-state"><h3>Ничего не найдено</h3><p>${escapeHtml(emptyMessage || "Попробуйте изменить запрос или фильтр.")}</p></div>`;
      return;
    }
    target.innerHTML = items.map((item) => `
      <article class="search-result">
        <p class="search-result__type">${escapeHtml(item.type)}</p>
        <h3><a href="${escapeHtml(item.url)}">${escapeHtml(item.title)}</a></h3>
        <p class="meta">${escapeHtml(item.meta)}</p>
        <p>${escapeHtml(item.text)}</p>
      </article>
    `).join("");
  }

  function initMobileMenu() {
    const button = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-site-nav]");
    if (!button || !nav) return;
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("is-open", !expanded);
    });
  }

  function initSearchDialog() {
    const dialog = document.querySelector("#search-overlay");
    if (!dialog) return;
    const input = dialog.querySelector("[data-overlay-query]");
    const results = dialog.querySelector("[data-overlay-results]");
    const form = dialog.querySelector("form");
    const closeButton = dialog.querySelector("[data-close-search]");

    document.querySelectorAll("[data-open-search]").forEach((button) => {
      button.addEventListener("click", () => {
        dialog.showModal();
        document.body.classList.add("is-locked");
        renderResults(results, index.slice(0, 5), "Введите другой запрос.");
        window.setTimeout(() => input && input.focus(), 0);
      });
    });

    const close = () => {
      dialog.close();
      document.body.classList.remove("is-locked");
    };

    closeButton && closeButton.addEventListener("click", close);
    dialog.addEventListener("close", () => document.body.classList.remove("is-locked"));
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) close();
    });
    input && input.addEventListener("input", () => {
      renderResults(results, searchItems(input.value).slice(0, 6), "Проверьте написание или откройте расширенный поиск.");
    });
    form && form.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = input ? input.value.trim() : "";
      window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    });
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-group]").forEach((group) => {
      const scope = group.closest("[data-filter-scope]") || document;
      const items = scope.querySelectorAll("[data-filter-item]");
      const empty = scope.querySelector("[data-filter-empty]");
      group.querySelectorAll("[data-filter-value]").forEach((button) => {
        button.addEventListener("click", () => {
          group.querySelectorAll("[data-filter-value]").forEach((candidate) => candidate.setAttribute("aria-pressed", "false"));
          button.setAttribute("aria-pressed", "true");
          const filter = normalize(button.dataset.filterValue);
          let visible = 0;
          items.forEach((item) => {
            const tags = normalize(item.dataset.tags).split(/\s+/);
            const show = filter === "all" || tags.includes(filter);
            item.hidden = !show;
            if (show) visible += 1;
          });
          if (empty) empty.hidden = visible > 0;
        });
      });
      const params = new URLSearchParams(window.location.search);
      const requested = normalize(params.get("year") || params.get("filter"));
      if (requested) {
        const requestedButton = Array.from(group.querySelectorAll("[data-filter-value]"))
          .find((button) => normalize(button.dataset.filterValue) === requested);
        if (requestedButton) requestedButton.click();
      }
    });
  }

  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach((tabs) => {
      const buttons = tabs.querySelectorAll("[role=tab]");
      const panels = tabs.querySelectorAll("[role=tabpanel]");
      const select = (button) => {
        buttons.forEach((candidate) => {
          candidate.setAttribute("aria-selected", String(candidate === button));
          candidate.tabIndex = candidate === button ? 0 : -1;
        });
        panels.forEach((panel) => {
          panel.hidden = panel.id !== button.getAttribute("aria-controls");
        });
        history.replaceState(null, "", `#${button.dataset.dateAnchor}`);
      };
      buttons.forEach((button, indexOfButton) => {
        button.addEventListener("click", () => select(button));
        button.addEventListener("keydown", (event) => {
          if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
          event.preventDefault();
          const direction = event.key === "ArrowRight" ? 1 : -1;
          const nextIndex = (indexOfButton + direction + buttons.length) % buttons.length;
          buttons[nextIndex].focus();
          select(buttons[nextIndex]);
        });
      });
      const hash = window.location.hash.replace("#", "");
      const hashButton = Array.from(buttons).find((button) => button.dataset.dateAnchor === hash);
      if (hashButton) select(hashButton);
    });
  }

  function initSearchPage() {
    const form = document.querySelector("[data-search-page-form]");
    const input = document.querySelector("[data-search-page-query]");
    const type = document.querySelector("[data-search-page-type]");
    const results = document.querySelector("[data-search-page-results]");
    const count = document.querySelector("[data-search-page-count]");
    if (!form || !input || !results) return;

    const params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";
    if (type && params.get("type")) type.value = params.get("type");

    const update = (pushState) => {
      const found = searchItems(input.value, type ? type.value : "all");
      renderResults(results, found, "Измените формулировку запроса или выберите другой тип материала.");
      if (count) count.textContent = `${found.length} ${found.length === 1 ? "результат" : "результатов"}`;
      if (pushState) {
        const next = new URLSearchParams();
        if (input.value.trim()) next.set("q", input.value.trim());
        if (type && type.value !== "all") next.set("type", type.value);
        history.replaceState(null, "", `${window.location.pathname}${next.toString() ? `?${next}` : ""}`);
      }
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      update(true);
    });
    type && type.addEventListener("change", () => update(true));
    update(false);
  }

  function setYear() {
    document.querySelectorAll("[data-current-year]").forEach((node) => {
      node.textContent = new Date().getFullYear();
    });
  }

  renderShell();
  initMobileMenu();
  initSearchDialog();
  initFilters();
  initTabs();
  initSearchPage();
  setYear();
})();
