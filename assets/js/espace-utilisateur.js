// Récupération de l'utilisateur connecté
const user = JSON.parse(localStorage.getItem("user"));

// Sécurité : si pas connecté
if (!user) {
    alert("Vous devez être connecté pour accéder à votre espace utilisateur.");
    location.href = "./login.html";
}

// Récupération de toutes les commandes
const commandes = JSON.parse(localStorage.getItem("commandes")) || [];

// Filtrer uniquement celles de cet utilisateur
const commandesUtilisateur = commandes.filter(cmd => cmd.userId === user.id);

// Sélection de la liste
const liste = document.getElementById("liste-commandes");

// Affichage
liste.innerHTML = "";

if (commandesUtilisateur.length === 0) {
    liste.innerHTML = "<p>Aucune commande pour le moment.</p>";
} else {
    commandesUtilisateur.forEach(cmd => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${cmd.menuTitre}</strong><br>
            Commande : ${cmd.id}<br>
            Prestation : ${cmd.datePrestation} à ${cmd.heurePrestation}<br>
            Statut : ${cmd.statut}<br>
            <button data-id="${cmd.id}" class="btn-detail">Détails</button>
        `;
        liste.appendChild(li);
    });
}

// Redirection vers la page détail commande
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-detail")) {
        const id = e.target.dataset.id;
        localStorage.setItem("commandeDetail", id);
        location.href = "./commande-detail.html";
    }
});
