const form = document.getElementById("register-form");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const fullname = document.getElementById("fullname").value.trim();
    const gsm = document.getElementById("gsm").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();
    const password = document.getElementById("password").value.trim();
    const cp = document.getElementById("cp").value.trim();

    // -----------------------------
    // VALIDATIONS
    // -----------------------------

    const regexPassword =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // GSM FR : 06xxxxxxxx / 07xxxxxxxx / +336xxxxxxxx / 00336xxxxxxxx
    const regexGSM = /^(0[67]\d{8}|(\+33|0033)[67]\d{8})$/;

    if (!regexEmail.test(email)) {
        alert("Format d'email invalide.");
        return;
    }

    if (!regexGSM.test(gsm)) {
        alert("Numéro GSM invalide. Format attendu : 06xxxxxxxx ou 07xxxxxxxx");
        return;
    }

    if (!regexPassword.test(password)) {
        alert("Le mot de passe ne respecte pas les critères de sécurité.");
        return;
    }

    // -----------------------------
    // VÉRIFICATION DOUBLON EMAIL
    // -----------------------------
    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.some(u => u.email === email)) {
        alert("Un compte existe déjà avec cet email.");
        return;
    }

    // -----------------------------
    // CRÉATION DU COMPTE
    // -----------------------------
    const newUser = {
        id: "USR-" + Date.now(),
        fullname,
        gsm,
        email,
        address,
        cp,
        password,
        role: "utilisateur"
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Compte créé avec succès ! Rôle attribué : utilisateur");

    console.log(`
        EMAIL ENVOYÉ À : ${email}
        Objet : Bienvenue !
        Message :
        Bonjour ${fullname},
        Bienvenue sur notre plateforme !
    `);

    alert("Un email de bienvenue vous a été envoyé !");

    /*Function pour dire que je suis maintenant connecté*/
    localStorage.setItem("userIsLogged", "true");  // ← Indique que l'utilisateur est connecté
    localStorage.setItem("user", JSON.stringify(newUser));  // ← garde les infos du nouvel utilisateur


    // REDIRECTION SI COMMANDE EN ATTENTE
    const pendingMenu = localStorage.getItem("pendingMenu");

    if (pendingMenu) {
        localStorage.removeItem("pendingMenu");
        location.href = `./commande.html?id=${pendingMenu}`;
    } else {
        location.href = "./index.html";
    }
});
