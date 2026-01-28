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
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("userIsLogged", "true");

    alert("Connexion réussie !");

    // Redirection selon le rôle
    if (user.role === "admin") {
        location.href = "./espace-admin.html";
    } 
    else if (user.role === "employe") {
        location.href = "./espace-employe.html";
    } 
    else {
        location.href = "./espace-utilisateur.html";
    }
});

document.getElementById("btn-reset").addEventListener("click", () => {
    const email = prompt("Entrez votre adresse email :");
    
    if (!email) return;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === email);

    if (!user) {
        alert("Aucun compte trouvé avec cet email.");
        return;
    }

    console.log(`
        EMAIL ENVOYÉ À : ${email}
        Lien de réinitialisation : [simulation]
    `);

    alert("Un lien de réinitialisation a été envoyé à votre adresse email.");
});
