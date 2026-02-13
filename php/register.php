<?php
// php/register.php
header('Content-Type: application/json');
require_once 'db.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if ($data) {
    try {
        // 1. Sécurité : Hachage du mot de passe
        $passwordHache = password_hash($data['password'], PASSWORD_DEFAULT);

        // 2. Gestion des champs manquants (ID et ROLE)
        // Si l'ID n'est pas fourni, on en génère un (ex: USR-65ca...)
        $id = !empty($data['id']) ? $data['id'] : 'USR-' . uniqid();
        
        // Si le rôle n'est pas fourni, on met 'utilisateur' par défaut
        $role = !empty($data['role']) ? $data['role'] : 'utilisateur';

        // 3. Préparation de la requête
        $sql = "INSERT INTO users (id, fullname, email, password, gsm, address, cp, role) 
                VALUES (:id, :fullname, :email, :password, :gsm, :address, :cp, :role)";
        
        $stmt = $pdo->prepare($sql);
        
        // 4. Exécution avec les bonnes variables
        $stmt->execute([
            ':id'       => $id,
            ':fullname' => $data['fullname'] ?? 'Inconnu',
            ':email'    => $data['email'],
            ':password' => $passwordHache, // <--- On utilise le mot de passe haché ici !
            ':gsm'      => $data['gsm'] ?? '',
            ':address'  => $data['address'] ?? '',
            ':cp'       => $data['cp'] ?? '',
            ':role'     => $role
        ]);

        echo json_encode([
            'status' => 'success', 
            'message' => 'Utilisateur enregistré avec succès (Rôle: ' . $role . ')'
        ]);

    } catch (PDOException $e) {
        // En cas d'email déjà existant par exemple
        echo json_encode(['status' => 'error', 'message' => 'Erreur SQL : ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Données JSON invalides']);
}
?>