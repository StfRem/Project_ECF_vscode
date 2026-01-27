// ---------------------------------------------------------
// Vérification du rôle employé
// ---------------------------------------------------------
const user = JSON.parse(localStorage.getItem("user"));

if (!user || user.role !== "employe") {
    alert("Accès réservé au personnel.");
    location.href = "./login.html";
}

// ---------------------------------------------------------
// Chargement des commandes
// ---------------------------------------------------------
let commandes = JSON.parse(localStorage.getItem("commandes")) || [];

const liste = document.getElementById("liste-commandes");
const filtreStatut = document.getElementById("filtre-statut");
const filtreClient = document.getElementById("filtre-client");

// ---------------------------------------------------------
// Chargement des menus
// ---------------------------------------------------------
let menus = JSON.parse(localStorage.getItem("menus")) || [];
const listeMenus = document.getElementById("liste-menus");

// ---------------------------------------------------------
// Chargement des plats
// ---------------------------------------------------------
let plats = JSON.parse(localStorage.getItem("plats")) || [];
const listePlats = document.getElementById("liste-plats");

// ---------------------------------------------------------
// Chargement des horaires
// ---------------------------------------------------------
let horaires = JSON.parse(localStorage.getItem("horaires")) || [];
const listeHoraires = document.getElementById("liste-horaires");


// ---------------------------------------------------------
// Affichage des menus
// ---------------------------------------------------------
function afficherMenus() {
    listeMenus.innerHTML = "";

    if (menus.length === 0) {
        listeMenus.innerHTML = "<p>Aucun menu enregistré.</p>";
        return;
    }

    menus.forEach(menu => {
        const li = document.createElement("li");
        li.classList.add("admin-item");

        li.innerHTML = `
            <div class="admin-item-info">
                <strong>${menu.nom || menu.titre}</strong>
                <span>${menu.description || ""}</span>
                <span>Prix : ${menu.prix} €</span>
                <span>Matériel : ${menu.materiel ? "Oui" : "Non"}</span>
            </div>

            <div class="admin-actions">
                <button class="btn-action btn-modifier-menu" data-id="${menu.id}">Modifier</button>
                <button class="btn-danger btn-supprimer-menu" data-id="${menu.id}">Supprimer</button>
            </div>
        `;

        listeMenus.appendChild(li);
    });
}

afficherMenus();


// ---------------------------------------------------------
// Affichage des plats
// ---------------------------------------------------------
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
                <span>Prix : ${plat.prix} €</span>
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


// ---------------------------------------------------------
// Affichage des horaires
// ---------------------------------------------------------
function afficherHoraires() {
    listeHoraires.innerHTML = "";

    if (horaires.length === 0) {
        listeHoraires.innerHTML = "<p>Aucun horaire enregistré.</p>";
        return;
    }

    horaires.forEach(h => {
        const li = document.createElement("li");
        li.classList.add("admin-item");

        li.innerHTML = `
            <div class="admin-item-info">
                <strong>${h.jour}</strong>
                <span>${h.ouverture} - ${h.fermeture}</span>
            </div>

            <div class="admin-actions">
                <button class="btn-action btn-modifier-horaire" data-id="${h.id}">Modifier</button>
                <button class="btn-danger btn-supprimer-horaire" data-id="${h.id}">Supprimer</button>
            </div>
        `;

        listeHoraires.appendChild(li);
    });
}

afficherHoraires();

// ---------------------------------------------------------
// Affichage des commandes (VERSION PRO)
// ---------------------------------------------------------
function afficherCommandes() {
    liste.innerHTML = "";

    const recherche = filtreClient.value.toLowerCase();
    const statutFiltre = filtreStatut.value;

    const commandesFiltrees = commandes.filter(cmd => {
        const matchStatut = statutFiltre === "" || cmd.statut === statutFiltre;
        const matchClient =
            cmd.telephone.toLowerCase().includes(recherche) ||
            cmd.ville.toLowerCase().includes(recherche) ||
            cmd.menuTitre.toLowerCase().includes(recherche);

        return matchStatut && matchClient;
    });

    if (commandesFiltrees.length === 0) {
        liste.innerHTML = "<p>Aucune commande trouvée.</p>";
        return;
    }

    commandesFiltrees.forEach(cmd => {
        const li = document.createElement("li");
        li.classList.add("admin-item");

        li.innerHTML = `
            <div class="admin-item-info">
                <strong>${cmd.menuTitre}</strong>
                <span>Commande : ${cmd.id}</span>
                <span>Client : ${cmd.telephone}</span>
                <span>Prestation : ${cmd.datePrestation} à ${cmd.heurePrestation}</span>
                <span>Matériel : ${cmd.materiel ? "Oui" : "Non"}</span>
                <span>Statut actuel : <strong>${cmd.statut}</strong></span>
            </div>

            <div class="admin-actions">
                <select class="select-statut" data-id="${cmd.id}">
                    <option value="">Changer statut</option>
                    <option value="accepté">Accepté</option>
                    <option value="en préparation">En préparation</option>
                    <option value="en cours de livraison">En cours de livraison</option>
                    <option value="livré">Livré</option>
                    <option value="terminée">Terminée</option>
                    ${cmd.materiel ? `<option value="en attente du retour de matériel">En attente du retour de matériel</option>` : ""}
                </select>

                <button class="btn-danger btn-annuler" data-id="${cmd.id}">
                    Annuler
                </button>
            </div>
        `;

        liste.appendChild(li);
    });
}

afficherCommandes();


// ---------------------------------------------------------
// Mise à jour du statut (VERSION PRO)
// ---------------------------------------------------------
document.addEventListener("change", (e) => {
    if (!e.target.classList.contains("select-statut")) return;

    const id = e.target.dataset.id;
    const nouveauStatut = e.target.value;

    commandes = commandes.map(cmd => {
        if (cmd.id === id) {
            cmd.statut = nouveauStatut;
            cmd.historique.push({
                date: new Date().toISOString(),
                action: "Statut modifié : " + nouveauStatut
            });
        }
        return cmd;
    });

    localStorage.setItem("commandes", JSON.stringify(commandes));
    afficherCommandes();
});


// ---------------------------------------------------------
// Gestion des clics (menus + plats + horaires + annulation)
// ---------------------------------------------------------
document.addEventListener("click", (e) => {

    // --- ANNULATION COMMANDE ---
    if (e.target.classList.contains("btn-annuler")) {
        const id = e.target.dataset.id;

        const contact = prompt("Mode de contact (appel / mail) :");
        if (!contact || (contact !== "appel" && contact !== "mail")) {
            alert("Vous devez indiquer 'appel' ou 'mail'.");
            return;
        }

        const motif = prompt("Motif d'annulation (obligatoire) :");
        if (!motif) {
            alert("Annulation impossible sans motif.");
            return;
        }

        commandes = commandes.map(cmd => {
            if (cmd.id === id) {
                cmd.statut = "annulée";
                cmd.historique.push({
                    date: new Date().toISOString(),
                    action: `Commande annulée (${contact}) : ${motif}`
                });
            }
            return cmd;
        });

        localStorage.setItem("commandes", JSON.stringify(commandes));
        afficherCommandes();
    }


    // --- SUPPRESSION MENU ---
    if (e.target.classList.contains("btn-supprimer-menu")) {
        const id = e.target.dataset.id;

        if (confirm("Supprimer ce menu ?")) {
            menus = menus.filter(m => m.id !== id);
            localStorage.setItem("menus", JSON.stringify(menus));
            afficherMenus();
        }
    }

    // --- MODIFICATION MENU ---
    if (e.target.classList.contains("btn-modifier-menu")) {
        const id = e.target.dataset.id;
        const menu = menus.find(m => m.id === id);

        const nouveauNom = prompt("Nom du menu :", menu.nom);
        const nouvelleDescription = prompt("Description :", menu.description);
        const nouveauPrix = prompt("Prix :", menu.prix);

        if (!nouveauNom || !nouvelleDescription || !nouveauPrix) {
            alert("Tous les champs sont obligatoires.");
            return;
        }

        menu.nom = nouveauNom;
        menu.description = nouvelleDescription;
        menu.prix = parseFloat(nouveauPrix);

        localStorage.setItem("menus", JSON.stringify(menus));
        afficherMenus();
    }


    // --- SUPPRESSION PLAT ---
    if (e.target.classList.contains("btn-supprimer-plat")) {
        const id = e.target.dataset.id;

        if (confirm("Supprimer ce plat ?")) {
            plats = plats.filter(p => p.id !== id);
            localStorage.setItem("plats", JSON.stringify(plats));
            afficherPlats();
        }
    }

    // --- MODIFICATION PLAT ---
    if (e.target.classList.contains("btn-modifier-plat")) {
        const id = e.target.dataset.id;
        const plat = plats.find(p => p.id === id);

        const nouveauNom = prompt("Nom du plat :", plat.nom);
        const nouvelleDescription = prompt("Description :", plat.description);
        const nouveauPrix = prompt("Prix :", plat.prix);

        if (!nouveauNom || !nouvelleDescription || !nouveauPrix) {
            alert("Tous les champs sont obligatoires.");
            return;
        }

        plat.nom = nouveauNom;
        plat.description = nouvelleDescription;
        plat.prix = parseFloat(nouveauPrix);

        localStorage.setItem("plats", JSON.stringify(plats));
        afficherPlats();
    }


    // --- SUPPRESSION HORAIRE ---
    if (e.target.classList.contains("btn-supprimer-horaire")) {
        const id = e.target.dataset.id;

        if (confirm("Supprimer cet horaire ?")) {
            horaires = horaires.filter(h => h.id !== id);
            localStorage.setItem("horaires", JSON.stringify(horaires));
            afficherHoraires();
        }
    }

    // --- MODIFICATION HORAIRE ---
    if (e.target.classList.contains("btn-modifier-horaire")) {
        const id = e.target.dataset.id;
        const h = horaires.find(h => h.id === id);

        const nouveauJour = prompt("Jour :", h.jour);
        const nouvelleOuverture = prompt("Heure d'ouverture :", h.ouverture);
        const nouvelleFermeture = prompt("Heure de fermeture :", h.fermeture);

        if (!nouveauJour || !nouvelleOuverture || !nouvelleFermeture) {
            alert("Tous les champs sont obligatoires.");
            return;
        }

        h.jour = nouveauJour;
        h.ouverture = nouvelleOuverture;
        h.fermeture = nouvelleFermeture;

        localStorage.setItem("horaires", JSON.stringify(horaires));
        afficherHoraires();
    }

});


// ---------------------------------------------------------
// Filtres
// ---------------------------------------------------------
filtreStatut.addEventListener("change", afficherCommandes);
filtreClient.addEventListener("input", afficherCommandes);
