const getFromLocalStorage = (key) => JSON.parse(localStorage.getItem(key)) || [];
const saveToLocalStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// ======================================================
// SÉCURITÉ EMPLOYÉ
// ======================================================
const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "employe") {
    alert("Accès réservé aux employés.");
    location.href = "./login.html";
}

// ==========================================
// 2. DONNÉES ET SÉLECTEURS
// ==========================================
let commandes = [];
let avis = [];
let menus = [];
let plats = getFromLocalStorage("plats");
let horaires = getFromLocalStorage("horaires");

const listeMenus = document.getElementById("liste-menus");
const listePlats = document.getElementById("liste-plats");
const listeHoraires = document.getElementById("liste-horaires");
const listeCommandes = document.getElementById("liste-commandes");
const listeAvis = document.getElementById("liste-avis");
const filtreStatut = document.getElementById("filtre-statut");
const filtreClient = document.getElementById("filtre-client");

// ==========================================
// 3. CHARGEMENT BDD (WAMP)
// ==========================================
async function chargerDonneesBDD() {
    try {
        const respCmd = await fetch('./php/get_all-commande_admin.php');
        const resultCmd = await respCmd.json();
        if (resultCmd.status === "success") {
            commandes = resultCmd.data;
            afficherCommandes();
        }

        const respAvis = await fetch('./php/get_avis_admin.php');
        const resultAvis = await respAvis.json();
        if (resultAvis.status === "success") {
            avis = resultAvis.data;
            afficherAvis();
        }

        const respMenus = await fetch('./php/get_menus.php');
        const resultMenus = await respMenus.json();
        if (resultMenus.status === "success") {
            menus = resultMenus.data;
            afficherMenus();
        }

        const respPlats = await fetch('./php/get_plats.php');
        const resultPlats = await respPlats.json();
        if (resultPlats.status === "success") {
            plats = resultPlats.data;
            afficherPlats();
        }

        // Chargement des horaires
        const respHor = await fetch('./php/get_horaires.php');
        const resultHor = await respHor.json();
        if (resultHor.status === "success") {
            horaires = resultHor.data;
            saveToLocalStorage("horaires", horaires); // On synchronise le localstorage
            afficherHoraires();
        }
    } catch (error) {
        console.error("Erreur de liaison BDD :", error);
    }
}

// ==========================================
// 4. FONCTIONS D'AFFICHAGE GÉNÉRIQUES
// ==========================================
function afficherListe(listeElement, data, renderItem, emptyMessage) {
    if (!listeElement) return;
    listeElement.innerHTML = data.length === 0 ? `<p>${emptyMessage}</p>` : "";
    data.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = renderItem(item);
        listeElement.appendChild(li);
    });
}

function afficherMenus() {
    afficherListe(listeMenus, menus, (menu) => `
        <strong>${menu.titre}</strong><br>
        Prix : ${menu.prix} € | Stock : ${menu.stock}<br>
        Personnes min : ${menu.personnesMin}<br>
        ${menu.materiel == 1 ? '<span style="color:green; font-weight:bold;">Matériel inclus</span>' : 'Sans matériel'}<br>
        <button class="btn-modifier-menu" data-id="${menu.id}">Modifier</button>
        <button class="btn-supprimer-menu" data-id="${menu.id}">Supprimer</button>
    `, "Aucun menu enregistré.");
}

function afficherPlats() {
    if (!listePlats) return;
    const ordre = { "Entrée": 1, "Plat": 2, "Dessert": 3 };
    const platsTries = [...plats].sort((a, b) => (ordre[a.categorie] || 99) - (ordre[b.categorie] || 99));
    listePlats.innerHTML = platsTries.length === 0 ? "<p>Aucun plat enregistré.</p>" : "";
    platsTries.forEach(plat => {
        const li = document.createElement("li");
        li.className = "admin-item";
        li.innerHTML = `
            <div class="admin-item-info">
                <h2>${plat.categorie}</h2>
                <strong>${plat.nom}</strong>
            </div>
            <div class="admin-actions">
                <button class="btn-danger btn-supprimer-plat" data-id="${plat.id}">Supprimer</button>
            </div>
        `;
        listePlats.appendChild(li);
    });
}

function afficherHoraires() {
    afficherListe(listeHoraires, horaires, (h) => `
        <strong>${h.jour}</strong> : ${h.ouverture} - ${h.fermeture}<br>
        <button class="btn-modifier-horaire" data-id="${h.id}">Modifier</button>
        <button class="btn-supprimer-horaire" data-id="${h.id}">Supprimer</button>
    `, "Aucun horaire enregistré.");
}

function afficherCommandes() {
    if (!listeCommandes) return;
    const recherche = filtreClient ? filtreClient.value.toLowerCase() : "";
    const statutFiltre = filtreStatut ? filtreStatut.value : "";
    const commandesFiltrees = commandes.filter(cmd => {
        const matchStatut = statutFiltre === "" || cmd.statut === statutFiltre;
        const matchNom = (cmd.fullname || "Inconnu").toLowerCase().includes(recherche);
        return matchStatut && matchNom;
    });
    listeCommandes.innerHTML = commandesFiltrees.length === 0 ? "<p>Aucune commande.</p>" : "";
    commandesFiltrees.forEach(cmd => {
        const li = document.createElement("li");
        li.classList.add("admin-item");
        const aDuMateriel = cmd.materiel == 1 || cmd.materiel === true;
        li.innerHTML = ` 
            <div class="admin-item-info">
                <strong>Commande #${cmd.id}</strong>
                <span>Client : ${cmd.fullname || "Inconnu"}</span>
                <span>Menu : ${cmd.menu_titre}</span>
                <span>Prix : ${cmd.prix_total} €</span>
                <span>Statut actuel : <strong id="statut-${cmd.id}">${cmd.statut}</strong></span>
                ${aDuMateriel ? '<br><span style="color:red; font-weight:bold;">⚠️ Contient du matériel de prêt</span>' : ''}
            </div>
            <div class="admin-actions">
			<select class="select-statut"
        name="statut_${cmd.id}" 
        id="statut_${cmd.id}" 
        data-id="${cmd.id}">
    <option value="">Changer statut</option>
    <option value="accepté" ${cmd.statut === 'accepté' ? 'selected' : ''}>Accepté</option>
    <option value="en préparation" ${cmd.statut === 'en préparation' ? 'selected' : ''}>En préparation</option>
    <option value="en cours de livraison" ${cmd.statut === 'en cours de livraison' ? 'selected' : ''}>En cours de livraison</option>
    <option value="livré" ${cmd.statut === 'livré' ? 'selected' : ''}>Livré (ou Retour Matériel)</option>
    <option value="terminée" ${cmd.statut === 'terminée' ? 'selected' : ''}>Terminée</option>
</select>
                <button class="btn-danger btn-annuler" data-id="${cmd.id}">Annuler</button>
            </div>
        `;
        listeCommandes.appendChild(li);
    });
}

function afficherAvis() {
    const avisEnAttente = avis.filter(a => a.statut === "en attente");
    afficherListe(listeAvis, avisEnAttente, (a) => `
        <strong>${a.nom_client}</strong><br> Note : ${a.note}/5<br>
        "${a.commentaire}"<br>
        <button class="btn-valider-avis" data-id="${a.id}">Valider</button>
        <button class="btn-refuser-avis" data-id="${a.id}">Refuser</button>
    `, "Aucun avis en attente.");
}

// ==========================================
// 5. ÉCOUTEURS D'ÉVÉNEMENTS
// ==========================================

document.addEventListener("change", async (e) => {
    if (e.target.classList.contains("select-statut")) {
        const id = e.target.dataset.id;
        const commande = commandes.find(cmd => cmd.id == id);
        if (!commande) return;

        let nouveauStatut = e.target.value;
        if (!nouveauStatut) return;

// --- LOGIQUE MATÉRIEL DE PRÊT ---
        if (nouveauStatut === "livré" && (commande.materiel == 1 || commande.materiel === true)) {
            const messageEmail = `📧 EMAIL DE NOTIFICATION ENVOYÉ :
            
Objet : Restitution du matériel - Commande #${id}

Madame, Monsieur,
Votre commande a été livrée. Nous vous rappelons que vous disposez de matériel en prêt.
Conformément à nos CGV, vous disposez de 10 jours ouvrés pour restituer le matériel.
Passé ce délai, des frais de 600€ vous seront facturés.

Pour organiser le retour, merci de répondre à cet email ou de nous contacter.`;

            alert(messageEmail);
            nouveauStatut = "en attente du retour de matériel";
        }

        try {
            const resp = await fetch('./php/update_commande_statut.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, statut: nouveauStatut })
            });
            const res = await resp.json();
            if (res.status === "success") {
                // On recharge pour mettre à jour l'affichage avec le nouveau statut
                chargerDonneesBDD();
            } else {
                alert("Erreur lors de la mise à jour : " + res.message);
            }
        } catch (err) {
            console.error("Erreur statut:", err);
        }
    }
});

// ==========================================
// 6. GESTION UNIQUE DES CLICS (TOUS LES BOUTONS)
// ==========================================
document.addEventListener("click", async (e) => {
    const t = e.target;
    const id = t.dataset.id;

    // --- HORAIRES ---
    if (t.classList.contains("btn-supprimer-horaire")) {
        if (!confirm("Supprimer cet horaire ?")) return;
        fetch('./php/delete_horaire.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        }).then(resp => resp.json()).then(res => {
            if (res.status === "success") {
                horaires = horaires.filter(h => h.id != id);
                saveToLocalStorage("horaires", horaires);
                afficherHoraires();
            }
        });
    }
    //  -- Modifier Horaires ---
    if (t.classList.contains("btn-modifier-horaire")) {
        const h = horaires.find(item => item.id == id);
        if (!h) return;
        const jour = prompt("Jour :", h.jour);
        const ouv = prompt("Heure d'ouverture :", h.ouverture);
        const ferm = prompt("Heure de fermeture :", h.fermeture);
        if (jour && ouv && ferm) {
            const modif = { id: id, jour, ouverture: ouv, fermeture: ferm };
            fetch('./php/save_horaire.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(modif)
            }).then(() => {
                h.jour = jour; h.ouverture = ouv; h.fermeture = ferm;
                saveToLocalStorage("horaires", horaires);
                afficherHoraires();
            });
        }
    }

    // --- MENUS ---
    if (t.classList.contains("btn-supprimer-menu")) {
        if (!confirm("Voulez-vous vraiment supprimer ce menu ?")) return;
        fetch('./php/delete_menu.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        }).then(() => chargerDonneesBDD());
    }
    // ---  Modifier menu  ---
    if (t.classList.contains("btn-modifier-menu")) {
        const menu = menus.find(m => m.id == id);
        if (!menu) return;
        const nTitre = prompt("Nouveau titre :", menu.titre);
        const nPrix = prompt("Nouveau prix :", menu.prix);
        if (nTitre && nPrix) {
            fetch('./php/update_menu.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, titre: nTitre, prix: nPrix, stock: menu.stock })
            }).then(() => chargerDonneesBDD());
        }
    }

    // --- PLATS ---
    if (t.classList.contains("btn-supprimer-plat")) {
        if (!confirm("Voulez-vous vraiment supprimer ce plat ?")) return;
        try {
            const resp = await fetch('./php/delete_plat.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });
            const res = await resp.json();
            if (res.status === "success") chargerDonneesBDD();
        } catch (err) { console.error("Erreur suppression plat:", err); }
    }

    // --- AVIS & COMMANDES ---
    if (t.classList.contains("btn-annuler")) {
        const motif = prompt("Motif d'annulation :");
        if (motif) {
            fetch('./php/update_commande_statut.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, statut: "annulée" })
            }).then(() => chargerDonneesBDD());
        }
    }
    if (t.classList.contains("btn-valider-avis")) {
        fetch('./php/update_avis_statut.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, statut: "validé" })
        }).then(() => chargerDonneesBDD());
    }
});

// --- AJOUTS ---
const btnAjoutMenu = document.getElementById("btn-ajout-menu");
if (btnAjoutMenu) {
    btnAjoutMenu.addEventListener("click", () => {
        const titre = prompt("Titre du menu :");
        const prix = prompt("Prix :");
        if (titre && prix) {
            fetch('./php/save_menu.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titre, prix: parseFloat(prix), stock: 10, personnesMin: 1, materiel: 0 })
            }).then(() => chargerDonneesBDD());
        }
    });
}

const btnAjoutPlat = document.getElementById("btn-ajout-plat");
if (btnAjoutPlat) {
    btnAjoutPlat.addEventListener("click", async () => {
        const choix = prompt("1. Entrée\n2. Plat\n3. Dessert");
        const types = { "1": "Entrée", "2": "Plat", "3": "Dessert" };
        const categorie = types[choix];
        const nom = prompt(`Nom de l'élément (${categorie}) :`);
        if (categorie && nom) {
            try {
                const resp = await fetch('./php/save_plat.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nom: nom.trim(), description: "", categorie: categorie })
                });
                if ((await resp.json()).status === "success") chargerDonneesBDD();
            } catch (error) { console.error("Erreur ajout plat"); }
        }
    });
}
// Ajout horaire
const btnAjoutHoraire = document.getElementById("btn-ajout-horaire");
if (btnAjoutHoraire) {
    btnAjoutHoraire.addEventListener("click", async () => {
        const jour = prompt("Jour (ex : Lundi) :");
        const ouverture = prompt("Ouverture (ex : 09:00) :");
        const fermeture = prompt("Fermeture (ex : 18:00) :");

        if (jour && ouverture && fermeture) {
            const nHor = { id: "HORAIRE-" + Date.now(), jour, ouverture, fermeture };
            const resp = await fetch('./php/save_horaire.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nHor)
            });
            const res = await resp.json();
            if (res.status === "success") {
                horaires.push(nHor);
                saveToLocalStorage("horaires", horaires);
                afficherHoraires();
            }
        }
    });
}

// --- FILTRES ---
if (filtreStatut) filtreStatut.addEventListener("change", afficherCommandes);
if (filtreClient) filtreClient.addEventListener("input", afficherCommandes);

// ==========================================
// 7. INITIALISATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    afficherHoraires();
    chargerDonneesBDD();
});