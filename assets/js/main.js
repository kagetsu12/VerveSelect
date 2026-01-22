(function () {
  const posts = (window.VERVE_POSTS || []).slice().sort((a, b) =>
    a.date < b.date ? 1 : -1
  );

  const postsContainer = document.getElementById("postsContainer");
  const paginationControls = document.getElementById("paginationControls");
  const categoryFilter = document.getElementById("categoryFilter");
  const searchInput = document.getElementById("searchInput");

  const pageSize = Number(
    postsContainer ? postsContainer.dataset.pageSize || 3 : 3
  );

  let state = {
    page: 1,
    category: "all",
    query: "",
  };

  function normalise(str) {
    return (str || "").toLowerCase().trim();
  }

  function filterPosts() {
    const cat = state.category;
    const q = normalise(state.query);

    return posts.filter((post) => {
      const matchesCategory = cat === "all" || post.category === cat;
      const searchable =
        `${post.title} ${post.excerpt} ${(post.tags || []).join(" ")}`;
      const matchesQuery = !q || normalise(searchable).includes(q);
      return matchesCategory && matchesQuery;
    });
  }

  function renderPosts() {
    if (!postsContainer || !paginationControls) return;

    const filtered = filterPosts();
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

    if (state.page > totalPages) {
      state.page = totalPages;
    }

    const start = (state.page - 1) * pageSize;
    const currentSlice = filtered.slice(start, start + pageSize);

    postsContainer.innerHTML = "";

    if (!currentSlice.length) {
      postsContainer.innerHTML =
        '<p class="vs-muted">No posts match your filters yet. Try another keyword or category.</p>';
    } else {
      currentSlice.forEach((post, index) => {
        const delay = 40 * index;
        const card = document.createElement("article");
        card.className = "vs-post-card fade-in-up";
        card.style.animationDelay = `${delay}ms`;
        card.innerHTML = `
          <a class="vs-post-card-image" href="${post.url}">
            <img src="${post.image}" alt="${post.title}" loading="lazy" />
          </a>
          <div>
            <div class="vs-post-meta">
              <span class="vs-pill">${post.category}</span>
              <span>•</span>
              <span>${post.displayDate}</span>
              <span>•</span>
              <span>${post.readingTime}</span>
            </div>
            <h2>
              <a href="${post.url}">${post.title}</a>
            </h2>
            <p>${post.excerpt}</p>
            <a class="vs-link-arrow" href="${post.url}">
              <span>Read article</span>
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5 10.75h7.3L9.1 13.9 10 14.8 15 9.8 10 4.8 9.1 5.7 12.3 8.9H5v1.8z"></path>
              </svg>
            </a>
          </div>
        `;
        postsContainer.appendChild(card);
      });
    }

    renderPagination(totalPages, filtered.length);
  }

  function renderPagination(totalPages, totalItems) {
    paginationControls.innerHTML = "";
    if (totalItems <= pageSize) return;

    const prev = document.createElement("button");
    prev.className = "vs-page-btn";
    prev.textContent = "Prev";
    prev.disabled = state.page === 1;
    prev.addEventListener("click", () => {
      if (state.page > 1) {
        state.page -= 1;
        renderPosts();
      }
    });

    const next = document.createElement("button");
    next.className = "vs-page-btn";
    next.textContent = "Next";
    next.disabled = state.page === totalPages;
    next.addEventListener("click", () => {
      if (state.page < totalPages) {
        state.page += 1;
        renderPosts();
      }
    });

    paginationControls.appendChild(prev);

    for (let i = 1; i <= totalPages; i += 1) {
      const btn = document.createElement("button");
      btn.className = "vs-page-btn" + (i === state.page ? " is-active" : "");
      btn.textContent = String(i);
      btn.addEventListener("click", () => {
        state.page = i;
        renderPosts();
      });
      paginationControls.appendChild(btn);
    }

    paginationControls.appendChild(next);
  }

  function setupFilters() {
    if (!categoryFilter) return;
    categoryFilter.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-category]");
      if (!btn) return;

      const category = btn.getAttribute("data-category");
      if (!category) return;

      state.category = category;
      state.page = 1;

      categoryFilter
        .querySelectorAll("button[data-category]")
        .forEach((el) => el.classList.remove("is-active"));
      btn.classList.add("is-active");

      renderPosts();
    });
  }

  function setupSearch() {
    if (!searchInput) return;
    let lastValue = "";
    let timeoutId;

    searchInput.addEventListener("input", (event) => {
      const value = event.target.value;
      if (value === lastValue) return;
      lastValue = value;

      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        state.query = value;
        state.page = 1;
        renderPosts();
      }, 160);
    });
  }

  function setupNavToggle() {
    const toggle = document.querySelector(".vs-nav-toggle");
    const list = document.querySelector(".vs-nav-list");
    if (!toggle || !list) return;

    toggle.addEventListener("click", () => {
      const isOpen = list.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (postsContainer) {
      setupFilters();
      setupSearch();
      renderPosts();
    }
    setupNavToggle();
  });
})();


