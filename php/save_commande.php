<?php
require_once "db.php";
header('Content-Type: application/json');

// On récupère les données envoyées par le JavaScript
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "Données vides"]);
    exit;
}

try {
    $sql = "INSERT INTO commandes (user_id, menu_titre, prix_total, date_prestation, heure_prestation, adresse, cp, ville, statut, materiel) 
            VALUES (:user_id, :menu_titre, :prix_total, :date_prestation, :heure_prestation, :adresse, :cp, :ville, :statut, :materiel)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':user_id'         => $data['user_id'],
        ':menu_titre'      => $data['menu_titre'],
        ':prix_total'      => $data['prix_total'],
        ':date_prestation' => $data['date_prestation'],
        ':heure_prestation'=> $data['heure_prestation'],
        ':adresse'         => $data['adresse'],
        ':cp'              => $data['cp'],
        ':ville'           => $data['ville'],
        ':statut'          => 'en attente',
        ':materiel'        => isset($data['materiel']) ? $data['materiel'] : 0
    ]);

    echo json_encode(["status" => "success", "message" => "Commande enregistrée"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>