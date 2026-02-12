<?php
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['id'])) {
    try {
        $query = $pdo->prepare("DELETE FROM horaires WHERE id = :id");
        $query->execute(['id' => $data['id']]);
        echo json_encode(["status" => "success"]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>