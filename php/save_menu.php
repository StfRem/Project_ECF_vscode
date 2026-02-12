<?php
header("Content-Type: application/json");
require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

try {
    $sql = "INSERT INTO menus (titre, prix, personnesMin, stock, materiel) VALUES (?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $data['titre'],
        $data['prix'],
        $data['personnesMin'],
        $data['stock'],
        $data['materiel'] ? 1 : 0
    ]);

    echo json_encode(["status" => "success", "message" => "Menu créé !"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>