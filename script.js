document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "https://bekeyzo.pythonanywhere.com";

    const adviceForm = document.getElementById("adviceForm");
    const adviceList = document.getElementById("adviceList");
    const formMessage = document.getElementById("formMessage");

    async function fetchAdvice() {
        try {
            const response = await fetch(`${API_URL}/comments`);
            const result = await response.json();

            adviceList.innerHTML = "";

            result.data.comments.forEach((comment) => {
                const card = document.createElement("div");
                card.className = "advice-card";

                card.innerHTML = `
                    <p class="advice-text">"${comment.advice}"</p>
                    <p class="advice-author">- ${comment.name}</p>
                    <p class="advice-role">${comment.role || "Visitor"}</p>

                    ${
                        comment.social_link
                            ? `<a href="${comment.social_link}" target="_blank">View profile</a>`
                            : ""
                    }

                    <button onclick="deleteAdvice(${comment.id})">
                        Delete
                    </button>

                    <button onclick='editAdvice(${JSON.stringify(comment)})'>
                        Edit
                    </button>
                `;

                adviceList.appendChild(card);
            });

        } catch (error) {
            formMessage.textContent = "Could not load advice.";
            formMessage.className = "error-message";
        }
    }

    adviceForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitButton = adviceForm.querySelector("button");

        const data = {
            name: document.getElementById("name").value.trim(),
            role: document.getElementById("role").value.trim(),
            social_link: document.getElementById("social_link").value.trim(),
            advice: document.getElementById("advice").value.trim()
        };

        if (data.name.length < 2) {
            formMessage.textContent = "Name must be at least 2 characters.";
            formMessage.className = "error-message";
            return;
        }

        if (data.advice.length < 10) {
            formMessage.textContent = "Advice must be at least 10 characters.";
            formMessage.className = "error-message";
            return;
        }

        if (
            data.social_link &&
            !data.social_link.startsWith("http://") &&
            !data.social_link.startsWith("https://")
        ) {
            formMessage.textContent = "Social link must start with http:// or https://";
            formMessage.className = "error-message";
            return;
        }

        submitButton.textContent = "Submitting...";
        submitButton.disabled = true;

        try {
            const response = await fetch(`${API_URL}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                formMessage.textContent = result.message || "Something went wrong.";
                formMessage.className = "error-message";
                return;
            }

            formMessage.textContent = "Advice submitted successfully.";
            formMessage.className = "success-message";

            adviceForm.reset();
            fetchAdvice();

        } catch (error) {
            formMessage.textContent = "Network error. Please try again.";
            formMessage.className = "error-message";

        } finally {
            submitButton.textContent = "Submit Advice";
            submitButton.disabled = false;
        }
    });

    window.deleteAdvice = async function (id) {
        const confirmDelete = confirm("Are you sure you want to delete this advice?");

        if (!confirmDelete) {
            return;
        }

        await fetch(`${API_URL}/comments/${id}`, {
            method: "DELETE"
        });

        formMessage.textContent = "Advice deleted successfully.";
        formMessage.className = "success-message";

        fetchAdvice();
    };

    window.editAdvice = async function (comment) {
        const updatedName = prompt("Edit name:", comment.name);
        const updatedRole = prompt("Edit role:", comment.role || "");
        const updatedSocialLink = prompt("Edit social link:", comment.social_link || "");
        const updatedAdvice = prompt("Edit advice:", comment.advice);

        if (!updatedName || !updatedAdvice) {
            formMessage.textContent = "Name and advice cannot be empty.";
            formMessage.className = "error-message";
            return;
        }

        const data = {
            name: updatedName.trim(),
            role: updatedRole.trim(),
            social_link: updatedSocialLink.trim(),
            advice: updatedAdvice.trim()
        };

        if (data.name.length < 2) {
            formMessage.textContent = "Name must be at least 2 characters.";
            formMessage.className = "error-message";
            return;
        }

        if (data.advice.length < 10) {
            formMessage.textContent = "Advice must be at least 10 characters.";
            formMessage.className = "error-message";
            return;
        }

        if (
            data.social_link &&
            !data.social_link.startsWith("http://") &&
            !data.social_link.startsWith("https://")
        ) {
            formMessage.textContent = "Social link must start with http:// or https://";
            formMessage.className = "error-message";
            return;
        }

        const response = await fetch(`${API_URL}/comments/${comment.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            formMessage.textContent = result.message || "Update failed.";
            formMessage.className = "error-message";
            return;
        }

        formMessage.textContent = "Advice updated successfully.";
        formMessage.className = "success-message";

        fetchAdvice();
    };

    fetchAdvice();
});