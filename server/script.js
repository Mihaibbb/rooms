const { rejects } = require('assert');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const mysql = require('mysql');
const bcrypt = require('bcrypt');

// app.use(express.urlencoded({extended: true}))

// Create database

const database = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'people_tracker',
    port: '3306'
});

database.connect(err => {
    if (err) throw err;
    console.log('Mysql connected');
});

let sockets = [];

io.on("connection", socket => {
    sockets.push(socket.id);
    // console.log("Socket connected", sockets);
    
    let users = 0;

    socket.on("new_connection", msg => {
        users++;
        console.log(sockets[users - 1]);
        console.log("New connection", sockets[users - 1]);
        io.emit("get_id", sockets[users - 1]);
    });

    socket.on("create_room", async (roomId, roomName, adminName, currStatus, coords, id, email, password) => {
        console.log("is socket id the same? ", socket.id === id);
        const hashPassword = await bcrypt.hash(password, 10);
        const placeholders = [roomId, id, adminName, currStatus, coords, roomName, email, hashPassword, null];
        let sql = 'CREATE TABLE ?? (id INT AUTO_INCREMENT PRIMARY KEY NOT NULL, ';
        sql += 'socket_id VARCHAR(255) NOT NULL, ';
        sql += 'username VARCHAR(255) NOT NULL, ';
        sql += 'user_status BOOLEAN NOT NULL, ';
        sql += 'geolocation VARCHAR(255), ';
        sql += 'room_name VARCHAR(255), ';
        sql += 'email VARCHAR(255), ';
        sql += 'password VARCHAR(255), ';
        sql += 'virtual_id VARCHAR(255));';

        database.query(sql, [roomId], (err, result) => {
            if (err) {
                console.log(err.message);
                throw err;
            }
            console.log("Success create table");
        });
        
        sql = 'INSERT INTO ?? (socket_id, username, user_status, geolocation, room_name, email, password, virtual_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        database.query(sql, placeholders,  (err, result) => {
            if (err) {
                console.log(err.message);
                throw err;
            }
            console.log(result);
            console.log("Admin registered");
        });
    });

    socket.on("join_room", async (roomId, userName, currStatus, id, email, password) => {
        console.log("id", roomId);
        try {
            const hashPassword = await bcrypt.hash(password, 10);
            sql = "SELECT room_name, geolocation FROM ?? WHERE id=1";
            database.query(sql, [roomId], (err, rows, fields) => {
                if (err) {
                    console.log('Error', err);
                    throw err;
                }
                console.log("Rows: ", rows);
                if (!rows || rows?.length === 0) return;
                const adminField = rows[0];
                console.log(adminField);
                const roomName = adminField["room_name"];
                const geolocation = adminField["geolocation"];
                console.log(roomName, geolocation);
                const placeholders = [roomId, id, userName, currStatus, geolocation, roomName, email, hashPassword, null];
                sql = "INSERT INTO ?? (socket_id, username, user_status, geolocation, room_name, email, password, virtual_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                database.query(sql, placeholders, (err, result) => {
                    if (err) {
                        console.log(err.message);
                        throw err;
                    }
                    console.log(result);
                    console.log("User registered");
                });

                sql = "SELECT id FROM ??";
                database.query(sql, [roomId], (err, rows, fields) => {
                    const dbId = rows[rows.length - 1]["id"];
                    io.emit("db_id", parseInt(dbId));
                });

                sql = "SELECT username, user_status from ??";
                database.query(sql, [roomId], (err, rows, fields) => {
                    console.log(rows);
                    io.emit("change_users", rows);
                });
            });
        } catch(e) {
            throw e;
        }
    });

    socket.on("leave_room", (roomId, dbId, isAdmin) => {
        if (isAdmin) {
            sql = "DROP TABLE ??";
            database.query(sql, [roomId], (err, result) => {
                if (err) throw err;
            });
        } else {
            sql = "DELETE FROM ?? WHERE id=?";
            database.query(sql, [roomId, dbId], (err, result) => {
                if (err) throw err;
            });
        }
       
    });


    socket.on("all_users", (roomId, adminId) => {
        sql = "SELECT username, user_status from ??";
        database.query(sql, [roomId], (err, rows, fields) => {
            console.log(rows);
            io.emit("get_rows", rows);
        });
    });

    socket.on("server_geolocation", roomId => {
        sql = "SELECT geolocation FROM ?? WHERE id=1";
        database.query(sql, [roomId], (err, rows, fields) => {
            if (err) throw err;
            if (!rows) return;
            console.log(rows)
            io.emit("get_coords", rows[0]["geolocation"]);
        })
    });

   

    socket.on("change_status", (roomId, status, id=1) => {
        sql = "UPDATE ?? SET user_status=? WHERE id=?";

        database.query(sql, [roomId, status, id], (err, result) => {
            if (err) {
                console.log("Error", err);
                throw err;
            }

            console.log(status);
        });

        console.log("Changed status");
        
        sql = "SELECT username, user_status from ??";
        database.query(sql, [roomId], (err, rows, fields) => {
            if (err) throw err;
            console.log(rows);
            io.emit("change_users", rows);
        });        
    });
    
    socket.on("room_exists", (roomId, response) => {
        sql = "SHOW TABLES;";
        database.query(sql, (err, tables, fields) => {
            if (err) throw err;
            
            console.log("These are tables: ", tables);
            const sameRoomId = tables.some(table => {
                console.log(table, Object.values(table)[0], roomId, Object.values(table)[0] === roomId);
                return Object.values(table)[0] === roomId;
            });
            response(sameRoomId);
        });
    });

    socket.on("same_account", (email, password, roomId, callback) => {

        sql = "SELECT email, password FROM ?? WHERE email=?";
        database.query(sql, [roomId, email, password], (err, rows, fields) => {
            if (err) throw err;
            console.log("ROWS SAME ACCOUNT", rows);
            if (!rows) callback(true);
            else if (rows.length >= 1) callback(true);
            else callback(false);
        });

    });

    socket.on("found_account", (email, password, roomId, response) => {
        sql = "SELECT * FROM ?? WHERE email=?";

        database.query(sql, [roomId, email], (err, rows, fields) => {
            const found = rows.filter(async row => await bcrypt.compare(password, row.password));
            if (err) throw err;
            console.log("FOUND: ", found);
            if (!found || found?.length != 1) {
                response(false);
                return;
            }

            response({
                id: parseInt(found[0]["id"]),
                username: parseInt(found[0]["username"])
            });
        });
    });

    socket.on("get_username", (roomId, id, response) => {
        sql = "SELECT username FROM ?? WHERE id=?";

        database.query(sql, [roomId, id], async (err, rows, fields) => {
            if (err) throw err;
            console.log("CHANGE", rows);
            await response(rows[0]["username"]);
        });
    });
    
    socket.on("disconnect", () => {
        console.log( "Socked disconnected", sockets);
        sockets.forEach((existingSocket, idx) => existingSocket === socket.id ? sockets.splice(idx, 1) : null);
    });
   
}); 


server.listen(3000, () => console.log("Server listening on port 3000"));