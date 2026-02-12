<?php
header("Content-Type: application/json");
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['id'])) {
    echo json_encode(["status" => "error", "message" => "ID du menu manquant"]);
    exit;
}

try {
    $sql = "DELETE FROM menus WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $data['id']]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["status" => "success", "message" => "Menu supprimé"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Menu introuvable"]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>