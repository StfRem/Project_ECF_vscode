const form = document.getElementById("register-form");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    // 1. RÉCUPÉRATION DES VALEURS
    const fullname = document.getElementById("fullname").value.trim();
    const gsm = document.getElementById("gsm").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();
    const password = document.getElementById("password").value.trim();
    const cp = document.getElementById("cp").value.trim();

    // 2. TES SÉCURITÉS (REGEX)
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexGSM = /^(0[67]\d{8}|(\+33|0033)[67]\d{8})$/;

    // Alertes détaillées comme dans ton ancien fichier
    if (!regexEmail.test(email)) {
        alert("Format d'email invalide.");
        return;
    }

    if (!regexGSM.test(gsm)) {
        alert("Numéro GSM invalide. Format attendu : 06xxxxxxxx ou 07xxxxxxxx");
        return;
    }

    if (!regexPassword.test(password)) {
        alert("Le mot de passe ne respecte pas les critères de sécurité :\n- 10 caractères min\n- 1 Majuscule\n- 1 minuscule\n- 1 chiffre\n- 1 caractère spécial");
        return;
    }

    // 3. PRÉPARATION DE L'OBJET POUR LE SERVEUR
    const newUser = {
        id: "USR-" + Date.now(),
        fullname,
        gsm,
        email,
        address,
        cp,
        password, // Sera haché par le PHP
        role: "utilisateur"
    };

    // 4. ENVOI À WAMP (PHP/SQL)
    fetch('./php/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
    })
    .then(response => response.json())
    .then(data => {
        // On vérifie si l'enregistrement SQL est réussi
        if (data.status === "success" || (data.message && data.message.includes("succès"))) {
            
            // Tes alertes de succès d'origine
            alert("Compte créé avec succès ! Rôle attribué : utilisateur");
            alert(`EMAIL BIENVENUE ENVOYÉ À : ${email}\nObjet : Bienvenue !\nBonjour ${fullname}, votre compte a était créer!`);

            // Gestion de la session
            localStorage.setItem("userIsLogged", "true");
            localStorage.setItem("user", JSON.stringify(newUser));

            // Redirection intelligente
            const pendingMenu = localStorage.getItem("pendingMenu");
            if (pendingMenu) {
                localStorage.removeItem("pendingMenu");
                window.location.href = `./commande.html?id=${pendingMenu}`;
            } else {
                window.location.href = "./index.html";
            }
        } else {
            // Si le PHP renvoie une erreur (ex: email déjà pris)
            alert("Erreur serveur : " + data.message);
        }
    })
    .catch(error => {
        console.error("Erreur technique :", error);
        alert("Impossible de contacter le serveur PHP. Vérifiez WAMP.");
    });
});