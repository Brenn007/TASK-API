// make-first-admin.js
// Script pour promouvoir le premier utilisateur en administrateur

const fs = require('fs');
const initSqlJs = require('sql.js');

async function makeAdmin(userId) {
  try {
    console.log('🔧 Chargement de la base de données...');
    
    // Vérifier que le fichier de base de données existe
    if (!fs.existsSync('database.sqlite')) {
      console.error('❌ Erreur : Le fichier database.sqlite n\'existe pas.');
      console.error('   Assurez-vous que le serveur a été démarré au moins une fois.');
      process.exit(1);
    }
    
    // Initialiser sql.js
    const SQL = await initSqlJs();
    
    // Charger la base de données
    const buffer = fs.readFileSync('database.sqlite');
    const db = new SQL.Database(buffer);
    
    console.log('✅ Base de données chargée');
    console.log('');
    
    // Vérifier que l'utilisateur existe
    console.log(`🔍 Recherche de l'utilisateur #${userId}...`);
    const userCheck = db.exec(`SELECT id, email, username, role FROM user WHERE id = ${userId}`);
    
    if (userCheck.length === 0 || userCheck[0].values.length === 0) {
      console.error(`❌ Erreur : L'utilisateur avec l'ID ${userId} n'existe pas.`);
      console.error('');
      console.log('💡 Utilisateurs disponibles :');
      const allUsers = db.exec('SELECT id, email, username, role FROM user');
      if (allUsers.length > 0 && allUsers[0].values.length > 0) {
        allUsers[0].values.forEach(user => {
          console.log(`   - ID: ${user[0]}, Email: ${user[1]}, Username: ${user[2]}, Role: ${user[3]}`);
        });
      } else {
        console.log('   Aucun utilisateur trouvé dans la base de données.');
      }
      db.close();
      process.exit(1);
    }
    
    const currentUser = userCheck[0].values[0];
    console.log('✅ Utilisateur trouvé :');
    console.log(`   - ID: ${currentUser[0]}`);
    console.log(`   - Email: ${currentUser[1]}`);
    console.log(`   - Username: ${currentUser[2]}`);
    console.log(`   - Rôle actuel: ${currentUser[3]}`);
    console.log('');
    
    // Vérifier si l'utilisateur est déjà admin
    if (currentUser[3] === 'ADMIN') {
      console.log('ℹ️  Cet utilisateur est déjà ADMIN.');
      db.close();
      process.exit(0);
    }
    
    // Mettre à jour le rôle de l'utilisateur
    console.log('🔄 Promotion en ADMIN...');
    db.run('UPDATE user SET role = ? WHERE id = ?', ['ADMIN', userId]);
    
    // Sauvegarder les modifications
    const data = db.export();
    fs.writeFileSync('database.sqlite', data);
    
    // Vérifier la mise à jour
    const updatedUser = db.exec(`SELECT id, email, username, role FROM user WHERE id = ${userId}`);
    const newUser = updatedUser[0].values[0];
    
    console.log('✅ Mise à jour réussie !');
    console.log('');
    console.log('📊 Nouvelles informations :');
    console.log(`   - ID: ${newUser[0]}`);
    console.log(`   - Email: ${newUser[1]}`);
    console.log(`   - Username: ${newUser[2]}`);
    console.log(`   - Rôle: ${newUser[3]} ⭐`);
    console.log('');
    console.log('🎉 L\'utilisateur est maintenant administrateur !');
    console.log('');
    console.log('📝 Prochaines étapes :');
    console.log('   1. Redémarrez le serveur si nécessaire');
    console.log('   2. Connectez-vous avec cet utilisateur via POST /auth/login');
    console.log('   3. Utilisez le token pour accéder aux routes admin');
    
    db.close();
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du script :');
    console.error(error.message);
    process.exit(1);
  }
}

// Récupérer l'ID depuis la ligne de commande
const userId = process.argv[2];

if (!userId) {
  console.error('❌ Usage incorrect');
  console.error('');
  console.log('📖 Utilisation :');
  console.log('   node make-first-admin.js <USER_ID>');
  console.log('');
  console.log('📌 Exemple :');
  console.log('   node make-first-admin.js 1');
  console.log('');
  console.log('💡 Pour trouver l\'ID d\'un utilisateur :');
  console.log('   - Regardez la réponse de POST /auth/register');
  console.log('   - Ou consultez la base de données directement');
  process.exit(1);
}

// Vérifier que l'ID est un nombre valide
const userIdNum = parseInt(userId);
if (isNaN(userIdNum) || userIdNum < 1) {
  console.error(`❌ Erreur : "${userId}" n'est pas un ID valide.`);
  console.error('   L\'ID doit être un nombre positif.');
  process.exit(1);
}

// Exécuter le script
console.log('');
console.log('================================================');
console.log('👑 Script de Promotion Admin - Playlist API');
console.log('================================================');
console.log('');

makeAdmin(userIdNum);
