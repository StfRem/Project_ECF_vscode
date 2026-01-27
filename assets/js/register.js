// Sélection du formulaire
const form = document.getElementById("register-form");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Récupération des champs
    const fullname = document.getElementById("fullname").value.trim();
    const gsm = document.getElementById("gsm").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();
    const password = document.getElementById("password").value.trim();

    // Vérification du mot de passe
    const regexPassword =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;

    if (!regexPassword.test(password)) {
        alert("Le mot de passe ne respecte pas les critères de sécurité.");
        return;
    }

    // Création de l'objet utilisateur
    const user = {
        fullname,
        gsm,
        email,
        address,
        password,
        role: "utilisateur" // rôle imposé par le cahier des charges
    };

    // Sauvegarde dans localStorage
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("userIsLogged", "true");

    alert("Compte créé avec succès ! Rôle attribué : utilisateur");

    // Vérifier si un menu était en attente
    const pendingMenu = localStorage.getItem("pendingMenu");

    if (pendingMenu) {
        localStorage.removeItem("pendingMenu");
        location.href = `./commande.html?id=${pendingMenu}`;
    } else {
        location.href = "./index.html";
    }
});
