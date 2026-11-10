const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    currentPage = 1;
    loadPosts(searchInput.value.trim());
});

let currentPage = 1;
let totalPages = 1;

const previousButton = document.querySelector("#previous-page");
const nextButton = document.querySelector("#next-page");
const pageInfo = document.querySelector("#page-info");

const createPostForm = document.querySelector("#create-post-form");
const createPostMessage = document.querySelector("#create-post-message");

const editPostView = document.querySelector("#edit-post-view");
const editPostForm = document.querySelector("#edit-post-form");
const editPostMessage = document.querySelector("#edit-post-message");
const cancelEditFormButton = document.querySelector("#cancel-edit-form");

let postBeingEdited = null;

const deletePostView = document.querySelector("#delete-post-view");
const deletePostTitle = document.querySelector("#delete-post-title");
const confirmDeleteButton = document.querySelector("#confirm-delete");
const cancelDeleteButton = document.querySelector("#cancel-delete");
const deletePostMessage = document.querySelector("#delete-post-message");

let postBeingDeleted = null;

async function loadPostDetail(postId) {
    const detailContainer = document.querySelector("#post-detail");
    detailContainer.textContent = "Loading post...";

    try {
        const response = await fetch(`https://blog-api-9wsb.onrender.com/post/${postId}`);

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        const post = await response.json();

        const title = document.createElement("h2");
        title.textContent = post.title;

        const description = document.createElement("p");
        const fullDescription = post.description;
        const previewLength = 200;
        let isExpanded = false;

        function updateDescription() {
            if (isExpanded || fullDescription.length <= previewLength) {
                description.textContent = fullDescription;
                return;
            }

            description.textContent = `${fullDescription.slice(0, previewLength)}...`;
        }

        updateDescription();

        let toggleButton;

        if (fullDescription.length > previewLength) {
            toggleButton = document.createElement("button");
            toggleButton.textContent = "Read more";
            toggleButton.addEventListener("click", () => {
                isExpanded = !isExpanded;
                updateDescription();
                toggleButton.textContent = isExpanded ? "Show less" : "Read more";
            });
        }

        const date = document.createElement("p");
        date.textContent = `Posted on ${new Date(post.createdAt).toLocaleDateString()}`;

        const author = document.createElement("p");
        author.textContent = `By ${post.author?.username || "Unknown author"}`;

        const closeButton = document.createElement("button");
        closeButton.textContent = "Close";
        closeButton.addEventListener("click", () => {
            detailContainer.replaceChildren();
        });

        const detailElements = [title, description];

        if (toggleButton) {
            detailElements.push(toggleButton);
        }

        detailElements.push(date, author, closeButton);
        detailContainer.replaceChildren(...detailElements);

        detailContainer.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    } catch (error) {
        detailContainer.textContent = `Could not load post: ${error.message}`;
    }
}

function showEditForm(post) {
    postBeingEdited = post;

    const titleInput = editPostForm.querySelector('[name="title"]');
    const descriptionInput = editPostForm.querySelector('[name="description"]');

    titleInput.value = post.title;
    descriptionInput.value = post.description;

    editPostMessage.textContent = "";
    editPostView.hidden = false;
    showCreateFormButton.hidden = true;

    postsViewElements.forEach((element) => {
        element.hidden = true;
    });
}

function showDeleteConfirmation(post) {
    postBeingDeleted = post;

    deletePostTitle.textContent = `Are you sure you want to delete "${post.title}"?`;
    deletePostMessage.textContent = "";

    deletePostView.hidden = false;
    showCreateFormButton.hidden = true;

    postsViewElements.forEach((element) => {
        element.hidden = true;
    });
}

async function loadPosts(search = "") {
    const postsContainer = document.querySelector("#posts");
    const url = new URL("https://blog-api-9wsb.onrender.com/post");

        url.searchParams.set("search", search);
        url.searchParams.set("page", currentPage);
        url.searchParams.set("limit", 5);
    

    // Use this URL in fetch:

    postsContainer.textContent = "Loading posts...";

    try {

        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Request failed: ${response.status}`);
        }

        const data = await response.json();

        currentPage = data.currentPage;
        totalPages = data.totalPages;
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        previousButton.disabled = currentPage <= 1;
        nextButton.disabled = currentPage >= totalPages;

        postsContainer.textContent = "";

        if (data.posts.length === 0) {
            postsContainer.textContent = "No posts yet.";
            return;
        }

        data.posts.forEach((post) => {
            const card = document.createElement("article");
            card.className = "post-card";

            const title = document.createElement("h2");
            title.textContent = post.title;

            const description = document.createElement("p");
            description.className = "post-description";

            const fullDescription = post.description || "";
            const previewLength = 120;
            let isExpanded = false;

            const editButton = document.createElement("button");
editButton.textContent = "Edit";
editButton.addEventListener("click", () => {
    showEditForm(post);
});

const deleteButton = document.createElement("button");
deleteButton.textContent = "Delete";
deleteButton.addEventListener("click", () => {
    showDeleteConfirmation(post);
});

            function updateDescription() {
                description.textContent =
                    isExpanded || fullDescription.length <= previewLength
                        ? fullDescription
                        : `${fullDescription.slice(0, previewLength)}...`;
            }

            updateDescription();

            const author = document.createElement("p");
            author.className = "post-author";
            author.textContent = `By ${post.author?.username || "Unknown author"}`;

            const viewButton = document.createElement("button");
            viewButton.textContent = "View post";
            viewButton.addEventListener("click", () => loadPostDetail(post._id));

            card.append(title, description);

            if (fullDescription.length > previewLength) {
                const readMoreButton = document.createElement("button");
                readMoreButton.textContent = "Read more";

                readMoreButton.addEventListener("click", () => {
                    isExpanded = !isExpanded;
                    updateDescription();
                    readMoreButton.textContent = isExpanded ? "Show less" : "Read more";
                });

                card.append(readMoreButton);
            }

            card.append(author, viewButton, editButton, deleteButton);
            postsContainer.appendChild(card);
        });
    } catch (error) {
        const message = document.createElement("p");
        message.className = "error-message";
        message.textContent = `Could not load posts: ${error.message}`;
        postsContainer.replaceChildren(message);
    }
}
const showCreateFormButton = document.querySelector("#show-create-form");
const createPostView = document.querySelector("#create-post-view");
const cancelCreateFormButton = document.querySelector("#cancel-create-form");

const postsViewElements = [
    document.querySelector("#latest-posts"),
    document.querySelector("#search-form"),
    document.querySelector("#post-detail"),
    document.querySelector("#posts"),
    document.querySelector(".pagination")
];


showCreateFormButton.addEventListener("click", () => {
    postsViewElements.forEach((element) => element.hidden = true);
    showCreateFormButton.hidden = true;
    createPostView.hidden = false;
});

cancelCreateFormButton.addEventListener("click", () => {
    createPostView.hidden = true;
    showCreateFormButton.hidden = false;
    postsViewElements.forEach((element) => element.hidden = false);
});

cancelEditFormButton.addEventListener("click", () => {
    editPostView.hidden = true;
    showCreateFormButton.hidden = false;

    postsViewElements.forEach((element) => {
        element.hidden = false;
    });

    postBeingEdited = null;
});

createPostForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    createPostMessage.textContent = "Creating post...";

    const token = localStorage.getItem("token");
    const formData = new FormData(createPostForm);
    const postData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch("https://blog-api-9wsb.onrender.com/post", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(postData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `Request failed: ${response.status}`);
        }

        createPostMessage.textContent = "Post created.";
        createPostView.hidden = true;
        showCreateFormButton.hidden = false;
        postsViewElements.forEach((element) => element.hidden = false);
        currentPage = 1;
        loadPosts(searchInput.value.trim());
    } catch (error) {
        createPostMessage.textContent = `Could not create post: ${error.message}`;
    }
});

editPostForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    editPostMessage.textContent = "Saving changes...";

    const token = localStorage.getItem("token");
    const formData = new FormData(editPostForm);
    const updatedPost = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(
            `https://blog-api-9wsb.onrender.com/post/${postBeingEdited._id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(updatedPost)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `Request failed: ${response.status}`);
        }

        editPostMessage.textContent = "Post updated.";
        editPostView.hidden = true;
        showCreateFormButton.hidden = false;
        postsViewElements.forEach((element) => {
            element.hidden = false;
        });

        postBeingEdited = null;
        loadPosts(searchInput.value.trim());
    } catch (error) {
        editPostMessage.textContent = `Could not update post: ${error.message}`;
    }
});

cancelDeleteButton.addEventListener("click", () => {
    deletePostView.hidden = true;
    showCreateFormButton.hidden = false;

    postsViewElements.forEach((element) => {
        element.hidden = false;
    });

    postBeingDeleted = null;
});

confirmDeleteButton.addEventListener("click", async () => {
    if (!postBeingDeleted) return;

    deletePostMessage.textContent = "Deleting post...";

    const token = localStorage.getItem("token");

    try {
        const response = await fetch(
            `https://blog-api-9wsb.onrender.com/post/${postBeingDeleted._id}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `Request failed: ${response.status}`);
        }

        deletePostMessage.textContent = "Post deleted.";

        deletePostView.hidden = true;
        showCreateFormButton.hidden = false;

        postsViewElements.forEach((element) => {
            element.hidden = false;
        });

        postBeingDeleted = null;
        loadPosts(searchInput.value.trim());
    } catch (error) {
        deletePostMessage.textContent = `Could not delete post: ${error.message}`;
    }
});


previousButton.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        loadPosts(searchInput.value.trim());
    }
});

nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
        currentPage++;
        loadPosts(searchInput.value.trim());
    }
});

loadPosts();
