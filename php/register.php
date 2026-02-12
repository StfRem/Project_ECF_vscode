<?php
// php/register.php
header('Content-Type: application/json');
require_once 'db.php';

// On récupère les données envoyées par fetch()
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if ($data) {
    try {
        $sql = "INSERT INTO users (id, fullname, email, password, gsm, address, cp, role) 
                VALUES (:id, :fullname, :email, :password, :gsm, :address, :cp, 'utilisateur')";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id'       => $data['id'],
            ':fullname' => $data['fullname'],
            ':email'    => $data['email'],
            ':password' => $data['password'], // Mot de passe déjà haché par ton JS
            ':gsm'      => $data['gsm'],
            ':address'  => $data['address'],
            ':cp'       => $data['cp']
        ]);

        echo json_encode(['status' => 'success', 'message' => 'Utilisateur enregistré en SQL']);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Erreur SQL : ' . $e->getMessage()]);
    }
}
?>