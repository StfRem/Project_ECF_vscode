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
// Mise à jour du statut
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

// ---------------------------------------------------------
// Chargement des avis
// ---------------------------------------------------------
let avis = JSON.parse(localStorage.getItem("avis")) || [];
const listeAvis = document.getElementById("liste-avis");

function afficherAvis() {
    listeAvis.innerHTML = "";

    const avisEnAttente = avis.filter(a => a.statut === "en attente");

    if (avisEnAttente.length === 0) {
        listeAvis.innerHTML = "<p>Aucun avis en attente de validation.</p>";
        return;
    }

    avisEnAttente.forEach(a => {
        const li = document.createElement("li");
        li.classList.add("admin-item");

        li.innerHTML = `
            <div class="admin-item-info">
                <strong>Client : ${a.nomClient}</strong>
                <span>Commande : ${a.commandeId}</span>
                <span>Note : ${a.note}/5</span>
                <span>Commentaire : ${a.commentaire}</span>
                <span>Date : ${new Date(a.date).toLocaleDateString()}</span>
            </div>

            <div class="admin-actions">
                <button class="btn-action btn-valider-avis" data-id="${a.id}">Valider</button>
                <button class="btn-danger btn-refuser-avis" data-id="${a.id}">Refuser</button>
            </div>
        `;

        listeAvis.appendChild(li);
    });
}

afficherAvis();

// Gestion des clics validation/refus
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-valider-avis")) {
        const id = e.target.dataset.id;
        
        avis = avis.map(a => {
            if (a.id === id) {
                a.statut = "validé";
            }
            return a;
        });

        localStorage.setItem("avis", JSON.stringify(avis));
        afficherAvis();
    }

    if (e.target.classList.contains("btn-refuser-avis")) {
        const id = e.target.dataset.id;
        
        if (confirm("Refuser cet avis ?")) {
            avis = avis.filter(a => a.id !== id);
            localStorage.setItem("avis", JSON.stringify(avis));
            afficherAvis();
        }
    }
});

});


// ---------------------------------------------------------
// Filtres
// ---------------------------------------------------------
filtreStatut.addEventListener("change", afficherCommandes);
filtreClient.addEventListener("input", afficherCommandes);

// Fonction à appeler lors du passage au statut "livré"
function verifierMateriel(commande) {
    if (!commande.materiel) return;

    // Passer automatiquement au statut "en attente du retour de matériel"
    commande.statut = "en attente du retour de matériel";
    commande.dateRetourAttendu = new Date();
    commande.dateRetourAttendu.setDate(commande.dateRetourAttendu.getDate() + 10);

    commande.historique.push({
        date: new Date().toISOString(),
        action: "En attente du retour de matériel (10 jours ouvrés)"
    });

    // Simulation email
    console.log(`
        EMAIL ENVOYÉ AU CLIENT
        Sujet : Retour de matériel
        Message : 
        Bonjour,
        
        Votre commande a été livrée avec du matériel en prêt.
        
        ⚠️ Vous devez restituer ce matériel sous 10 jours ouvrés.
        
        Date limite : ${commande.dateRetourAttendu.toLocaleDateString()}
        
        En cas de non-restitution, des frais de 600€ seront appliqués 
        conformément aux CGV.
        
        Cordialement,
        L'équipe Vite & Gourmand
    `);

    localStorage.setItem("commandes", JSON.stringify(commandes));
}

// Modifier la section changement de statut
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

            // AJOUTER : vérifier si livré + matériel
            if (nouveauStatut === "livré") {
                verifierMateriel(cmd);
            }
        }
        return cmd;
    });

    localStorage.setItem("commandes", JSON.stringify(commandes));
    afficherCommandes();
});

// =============================================
// AJOUT FONCTIONS POUR L'EMPLOYÉ (comme admin)
// =============================================

// Création de menu/plat/horaire
const btnAjoutMenu = document.getElementById("btn-ajout-menu");
btnAjoutMenu.addEventListener("click", () => {
    const nom = prompt("Nom du menu:");
    const description = prompt("Description:");
    if (nom && description) {
        menus.push({id: "MENU-" + Date.now(), nom, description});
        localStorage.setItem("menus", JSON.stringify(menus));
        afficherMenus();
    }
});

const btnAjoutPlat = document.getElementById("btn-ajout-plat");
btnAjoutPlat.addEventListener("click", () => {
    const nom = prompt("Nom du plat:");
    const description = prompt("Description:");
    if (nom && description) {
        plats.push({id: "PLAT-" + Date.now(), nom, description});
        localStorage.setItem("plats", JSON.stringify(plats));
        afficherPlats();
    }
});

const btnAjoutHoraire = document.getElementById("btn-ajout-horaire");
btnAjoutHoraire.addEventListener("click", () => {
    const jour = prompt("Jour (ex: Lundi):");
    const ouverture = prompt("Heure d'ouverture (ex: 09:00):");
    const fermeture = prompt("Heure de fermeture (ex: 18:00):");
    if (jour && ouverture && fermeture) {
        horaires.push({id: "HOR-" + Date.now(), jour, ouverture, fermeture});
        localStorage.setItem("horaires", JSON.stringify(horaires));
        afficherHoraires();
    }
});
