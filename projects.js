// Project gallery — projects.html only
(function () {
  const galleryContainer = document.getElementById("projectGallery");
  if (!galleryContainer) return;

  const TARGET_USERNAME = "diorsadan"; // Permanent target repository username
  const itemsPerPage = 6;

  let allRepos = [];
  let filteredRepos = [];
  let currentPage = 1;
  let showingBookmarksOnly = false;

  const readBookmarks = () => {
    try {
      return JSON.parse(localStorage.getItem("adan_bookmarks")) || [];
    } catch {
      return [];
    }
  };

  let bookmarks = readBookmarks();

  const searchInput = document.getElementById("searchInput");
  const spinner = document.getElementById("loadingSpinner");
  const errorContainer = document.getElementById("errorContainer");
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");
  const paginationControls = document.getElementById("paginationControls");
  const showBookmarksBtn = document.getElementById("showBookmarksBtn");

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const getVisibleRepos = () => {
    const query = searchInput.value.trim().toLowerCase();
    return allRepos.filter(({ id, name, description }) => {
      const searchableText = `${name} ${description || ""}`.toLowerCase();
      return (
        searchableText.includes(query) &&
        (!showingBookmarksOnly || bookmarks.includes(id))
      );
    });
  };

  async function fetchRepositories() {
    spinner.classList.remove("hidden");
    errorContainer.classList.add("hidden");
    paginationControls.classList.add("hidden");
    galleryContainer.innerHTML = "";

    try {
      const url = `https://api.github.com/users/${TARGET_USERNAME}/repos?sort=updated&per_page=30`;
      const res = await fetch(url);

      if (res.status === 404) {
        throw new Error(`GitHub user "${TARGET_USERNAME}" not found.`);
      }
      if (!res.ok) {
        throw new Error(
          `HTTP Error: ${res.status} - Failed to fetch repositories.`
        );
      }

      const data = await res.json();

      allRepos = data.map((repo) => {
        const { id, name, description, html_url, language, stargazers_count } =
          repo;
        return {
          id,
          name,
          description,
          html_url,
          language,
          stars: stargazers_count,
        };
      });

      filteredRepos = [...allRepos];
      currentPage = 1;
      searchInput.value = "";
      renderGallery();
    } catch (err) {
      errorContainer.textContent = `Unable to load projects: ${err.message}`;
      errorContainer.classList.remove("hidden");
    } finally {
      spinner.classList.add("hidden");
    }
  }

  function renderGallery() {
    galleryContainer.innerHTML = "";

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const reposToDisplay = filteredRepos.slice(startIndex, endIndex);

    if (reposToDisplay.length === 0) {
      galleryContainer.innerHTML = `<p class="empty-state">No projects found.</p>`;
      paginationControls.classList.add("hidden");
      return;
    }

    const htmlString = reposToDisplay
      .map((repo) => {
        const isBookmarked = bookmarks.includes(repo.id);
        const iconClass = isBookmarked ? "fa-solid" : "fa-regular";
        const activeClass = isBookmarked ? "bookmarked" : "";

        return `
            <article class="project-card">
                <div class="project-header">
                    <a href="${escapeHtml(
                      repo.html_url
                    )}" target="_blank" rel="noopener noreferrer" class="project-title">${escapeHtml(
          repo.name
        )}</a>
                    <button type="button" class="bookmark-btn ${activeClass}" data-id="${
          repo.id
        }" aria-label="${isBookmarked ? "Remove bookmark" : "Bookmark project"}">
                        <i class="${iconClass} fa-bookmark"></i>
                    </button>
                </div>
                <p class="project-desc">${escapeHtml(
                  repo.description || "No description provided."
                )}</p>
                <div class="project-meta">
                    <span><i class="fa-solid fa-code"></i> ${escapeHtml(
                      repo.language || "N/A"
                    )}</span>
                    <span><i class="fa-solid fa-star"></i> ${repo.stars}</span>
                </div>
            </article>
        `;
      })
      .join("");

    galleryContainer.innerHTML = htmlString;
    updatePaginationControls();
    attachBookmarkListeners();
  }

  function updatePaginationControls() {
    const totalPages = Math.ceil(filteredRepos.length / itemsPerPage);

    if (totalPages > 1) {
      paginationControls.classList.remove("hidden");
      pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
      prevBtn.disabled = currentPage === 1;
      nextBtn.disabled = currentPage === totalPages;
    } else {
      paginationControls.classList.add("hidden");
    }
  }

  searchInput.addEventListener("input", () => {
    filteredRepos = getVisibleRepos();
    currentPage = 1;
    renderGallery();
  });

  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderGallery();
    }
  });

  nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredRepos.length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderGallery();
    }
  });

  showBookmarksBtn.addEventListener("click", () => {
    showingBookmarksOnly = !showingBookmarksOnly;
    showBookmarksBtn.classList.toggle("is-active", showingBookmarksOnly);

    filteredRepos = getVisibleRepos();
    currentPage = 1;
    renderGallery();
  });

  function attachBookmarkListeners() {
    const buttons = document.querySelectorAll(".bookmark-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = Number(e.currentTarget.dataset.id);

        if (bookmarks.includes(id)) {
          bookmarks = bookmarks.filter((bId) => bId !== id);
        } else {
          bookmarks.push(id);
        }

        localStorage.setItem("adan_bookmarks", JSON.stringify(bookmarks));
        filteredRepos = getVisibleRepos();
        renderGallery();
      });
    });
  }

  fetchRepositories();
})();
