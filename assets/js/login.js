// ---------------------------------------------------------
// Connexion utilisateur
// ---------------------------------------------------------
const form = document.getElementById("login-form");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Récupération des comptes existants
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Vérification utilisateur
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        alert("Email ou mot de passe incorrect.");
        return;
    }

    // Sauvegarde de l'utilisateur connecté
    localStorage.setItem("userConnecte", JSON.stringify(user));
    localStorage.setItem("userIsLogged", "true");

    alert("Connexion réussie !");
    location.href = "./index.html"; // ou espace utilisateur
});
