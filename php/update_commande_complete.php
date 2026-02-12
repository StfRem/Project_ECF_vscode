<?php
header("Content-Type: application/json");
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

try {
    $sql = "UPDATE commandes SET 
            nb_personnes = ?, 
            prix_total = ?, 
            date_prestation = ?, 
            heure_prestation = ?, 
            adresse = ?, 
            cp = ?, 
            ville = ?,
            distance = ?
            WHERE id = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $data['nb_personnes'],
        $data['prix_total'],
        $data['date_prestation'],
        $data['heure_prestation'],
        $data['adresse'],
        $data['cp'],
        $data['ville'],
        $data['distance'],
        $data['id']
    ]);

    echo json_encode(["status" => "success", "message" => "Commande mise à jour"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Erreur SQL : " . $e->getMessage()]);
}
?>