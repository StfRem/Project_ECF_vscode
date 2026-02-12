<?php
// php/register.php
header('Content-Type: application/json');
require_once 'db.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if ($data) {
    try {
        // On utilise :role comme paramètre pour que ce soit dynamique
        $sql = "INSERT INTO users (id, fullname, email, password, gsm, address, cp, role) 
                VALUES (:id, :fullname, :email, :password, :gsm, :address, :cp, :role)";
        
        $stmt = $pdo->prepare($sql);
        
        $stmt->execute([
            ':id'       => $data['id'],
            ':fullname' => $data['fullname'],
            ':email'    => $data['email'],
            ':password' => $data['password'], 
            ':gsm'      => $data['gsm'],
            ':address'  => $data['address'],
            ':cp'       => $data['cp'],
            ':role'     => $data['role'] // Récupère 'utilisateur', 'employe' ou 'admin' envoyé par le JS
        ]);

        echo json_encode(['status' => 'success', 'message' => 'Utilisateur enregistré avec le rôle : ' . $data['role']]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Erreur SQL : ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Données manquantes']);
}
?>