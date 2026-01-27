const form = document.getElementById("register-form");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const fullname = document.getElementById("fullname").value.trim();
    const gsm = document.getElementById("gsm").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();
    const password = document.getElementById("password").value.trim();

    const regexPassword =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;

    if (!regexPassword.test(password)) {
        alert("Le mot de passe ne respecte pas les critères de sécurité.");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.some(u => u.email === email)) {
        alert("Un compte existe déjà avec cet email.");
        return;
    }

    const newUser = {
        id: "USR-" + Date.now(),
        fullname,
        gsm,
        email,
        address,
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

    const pendingMenu = localStorage.getItem("pendingMenu");

    if (pendingMenu) {
        localStorage.removeItem("pendingMenu");
        location.href = `./commande.html?id=${pendingMenu}`;
    } else {
        location.href = "./index.html";
    }
});
