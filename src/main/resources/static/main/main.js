        document.getElementById("userForm").addEventListener("submit", async function(e) {
            e.preventDefault();

            const user = {
                username: document.getElementById("username").value,
                email: document.getElementById("email").value,
                password: document.getElementById("password").value
            };

            const response = await fetch("/user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            });

            const result = await response.json();
            alert("등록 성공: " + result.id);
        });

        async function loadUsers() {
            const response = await fetch("/user");
            const users = await response.json();

            const list = document.getElementById("userList");
            list.innerHTML = "";

            users.forEach(user => {
                const li = document.createElement("li");
                li.textContent = `${user.id} | ${user.username} | ${user.email}`;
                list.appendChild(li);
            });
        }