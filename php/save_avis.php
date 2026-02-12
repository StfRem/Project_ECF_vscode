<?php
header("Content-Type: application/json");
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

try {
    // Génération d'un ID unique pour l'avis (ex: AV-123456)
    $avisId = "AV-" . time() . rand(10, 99);

    $stmt = $pdo->prepare("INSERT INTO avis (id, commande_id, user_id, nom_client, note, commentaire, date_creation, statut) VALUES (?, ?, ?, ?, ?, ?, NOW(), 'en attente')");
    $stmt->execute([
        $avisId,
        $data['commandeId'],
        $data['userId'],
        $data['nomClient'],
        $data['note'],
        $data['commentaire']
    ]);

    echo json_encode(["status" => "success", "message" => "Avis enregistré en BDD"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Erreur SQL : " . $e->getMessage()]);
}
?>