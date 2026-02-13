<?php
header("Content-Type: application/json");
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['nom']) || empty($data['categorie'])) {
    echo json_encode(["status" => "error", "message" => "Données incomplètes"]);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO plats (categorie, nom) VALUES (?, ?)");
    $stmt->execute([
        $data['categorie'], 
        $data['nom']
    ]);

    echo json_encode(["status" => "success", "message" => "Plat enregistré"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Erreur SQL : " . $e->getMessage()]);
}
?>