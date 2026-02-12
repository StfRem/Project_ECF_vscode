<?php
header("Content-Type: application/json");
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id'], $data['statut'])) {
    echo json_encode(["status" => "error", "message" => "Données incomplètes"]);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE commandes SET statut = ? WHERE id = ?");
    $stmt->execute([$data['statut'], $data['id']]);

    echo json_encode(["status" => "success", "message" => "Statut mis à jour"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Erreur SQL : " . $e->getMessage()]);
}
?>