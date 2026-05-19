document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "https://bekeyzo.pythonanywhere.com";

    const adviceForm = document.getElementById("adviceForm");
    const adviceList = document.getElementById("adviceList");

    async function fetchAdvice() {
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
    }

    adviceForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const data = {
            name: document.getElementById("name").value,
            role: document.getElementById("role").value,
            social_link: document.getElementById("social_link").value,
            advice: document.getElementById("advice").value
        };

        await fetch(`${API_URL}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        adviceForm.reset();
        fetchAdvice();
    });

    window.deleteAdvice = async function (id) {
        await fetch(`${API_URL}/comments/${id}`, {
            method: "DELETE"
        });

        fetchAdvice();
    };

    window.editAdvice = async function (comment) {
        const updatedName = prompt("Edit name:", comment.name);
        const updatedRole = prompt("Edit role:", comment.role || "");
        const updatedSocialLink = prompt("Edit social link:", comment.social_link || "");
        const updatedAdvice = prompt("Edit advice:", comment.advice);

        if (!updatedName || !updatedAdvice) {
            return;
        }

        await fetch(`${API_URL}/comments/${comment.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: updatedName,
                role: updatedRole,
                social_link: updatedSocialLink,
                advice: updatedAdvice
            })
        });

        fetchAdvice();
    };

    fetchAdvice();
});