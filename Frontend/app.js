
const API_URL = "https://blog-api-9wsb.onrender.com";

// =====================================
// 1. ELEMENTS
// =====================================

const postsContainer = document.getElementById("posts");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");

const previousPageButton = document.getElementById("previous-page");
const nextPageButton = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");

const createPostButton = document.getElementById("show-create-form");
const createPostView = document.getElementById("create-post-view");
const createPostForm = document.getElementById("create-post-form");
const createPostMessage = document.getElementById("create-post-message");
const cancelCreateButton = document.getElementById("cancel-create-form");

const editPostView = document.getElementById("edit-post-view");
const editPostForm = document.getElementById("edit-post-form");
const editPostMessage = document.getElementById("edit-post-message");
const cancelEditButton = document.getElementById("cancel-edit-form");

const deletePostView = document.getElementById("delete-post-view");
const deletePostTitle = document.getElementById("delete-post-title");
const confirmDeleteButton = document.getElementById("confirm-delete");
const cancelDeleteButton = document.getElementById("cancel-delete");
const deletePostMessage = document.getElementById("delete-post-message");

const postDetail = document.getElementById("post-detail");
const themeToggle = document.getElementById("themeToggle");
const profileAvatar = document.getElementById("profile-avatar");

// =====================================
// 2. STATE
// =====================================

let currentPage = 1;
let totalPages = 1;
let currentSearch = "";

let selectedPostId = null;
let selectedDeletePostId = null;

let posts = [];

// =====================================
// 3. AUTHENTICATION
// =====================================

function getToken() {
    return localStorage.getItem("token");
}

function isLoggedIn() {
    return Boolean(getToken());
}

function updateAuthUI() {
    const loggedIn = isLoggedIn();

    createPostButton.hidden = !loggedIn;
    profileAvatar.hidden = !loggedIn;

    if (loggedIn) {
        const username = localStorage.getItem("username") || "User";
        profileAvatar.textContent = username.charAt(0).toUpperCase();
        profileAvatar.title = username;
    } else {
        createPostView.hidden = true;
        editPostView.hidden = true;
        deletePostView.hidden = true;
    }
}

// =====================================
// 4. THEME TOGGLE
// =====================================

function applyTheme(theme) {
    document.body.classList.toggle("light", theme === "light");

    themeToggle.textContent = theme === "light" ? "🌙" : "☀️";
    themeToggle.setAttribute(
        "aria-label",
        theme === "light" ? "Switch to dark theme" : "Switch to light theme"
    );
}

const savedTheme = localStorage.getItem("blog-theme") || "dark";
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
    const newTheme = document.body.classList.contains("light")
        ? "dark"
        : "light";

    localStorage.setItem("blog-theme", newTheme);
    applyTheme(newTheme);
});

// =====================================
// 5. HELPER FUNCTIONS
// =====================================

function hideAllForms() {
    createPostView.hidden = true;
    editPostView.hidden = true;
    deletePostView.hidden = true;
}

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}

function getAuthorName(post) {
    if (post.author && typeof post.author === "object") {
        return post.author.username || "Unknown author";
    }

    return "Unknown author";
}

function getPostId(post) {
    return post._id || post.id;
}

function showMessage(element, message, isError = false) {
    element.textContent = message;
    element.style.color = isError ? "#ef4444" : "";
}

// =====================================
// 6. CREATE POST FORM VISIBILITY
// =====================================

createPostButton.addEventListener("click", () => {
    if (!isLoggedIn()) {
        alert("Please log in to create a post.");
        return;
    }

    hideAllForms();
    createPostView.hidden = false;
    createPostView.scrollIntoView({ behavior: "smooth" });
});

cancelCreateButton.addEventListener("click", () => {
    createPostView.hidden = true;
    createPostForm.reset();
    createPostMessage.textContent = "";
});

// =====================================
// 7. CREATE POST
// =====================================

createPostForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!isLoggedIn()) {
        showMessage(createPostMessage, "Please log in first.", true);
        updateAuthUI();
        return;
    }

    const token = getToken();
    const formData = new FormData(createPostForm);

    const title = formData.get("title")?.trim();
    const description = formData.get("description")?.trim();

    if (!title || !description) {
        showMessage(createPostMessage, "Title and description are required.", true);
        return;
    }

    showMessage(createPostMessage, "Publishing post...");

    try {
        const response = await fetch(`${API_URL}/post`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not create post.");
        }

        showMessage(createPostMessage, "Post published successfully!");

        createPostForm.reset();

        setTimeout(() => {
            hideAllForms();
            currentPage = 1;
            loadPosts();
        }, 800);

    } catch (error) {
        showMessage(createPostMessage, error.message, true);
    }
});

// =====================================
// 8. LOAD ALL POSTS
// =====================================

async function loadPosts() {
    postsContainer.innerHTML = "<p>Loading posts...</p>";

    try {
        const query = new URLSearchParams({
            search: currentSearch,
            page: currentPage,
            limit: 5
        });

        const response = await fetch(`${API_URL}/post?${query}`);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not load posts.");
        }

        posts = data.posts || [];
        totalPages = data.totalPages || 1;
        currentPage = data.currentPage || currentPage;

        renderPosts(posts);
        updatePagination();

    } catch (error) {
        postsContainer.innerHTML = `
            <p class="error-message">
                ${escapeHTML(error.message)}
            </p>
        `;
    }
}

// =====================================
// 9. DISPLAY POSTS
// =====================================

function renderPosts(postList) {
    postsContainer.innerHTML = "";

    if (!postList.length) {
        postsContainer.innerHTML = "<p>No posts found.</p>";
        return;
    }

    const loggedIn = isLoggedIn();

    postList.forEach(post => {
        const postId = getPostId(post);

        const card = document.createElement("article");
        card.className = "post-card";

        const image = post.imageUrl
            ? `
                <img
                    class="post-cover"
                    src="${escapeHTML(post.imageUrl)}"
                    alt="${escapeHTML(post.title)}"
                    loading="lazy"
                    onerror="this.style.display='none'"
                >
            `
            : "";

        const author = escapeHTML(getAuthorName(post));
        const title = escapeHTML(post.title);
        const description = escapeHTML(post.description || "");

        card.innerHTML = `
            ${image}

            <h2>${title}</h2>

            <p class="post-description">
                ${description}
            </p>

            <p class="post-author">
                By ${author}
            </p>

            <button type="button" class="read-btn">
                Read More
            </button>

            ${loggedIn
                ? `
                        <button type="button" class="edit-btn secondary-btn">
                            Edit
                        </button>

                        <button type="button" class="delete-btn">
                            Delete
                        </button>
                    `
                : ""
            }
        `;

        card.querySelector(".read-btn").addEventListener("click", () => {
            loadPostDetail(postId);
        });

        if (loggedIn) {
            card.querySelector(".edit-btn").addEventListener("click", () => {
                showEditForm(postId);
            });

            card.querySelector(".delete-btn").addEventListener("click", () => {
                showDeleteConfirmation(postId, post.title);
            });
        }

        postsContainer.appendChild(card);
    });
}

// =====================================
// 10. POST DETAILS
// =====================================

async function loadPostDetail(postId) {
    hideAllForms();

    postDetail.innerHTML = "<p>Loading post...</p>";
    postDetail.scrollIntoView({ behavior: "smooth" });

    try {
        const response = await fetch(`${API_URL}/post/${encodeURIComponent(postId)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not load post.");
        }

        const post = data.post || data;
        const image = post.imageUrl
            ? `
                <img
                    class="post-cover detail-cover"
                    src="${escapeHTML(post.imageUrl)}"
                    alt="${escapeHTML(post.title)}"
                >
            `
            : "";

        postDetail.innerHTML = `
            ${image}
            <h2>${escapeHTML(post.title)}</h2>
            <p>${escapeHTML(post.description || "")}</p>
            <p class="post-author">
                By ${escapeHTML(getAuthorName(post))}
            </p>
            <button type="button" id="close-post-detail"
                class="secondary-btn">Close</button>
        `;

        document.getElementById("close-post-detail").addEventListener("click", () => {
            postDetail.innerHTML = "";
        });

    } catch (error) {
        postDetail.textContent = error.message;
    }
}

// =====================================
// 11. EDIT POST
// =====================================

async function showEditForm(postId) {
    if (!isLoggedIn()) return;

    const post = posts.find(item => getPostId(item) === postId);

    if (!post) return;

    hideAllForms();

    selectedPostId = postId;

    editPostForm.elements.title.value = post.title || "";
    editPostForm.elements.description.value = post.description || "";

    editPostMessage.textContent = "";
    editPostView.hidden = false;

    editPostView.scrollIntoView({ behavior: "smooth" });
}

cancelEditButton.addEventListener("click", () => {
    editPostView.hidden = true;
    editPostForm.reset();
    selectedPostId = null;
});

editPostForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!isLoggedIn() || !selectedPostId) return;

    const title = editPostForm.elements.title.value.trim();
    const description = editPostForm.elements.description.value.trim();

    if (!title || !description) {
        showMessage(editPostMessage, "Please fill in all fields.", true);
        return;
    }

    showMessage(editPostMessage, "Saving changes...");

    try {
        const response = await fetch(
            `${API_URL}/post/${encodeURIComponent(selectedPostId)}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify({ title, description })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not update post.");
        }

        showMessage(editPostMessage, "Post updated successfully!");

        selectedPostId = null;

        setTimeout(() => {
            hideAllForms();
            loadPosts();
        }, 800);

    } catch (error) {
        showMessage(editPostMessage, error.message, true);
    }
});

// =====================================
// 12. DELETE POST
// =====================================

function showDeleteConfirmation(postId, title) {
    if (!isLoggedIn()) return;

    hideAllForms();

    selectedDeletePostId = postId;
    deletePostTitle.textContent = title;

    deletePostMessage.textContent = "";
    deletePostView.hidden = false;

    deletePostView.scrollIntoView({ behavior: "smooth" });
}

cancelDeleteButton.addEventListener("click", () => {
    deletePostView.hidden = true;
    selectedDeletePostId = null;
});

confirmDeleteButton.addEventListener("click", async () => {
    if (!isLoggedIn() || !selectedDeletePostId) return;

    showMessage(deletePostMessage, "Deleting post...");

    try {
        const response = await fetch(
            `${API_URL}/post/${encodeURIComponent(selectedDeletePostId)}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not delete post.");
        }

        selectedDeletePostId = null;

        if (posts.length === 1 && currentPage > 1) {
            currentPage--;
        }

        hideAllForms();
        loadPosts();

    } catch (error) {
        showMessage(deletePostMessage, error.message, true);
    }
});

// =====================================
// 13. SEARCH
// =====================================

searchForm.addEventListener("submit", event => {
    event.preventDefault();

    currentSearch = searchInput.value.trim();
    currentPage = 1;

    loadPosts();
});

// =====================================
// 14. PAGINATION
// =====================================

function updatePagination() {
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    previousPageButton.disabled = currentPage <= 1;
    nextPageButton.disabled = currentPage >= totalPages;
}

previousPageButton.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        loadPosts();
    }
});

nextPageButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
        currentPage++;
        loadPosts();
    }
});

// =====================================
// 15. INITIALIZE
// =====================================

updateAuthUI();
loadPosts();
