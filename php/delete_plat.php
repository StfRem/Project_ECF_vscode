<?php
// php/delete_plat.php
header("Content-Type: application/json");
require_once "db.php"; // Votre connexion PDO

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['id'])) {
    try {
        $stmt = $pdo->prepare("DELETE FROM plats WHERE id = ?");
        $stmt->execute([$data['id']]);
        echo json_encode(["status" => "success"]);
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "ID manquant"]);
}