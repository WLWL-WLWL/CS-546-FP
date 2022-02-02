const { LoggerLevel } = require('mongodb');
const connection = require('../config/mongoConnection');
const { videogames, comments, users } = require('../data');


async function main() {
    const db = await connection.connectToDb();
    await db.dropDatabase();
    
    // Create an admin user for testing add a game
    const admin = await users.create(
        "admin",
        "account",
        "admin",
        "password",
        true
    )

    // Create test users

    const positive_gamer = await users.create(
        "Test",
        "Account",
        "positiveGamer",
        "password"
    )

    const angry_gamer = await users.create(
        "Test",
        "Account",
        "angryGamer",
        "password"
    )

    /* Game format:
        game = {
            name: name,
            releaseDate: releaseDate,
            developer: developer,
            genre: genre,
            price: price,
            boxart: boxart,
            totalVotes: 0,
            averageUserRating: 0,
            comments: []
        };
    */
    const re4 = await videogames.create(
        "Resident Evil 4",
        "2005-1-11",
        "Capcom",
        "Action",
        "19.99",
        "https://images.igdb.com/igdb/image/upload/t_cover_big/co2wk8.png"
    );
    const discoElysium = await videogames.create(
        "Disco Elysium",
        "2019-10-15",
        "ZA/UM",
        "RPG",
        "39.99",
        "https://images.igdb.com/igdb/image/upload/t_cover_big/co2ve1.png"
    );
    const halo3 = await videogames.create(
        "Halo 3",
        "2007-09-25",
        "Bungie Inc",
        "Action",
        "29.99",
        "https://images.igdb.com/igdb/image/upload/t_cover_big/co1xhc.png"
    );
    const portal = await videogames.create(
        "Portal",
        "2007-10-10",
        "Valve",
        "Adventure",
        "9.99",
        "https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7d.png"
    );
    const burnout = await videogames.create(
        "Burnout™ Paradise",
        "2008-01-22",
        "Criterion Software",
        "Racing",
        "9.99",
        "https://images.igdb.com/igdb/image/upload/t_cover_big/co28p7.png"
    );
    const civ5 = await videogames.create(
        "Sid Meier's Civilization® V",
        "2010-09-21",
        "Firaxis Games",
        "Strategy",
        "29.99",
        "https://howlongtobeat.com/games/CIVILIZATION-V-FRONT-OF-BOX.jpg"
    );
    const truckSim = await videogames.create(
        "Euro Truck Simulator 2",
        "2012-10-18",
        "SCS Software",
        "Simulation",
        "19.99",
        "https://howlongtobeat.com/games/Euro_Truck_Simulator_2_cover.jpg"
    );
    const sh2 = await videogames.create(
        "Silent Hill 2",
        "2001-09-27",
        "Team Silent",
        "Adventure",
        "19.99",
        "https://images.igdb.com/igdb/image/upload/t_cover_big/co2vyg.png"
    );
    const katamari = await videogames.create(
        "Katamari Damacy",
        "2004-03-18",
        "NOW Production",
        "Adventure",
        "19.99",
        "https://images.igdb.com/igdb/image/upload/t_cover_big/co2z8n.png"
    );
    const deusex = await videogames.create(
        "Deus Ex",
        "2000-06-26",
        "Ion Storm",
        "Action",
        "9.99",
        "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7n.png"
    );
    const cod = await videogames.create(
        "Call of Duty 4: Modern Warfare",
        "2007-09-05",
        "Treyarch",
        "Action",
        "19.99",
        "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wko.png"
    );
    const fallout = await videogames.create(
        "Fallout: New Vegas",
        "2010-10-19",
        "Obsidian Entertainment",
        "RPG",
        "19.99",
        "https://images.igdb.com/igdb/image/upload/t_cover_big/co1u60.png"
    );
    const re4id = re4._id;
    const discoElysiumid = discoElysium._id;
    const halo3id = halo3._id;

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy;

    /* Comment Format:
        title:
        reviewer:
        date:
        comment:
        likes:
        dislikes:
    */

    const allGames = await videogames.getAllVideoGames();

    for( const game of allGames){
        const positiveComment = await comments.create(
            game._id, 
            "This game is awesome too!", 
            "positiveGamer",
            today,
            "No matter how many times I play, it never gets old."
        );
        const negativeComment = await comments.create(
            game._id, 
            "Hate this game!", 
            "angryGamer",
            today,
            "No matter how many times I play, I just don't like it."
        );
    }
    


    //console.dir(await videogames.getAll(), { depth: null });

    console.log('Done seeding database');

    await connection.closeConnection();
}
main();
