// Vérification du rôle administrateur
const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "admin") {
    alert("Accès réservé à l'administrateur.");
    location.href = "./login.html";
}

// COMMANDES (même code que espace-employe.js)
let commandes = JSON.parse(localStorage.getItem("commandes")) || [];
// Sélecteurs des filtres commandes
const filtreStatut = document.getElementById("filtre-statut");
const filtreClient = document.getElementById("filtre-client");
const listeCommandes = document.getElementById("liste-commandes");

// Sélecteur des avis
const listeAvis = document.getElementById("liste-avis");

// AVIS (même code que espace-employe.js)
let avis = JSON.parse(localStorage.getItem("avis")) || [];

// Utilisateurs (employés)
let users = JSON.parse(localStorage.getItem("users")) || [];
const listeEmployes = document.getElementById("liste-employes");
const btnAjoutEmploye = document.getElementById("btn-ajout-employe");

// Menus
let menus = JSON.parse(localStorage.getItem("menus")) || [];
const listeMenus = document.getElementById("liste-menus");
const btnAjoutMenu = document.getElementById("btn-ajout-menu");

// Plats
let plats = JSON.parse(localStorage.getItem("plats")) || [];
const listePlats = document.getElementById("liste-plats");
const btnAjoutPlat = document.getElementById("btn-ajout-plat");

// Horaires
let horaires = JSON.parse(localStorage.getItem("horaires")) || [];
const listeHoraires = document.getElementById("liste-horaires");
const btnAjoutHoraire = document.getElementById("btn-ajout-horaire");

// AFFICHAGE EMPLOYÉS
function afficherEmployes() {
    listeEmployes.innerHTML = "";

    const employes = users.filter(u => u.role === "employe");

    if (employes.length === 0) {
        listeEmployes.innerHTML = "<p>Aucun employé enregistré.</p>";
        return;
    }

    employes.forEach(emp => {
        const li = document.createElement("li");

        li.innerHTML = `
            <strong>${emp.fullname}</strong><br>
            Email : ${emp.email}<br>
            Téléphone : ${emp.gsm}<br>
            Statut : <strong>${emp.suspendu ? "EN SUSPENS" : "Actif"}</strong><br>
            <button class="btn-suspend" data-id="${emp.id}">
                ${emp.suspendu ? "Réactiver" : "Suspendre"}
            </button>
            <button class="btn-supprimer" data-id="${emp.id}">Supprimer</button>
        `;

        listeEmployes.appendChild(li);
    });
}

afficherEmployes();

// CRÉATION EMPLOYÉ
btnAjoutEmploye.addEventListener("click", () => {
    const fullname = prompt("Nom et Prénom de l'employé :");
    const email = prompt("Email de l'employé :");
    const gsm = prompt("Numéro de téléphone :");
    const password = prompt("Mot de passe temporaire :");

    if (!fullname || !email || !gsm || !password) {
        alert("Tous les champs sont obligatoires.");
        return;
    }

    const nouvelEmploye = {
        id: "EMP-" + Date.now(),
        fullname,
        email,
        gsm,
        password,
        role: "employe",
        suspendu: false
    };

    users.push(nouvelEmploye);
    localStorage.setItem("users", JSON.stringify(users));

    alert(
        "Employé créé avec succès !\n\n" +
        "Un email a été envoyé à " + email + ".\n" +
        "Bonjour " + fullname + ", votre compte employé a été créé. " +
        "Vous devez contacter Julie ou José pour obtenir votre mot de passe définitif. " +
        "L'équipe Vite & Gourmand vous souhaite la bienvenue au sein de son équipe. Bonne journée."
    );

    afficherEmployes();
});

// AFFICHAGE MENUS
function afficherMenus() {
    listeMenus.innerHTML = "";

    if (menus.length === 0) {
        listeMenus.innerHTML = "<p>Aucun menu enregistré.</p>";
        return;
    }

    menus.forEach(menu => {
        const li = document.createElement("li");

        li.innerHTML = `
            <strong>${menu.nom}</strong><br>
            ${menu.description}<br>
            Prix : ${menu.prix} €<br>
            <button class="btn-modifier-menu" data-id="${menu.id}">Modifier</button>
            <button class="btn-supprimer-menu" data-id="${menu.id}">Supprimer</button>
        `;

        listeMenus.appendChild(li);
    });
}

afficherMenus();

// CRÉATION MENU
btnAjoutMenu.addEventListener("click", () => {
    const nom = prompt("Nom du menu :");
    if (!nom || nom.trim() === "") {
        alert("Le nom du menu est obligatoire.");
        return;
    }

    const description = prompt("Description :");
    if (!description || description.trim() === "") {
        alert("La description est obligatoire.");
        return;
    }

    const prixStr = prompt("Prix :");
    const prix = parseFloat(prixStr);
    
    if (!prixStr || isNaN(prix) || prix <= 0) {
        alert("Le prix doit être un nombre valide supérieur à 0.");
        return;
    }

    menus.push({
        id: "MENU-" + Date.now(),
        nom: nom.trim(),
        description: description.trim(),
        prix: prix
    });

    localStorage.setItem("menus", JSON.stringify(menus));
    afficherMenus();
    alert("Menu créé avec succès !");
});

// AFFICHAGE DES PLATS
function afficherPlats() {
    listePlats.innerHTML = "";

    if (plats.length === 0) {
        listePlats.innerHTML = "<p>Aucun plat enregistré.</p>";
        return;
    }

    plats.forEach(plat => {
        const li = document.createElement("li");
        li.classList.add("admin-item");

        li.innerHTML = `
            <div class="admin-item-info">
                <strong>${plat.nom}</strong>
                <span>${plat.description}</span>
            </div>

            <div class="admin-actions">
                <button class="btn-action btn-modifier-plat" data-id="${plat.id}">Modifier</button>
                <button class="btn-danger btn-supprimer-plat" data-id="${plat.id}">Supprimer</button>
            </div>
        `;

        listePlats.appendChild(li);
    });
}

afficherPlats();

// CRÉATION PLAT
btnAjoutPlat.addEventListener("click", () => {
    // 1. Entrée
    const nomEntree = prompt("Nom de l'entrée (laisser vide si aucun) :");
    if (nomEntree) {
        const descEntree = prompt("Description:");
        plats.push({
            id: "PLAT-" + Date.now(),
            nom: nomEntree,
            description: descEntree
        });
    }

    // 2. Plat principal
    const nomPlat = prompt("Nom du plat principal (laisser vide si aucun) :");
    if (nomPlat) {
        const descPlat = prompt("Description du plat principal :");
        plats.push({
            id: "PLAT-" + (Date.now() + 1),
            nom: nomPlat,
            description: descPlat
        });
    }

    // 3. Dessert
    const nomDessert = prompt("Nom du dessert (laisser vide si aucun) :");
    if (nomDessert) {
        const descDessert = prompt("Description du dessert :");
        plats.push({
            id: "PLAT-" + (Date.now() + 2),
            nom: nomDessert,
            description: descDessert
        });
    }

    localStorage.setItem("plats", JSON.stringify(plats));
    afficherPlats();
    alert("Plat(s) ajouté(s) avec succès !");
});

// AFFICHAGE HORAIRES
function afficherHoraires() {
    listeHoraires.innerHTML = "";

    if (horaires.length === 0) {
        listeHoraires.innerHTML = "<p>Aucun horaire enregistré.</p>";
        return;
    }

    horaires.forEach(h => {
        const li = document.createElement("li");

        li.innerHTML = `
            <strong>${h.jour}</strong> : ${h.ouverture} - ${h.fermeture}<br>
            <button class="btn-modifier-horaire" data-id="${h.id}">Modifier</button>
            <button class="btn-supprimer-horaire" data-id="${h.id}">Supprimer</button>
        `;

        listeHoraires.appendChild(li);
    });
}

afficherHoraires();

// CRÉATION HORAIRE
btnAjoutHoraire.addEventListener("click", () => {
    const jour = prompt("Jour (ex : Lundi) :");
    const ouverture = prompt("Heure d'ouverture (ex : 09:00) :");
    const fermeture = prompt("Heure de fermeture (ex : 18:00) :");

    if (!jour || !ouverture || !fermeture) {
        alert("Tous les champs sont obligatoires.");
        return;
    }

    horaires.push({
        id: "HORAIRE-" + Date.now(),
        jour,
        ouverture,
        fermeture
    });

    localStorage.setItem("horaires", JSON.stringify(horaires));
    afficherHoraires();
});

// CLIC GLOBAL : EMPLOYÉS / MENUS / PLATS / HORAIRES / COMMANDES / AVIS
document.addEventListener("click", (e) => {
    const id = e.target.dataset.id;

    // --- EMPLOYÉS : SUSPENSION / RÉACTIVATION ---
    if (e.target.classList.contains("btn-suspend")) {
        users = users.map(u => {
            if (u.id === id) {
                u.suspendu = !u.suspendu;
            }
            return u;
        });
        localStorage.setItem("users", JSON.stringify(users));
        afficherEmployes();
    }

    // --- EMPLOYÉS : SUPPRESSION ---
    if (e.target.classList.contains("btn-supprimer")) {
        if (confirm("Supprimer cet employé ?")) {
            users = users.filter(u => u.id !== id);
            localStorage.setItem("users", JSON.stringify(users));
            afficherEmployes();
        }
    }

    // --- MENUS : SUPPRESSION ---
    if (e.target.classList.contains("btn-supprimer-menu")) {
        if (confirm("Supprimer ce menu ?")) {
            menus = menus.filter(m => m.id !== id);
            localStorage.setItem("menus", JSON.stringify(menus));
            afficherMenus();
        }
    }

    // --- MENUS : MODIFICATION ---
    if (e.target.classList.contains("btn-modifier-menu")) {
        const menu = menus.find(m => m.id === id);
        if (!menu) return;

        const nom = prompt("Nom du menu :", menu.nom);
        const description = prompt("Description :", menu.description);
        const prix = prompt("Prix :", menu.prix);

        if (!nom || !description || !prix) {
            alert("Tous les champs sont obligatoires.");
            return;
        }

        menu.nom = nom;
        menu.description = description;
        menu.prix = parseFloat(prix);

        localStorage.setItem("menus", JSON.stringify(menus));
        afficherMenus();
    }

    // --- PLATS : SUPPRESSION ---
    if (e.target.classList.contains("btn-supprimer-plat")) {
        if (confirm("Supprimer ce plat ?")) {
            plats = plats.filter(p => p.id !== id);
            localStorage.setItem("plats", JSON.stringify(plats));
            afficherPlats();
        }
    }

    // --- PLATS : MODIFICATION ---
    if (e.target.classList.contains("btn-modifier-plat")) {
        const plat = plats.find(p => p.id === id);
        if (!plat) return;

        const nom = prompt("Nom du plat :", plat.nom);
        const description = prompt("Description :", plat.description);

        if (!nom || !description) {
            alert("Tous les champs sont obligatoires.");
            return;
        }

        plat.nom = nom;
        plat.description = description;

        localStorage.setItem("plats", JSON.stringify(plats));
        afficherPlats();
    }

    // --- HORAIRES : SUPPRESSION ---
    if (e.target.classList.contains("btn-supprimer-horaire")) {
        if (confirm("Supprimer cet horaire ?")) {
            horaires = horaires.filter(h => h.id !== id);
            localStorage.setItem("horaires", JSON.stringify(horaires));
            afficherHoraires();
        }
    }

    // --- HORAIRES : MODIFICATION ---
    if (e.target.classList.contains("btn-modifier-horaire")) {
        const h = horaires.find(h => h.id === id);
        if (!h) return;

        const jour = prompt("Jour :", h.jour);
        const ouverture = prompt("Heure d'ouverture :", h.ouverture);
        const fermeture = prompt("Heure de fermeture :", h.fermeture);

        if (!jour || !ouverture || !fermeture) {
            alert("Tous les champs sont obligatoires.");
            return;
        }

        h.jour = jour;
        h.ouverture = ouverture;
        h.fermeture = fermeture;

        localStorage.setItem("horaires", JSON.stringify(horaires));
        afficherHoraires();
    }

    // --- COMMANDES : ANNULATION ---
    if (e.target.classList.contains("btn-annuler")) {
        const commande = commandes.find(cmd => cmd.id === id);
        if (!commande) return;

        const contact = prompt("Mode de contact utilisé pour prévenir le client (appel, mail...) :");
        if (!contact) {
            alert("Annulation annulée : vous devez spécifier le mode de contact.");
            return;
        }

        const motif = prompt("Motif de l'annulation :");
        if (!motif) {
            alert("Annulation annulée : vous devez spécifier un motif.");
            return;
        }

        commande.historique = commande.historique || [];
        commande.historique.push({
            date: new Date().toISOString(),
            action: `Commande annulée (${contact}) : ${motif}`
        });

        commande.statut = "annulée";
        localStorage.setItem("commandes", JSON.stringify(commandes));
        afficherCommandes();

        alert("Commande annulée avec succès !");
    }

    // --- AVIS : VALIDATION ---
    if (e.target.classList.contains("btn-valider-avis")) {
        avis = avis.map(a => a.id === id ? { ...a, statut: "validé" } : a);
        localStorage.setItem("avis", JSON.stringify(avis));
        afficherAvis();
    }

    // --- AVIS : REFUS ---
    if (e.target.classList.contains("btn-refuser-avis")) {
        avis = avis.filter(a => a.id !== id);
        localStorage.setItem("avis", JSON.stringify(avis));
        afficherAvis();
    }
});

// --------------------------  SECTION FILTRAGE COMMANDES  ------------------------------
function afficherCommandes() {
    listeCommandes.innerHTML = "";

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const recherche = filtreClient.value.toLowerCase();
    const statutFiltre = filtreStatut.value;

    // Filtrage des commandes
    const commandesFiltrees = commandes.filter(cmd => {
        const client = users.find(u => u.id === cmd.userId);
        
        const matchStatut = statutFiltre === "" || cmd.statut === statutFiltre;
        const matchNom = client ? client.fullname.toLowerCase().includes(recherche) : false;
        
        return matchStatut && matchNom;
    });

    // Affichage si aucune commande
    if (commandesFiltrees.length === 0) {
        listeCommandes.innerHTML = "<p>Aucune commande trouvée.</p>";
        return;
    }

    // Affichage des commandes filtrées
    commandesFiltrees.forEach(cmd => {
        const client = users.find(u => u.id === cmd.userId);
        const li = document.createElement("li");
        li.classList.add("admin-item");

        li.innerHTML = `
            <div class="admin-item-info">
                <strong>Commande #${cmd.id}</strong>
                <span>Client : ${client ? client.fullname : "Inconnu"}</span>
                <span>Menu : ${cmd.menuTitre}</span>
                <span>Nombre de personnes : ${cmd.nbPersonnes}</span>
                <span>Prix total : ${cmd.prixTotal} €</span>
                <span>Prestation : ${cmd.datePrestation} à ${cmd.heurePrestation}</span>
                <span>Adresse : ${cmd.adresse}, ${cmd.cp}, ${cmd.ville}</span>
                <span>Téléphone : ${cmd.telephone}</span>
                <span>Statut actuel : <strong>${cmd.statut}</strong></span>
                ${cmd.materiel ? '<span style="color:red;">⚠️ Matériel en prêt</span>' : ''}
            </div>

            <div class="admin-actions">
                <select class="select-statut" data-id="${cmd.id}">
                    <option value="">Changer statut</option>
                    <option value="accepté">Accepté</option>
                    <option value="en préparation">En préparation</option>
                    <option value="en cours de livraison">En cours de livraison</option>
                    <option value="livré">Livré</option>
                    <option value="terminée">Terminée</option>
                    ${cmd.materiel ? '<option value="en attente du retour de matériel">Retour matériel</option>' : ''}
                </select>

                <button class="btn-danger btn-annuler" data-id="${cmd.id}">
                    Annuler
                </button>
            </div>
        `;

        listeCommandes.appendChild(li);
    });
}

// Event listener pour le filtre par statut
filtreStatut.addEventListener("change", afficherCommandes);

// Event listener pour le filtre par nom de client
filtreClient.addEventListener("input", afficherCommandes);

// CHANGEMENT DE STATUT COMMANDE
document.addEventListener("change", (e) => {
    if (e.target.classList.contains("select-statut")) {
        const id = e.target.dataset.id;
        const commande = commandes.find(cmd => cmd.id === id);
        if (!commande) return;

        const nouveauStatut = e.target.value;
        if (!nouveauStatut) return;

        commande.statut = nouveauStatut;

        // Alerte spécifique pour le retour de matériel
        if (nouveauStatut === "en attente du retour de matériel") {
            alert(`Email envoyé :
Objet : Retour de matériel
Bonjour,
Vous avez 10 jours pour restituer le matériel. Sinon, 600€ de frais seront appliqués.
Cordialement, L'équipe Vite & Gourmand`);
        }

        localStorage.setItem("commandes", JSON.stringify(commandes));
        afficherCommandes();
    }
});

// GESTION DES AVIS
function afficherAvis() {
    listeAvis.innerHTML = "";
    const avisEnAttente = avis.filter(a => a.statut === "en attente");

    if (avisEnAttente.length === 0) {
        listeAvis.innerHTML = "<p>Aucun avis en attente.</p>";
        return;
    }

    avisEnAttente.forEach(a => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${a.nomClient}</strong><br>
            Note : ${a.note}/5<br>
            "${a.commentaire}"<br>
            <button class="btn-valider-avis" data-id="${a.id}">Valider</button>
            <button class="btn-refuser-avis" data-id="${a.id}">Refuser</button>
        `;
        listeAvis.appendChild(li);
    });
}




// AFFICHAGE INITIAL
afficherCommandes();
afficherAvis();