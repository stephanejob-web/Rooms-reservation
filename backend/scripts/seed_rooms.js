const mysql = require('mysql2/promise');

async function seed() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        port: 8889,
        user: 'root',
        password: 'root',
        database: 'rooms_reservation'
    });

    const layouts = ['room_background.png', 'room_variation_1.png', 'room_variation_2.png'];

    const rooms = [
        { nom: 'Salle Jupiter', capacite: 12, localisation: 'Etage 1, Aile Nord', image: layouts[0] },
        { nom: 'Salle Mars', capacite: 8, localisation: 'Etage 1, Aile Sud', image: layouts[1] },
        { nom: 'Salle Vénus', capacite: 6, localisation: 'Etage 2, Aile Ouest', image: layouts[2] },
        { nom: 'Salle Neptune', capacite: 20, localisation: 'Rez-de-chaussée', image: layouts[0] },
        { nom: 'Salle Mercure', capacite: 4, localisation: 'Etage 2, Aile Est', image: layouts[1] },
        { nom: 'Salle Saturne', capacite: 10, localisation: 'Etage 1, Aile Est', image: layouts[2] },
        { nom: 'Salle Uranus', capacite: 15, localisation: 'Etage 3', image: layouts[0] },
        { nom: 'Salle Pluton', capacite: 5, localisation: 'Sous-sol', image: layouts[1] },
        { nom: 'Salle Terre', capacite: 50, localisation: 'Auditorium', image: layouts[2] },
        { nom: 'Salle Lune', capacite: 4, localisation: 'Etage 3, Petit coin', image: layouts[0] }
    ];

    console.log('Disabling foreign key checks...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

    console.log('Clearing existing reservations and rooms...');
    await connection.execute('DELETE FROM reservations');
    await connection.execute('DELETE FROM salles');

    console.log('Seeding rooms...');
    for (const room of rooms) {
        await connection.execute(
            'INSERT INTO salles (nom, capacite, localisation, image) VALUES (?, ?, ?, ?)',
            [room.nom, room.capacite, room.localisation, room.image]
        );
    }

    console.log('Enabling foreign key checks...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Seeding complete!');
    await connection.end();
}

seed().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
