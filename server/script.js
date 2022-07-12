if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
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
    port: '3306'
});

database.connect(err => {
    if (err) throw err;
    console.log('Mysql connected');
});

database.query("CREATE DATABASE IF NOT EXISTS ??;", ["people_tracker"], (err, result) => {
    if (err) throw err;
    console.log(result);
});

database.query("USE ??", ["people_tracker"], (err, res) => {
    if (err) throw err;
    console.log(res);
});

let sql = "CREATE TABLE IF NOT EXISTS ?? (   `id` int NOT NULL AUTO_INCREMENT,   `name` varchar(256) NOT NULL,   `username` varchar(256) NOT NULL,   `email` varchar(256) NOT NULL,   `password` varchar(256) NOT NULL,   `rooms` json DEFAULT NULL,   `virtual_id` varchar(256) DEFAULT NULL,   PRIMARY KEY (`id`) ) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci";


database.query(sql, ["users"], (err, res) => {
    if (err) throw err;
    console.log("Created", res);
});


let sockets = [];

const leftUsers = (id) => {
    return sockets.filter(socketId => socketId !== id);
};


io.on("connection", socket => {

    let users = 0;
    sockets.push(socket.id);
    users++;
    console.log(sockets[users - 1]);
    console.log("New connection", sockets[users - 1], users);
    io.to(socket.id).emit("get_id", socket.id);

    socket.on("update_id", (newId, email, rooms) => {
        console.log("SOCKET", newId);
        if (!newId) return;
        sql = "UPDATE ?? SET virtual_id = ? WHERE email = ?";
        database.query(sql, ["users", newId, email], (err, result) => {
            if (err) throw err;
            console.log("Updated socket id in users table");
        });

        if (!rooms) return;

        rooms.forEach(room => {
            socket.join(`room:${room.roomId}`);
            sql = "UPDATE ?? SET socket_id = ? WHERE email = ?";
            database.query(sql, [room.roomId, newId, email], (err, result) => {
                if (err) throw err;
                console.log("Update socket id in room table");
            });
        });
    });



    socket.on("get_user_data", (email, callback) => {
        sql = "SELECT * FROM ?? WHERE email = ?";
        database.query(sql, ["users", email], (err, rows) => {
            if (err) throw err;
            if (!rows) return;
            if (rows.length !== 1) callback(false);
            console.log("Type: ", JSON.parse(rows[0]["rooms"]))
            callback({...rows[0], rooms: JSON.parse(rows[0]["rooms"])});
        });
    });

    socket.on("create_room", (roomId, roomName, currStatus, coords, id, email, username, name) => {
        console.log("is socket id the same? ", socket.id === id, socket.id, id);
        const placeholders = [roomId, id, currStatus, coords, roomName, email, username, name, null];
        sql = 'CREATE TABLE ?? (id INT AUTO_INCREMENT PRIMARY KEY NOT NULL, ';
        sql += 'socket_id VARCHAR(255) NOT NULL, ';
        sql += 'user_status BOOLEAN NOT NULL, ';
        sql += 'geolocation VARCHAR(255), ';
        sql += 'room_name VARCHAR(255), ';
        sql += 'email VARCHAR(255) NOT NULL, ';
        sql += 'username VARCHAR(255) NOT NULL, ';
        sql += 'name VARCHAR(255) NOT NULL, ';
        sql += 'virtual_id VARCHAR(255));';

        database.query(sql, [roomId], (err, result) => {
            if (err) {
                console.log(err.message);
                throw err;
            }
            console.log("Success create table");
        });
        
        sql = 'INSERT INTO ?? (socket_id, user_status, geolocation, room_name, email, username, name, virtual_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        database.query(sql, placeholders,  (err, result) => {
            if (err) {
                console.log(err.message);
                throw err;
            }
            console.log(result);
            console.log("Admin registered");
            socket.join(`room:${roomId}`);
        });
    });

    socket.on("join_room", async (roomId, currStatus, id, email, username, name) => {
        
        sql = "SELECT room_name, geolocation FROM ?? WHERE id=1";
        database.query(sql, [roomId], (err, rows, fields) => {
            
            if (err) throw err;
            if (!rows || rows?.length === 0) return;

            const adminField = rows[0];
            console.log(adminField);
            const roomName = adminField["room_name"];
            const geolocation = adminField["geolocation"];

            const placeholders = [roomId, id, currStatus, geolocation, roomName, email, username, name, null];
            sql = 'INSERT INTO ?? (socket_id, user_status, geolocation, room_name, email, username, name, virtual_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            
            database.query(sql, placeholders, (err, result) => {
                if (err) throw err;
                
                console.log(result);
                const id = result.insertId;
                io.to(socket.id).emit("db_id", parseInt(id));
                console.log("User registered");
                let newSql = "SELECT username, user_status from ??";

                database.query(newSql, [roomId], (errs, rows, fields) => {
                    if (errs) throw errs;
                    console.log(rows);
                    socket.join(`room:${roomId}`);
                    socket.to(`room:${roomId}`).emit("change_users", rows);
                });
            });

        });
    });

    socket.on("delete_user", (email) => {
        sql = "DELETE FROM ?? WHERE email = ?";
        database.query(sql, ["users", email], (err, result) => {
            if (err) throw err;
        })
    });

    socket.on("delete_room", (roomId) => {
        sql = "DROP TABLE ??";
        database.query(sql, [roomId], (err, result) => {
            if (err) throw err;
            console.log(result);
        });
    });

    socket.on("delete_user_room", (roomId, email) => {
        sql = "DELETE FROM ?? WHERE email = ?";
        database.query(sql, [roomId, email], (err, result) => {
            if (err) throw err;
            console.log(result);
        });
    }); 

    socket.on("remove_users_room", (username) => {
        sql = "SELECT * FROM ??";
        database.query(sql, ["users"], (err, rows) => {
            if (err) throw err;
            if (!rows) return;
            if (rows.length === 0) return;
            
            rows.forEach(row => {
                const rooms = JSON.parse(row["rooms"]);
                const leftRooms = rooms.filter(room => room.username !== username);
                const sqlUpdate = "UPDATE ?? SET rooms = ? WHERE id = ?";
                database.query(sqlUpdate, ["users", leftRooms, row["id"]], (err, result) => {
                    if (err) throw err;
                })
            });
        });
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
        
        socket.leave(`room:${roomId}`);
    });


    socket.on("all_users", (roomId, adminId) => {
        sql = "SELECT username, user_status from ??";
        database.query(sql, [roomId], (err, rows, fields) => {
            console.log(rows);
            io.to(socket.id).emit("get_rows", rows);
        });
    });

    socket.on("server_geolocation", roomId => {
        sql = "SELECT geolocation FROM ?? WHERE id=1";
        database.query(sql, [roomId], (err, rows, fields) => {
            if (err) throw err;
            if (!rows) return;
            console.log(rows)
            io.to(`room:${roomId}`).emit("get_coords", rows[0]["geolocation"]);
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
            console.log("Rows: ", rows);
            if (!rows) return;
            io.to(`room:${roomId}`).emit("change_users", rows);
        });        
    });
    
    socket.on("room_exists", (roomId, response) => {
        sql = "SHOW TABLES;";
        database.query(sql, (err, tables, fields) => {
            if (err) throw err;
            
            console.log("These are tables: ", tables);
            const sameRoomId = tables.find(table => {
                console.log(table, Object.values(table)[0], roomId, Object.values(table)[0] === roomId);
                return Object.values(table)[0] === roomId;
            });

            if (!sameRoomId) response(false);
            else {
                sql = "SELECT room_name FROM ?? WHERE id = ?";
                database.query(sql, [roomId, 1], (errs, rows) => {
                    if (errs) throw errs;
                    const row = rows[0];
                    response(row);
                });
            }
        });
    });

    socket.on("update_rooms", (email, rooms) => {

        sql = "UPDATE ?? SET rooms = ? WHERE email = ?";
        console.log("Rooms: ", rooms);
        database.query(sql, ["users", rooms, email], (err, result) => {
            if (err) throw err;
            console.log("Updated rooms", result);
            JSON.parse(rooms).forEach(room => {
                sql = "UPDATE ?? SET user_status = ? WHERE email = ?";
                database.query(sql, [room.roomId, room.userStatus, email], (errs, result) => {
                    if (errs) throw err;
                    console.log(result);

                    sql = "SELECT * FROM ??";
                    database.query(sql, [room.roomId], (err, newRows) => {
                        if (err) throw err;
                        socket.to(newRows["socket_id"]).emit("update_rooms_sockets", newRows);

                    })


                });
            }); 

            
        });
    });

    socket.on("update_user_rooms", (email, newEmail, newUsername, newName, rooms) => {
        if (!rooms) return;
        JSON.parse(rooms).forEach(room => {
            sql = "UPDATE ?? SET email = ?, username = ?, name = ? WHERE email = ?";
            database.query(sql, [room.roomId, newEmail, newUsername, newName, email], (err, result) => {
                if (err) throw err;
                console.log(result);
            });

            sql = "SELECT * FROM ??";
            database.query(sql, [room.roomId], (err, rows) => {
                if (err) throw err;
                console.log("Here in here");
                io.to(`socket:${room.roomId}`).emit("change_users", rows);
            });
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

    socket.on("account_exists", (email, username, callback) => {
        sql = "SELECT * FROM ?? WHERE email = ? OR username = ?";
        database.query(sql, ["users", email, username], (errs, rows) => {
            if (errs) throw errs;
            console.log("ACCOUNT EXISTS: ", rows);
            if (rows.length === 1) callback(true);
            else callback(false);
        });
    });

    socket.on("register", async (fullName, username, email, password, callback) => {
        const hashPassword = await bcrypt.hash(password, 10);
        sql = "INSERT INTO ?? (name, username, email, password, rooms, virtual_id) VALUES (?, ?, ?, ?, ?, ?)";
        database.query(sql, ["users", fullName, username, email, hashPassword, null, socket.id], async (errs, result) => {
            if (errs) throw errs;
            console.log("Result: ", result);
            callback(result.insertId);
        });
    });

    socket.on("login", (email, password, callback) => {
        sql = "SELECT * from ?? WHERE email = ?";
        database.query(sql, ["users", email], async (errs, rows) => {
            if (errs) throw errs;
            if (rows.length != 1) {
                callback(false);
                return;
            }
            console.log("here");
            const row = rows[0];
            const samePassword = await bcrypt.compare(password, row.password);
            console.log("Same password: ", samePassword);
            console.log("This row: ", row);
            if (!samePassword) {
                callback(false);
                return;
            }

            const updateSql = "UPDATE ?? SET virtual_id = ? WHERE email = ?";
            database.query(updateSql, ["users", socket.id, email], (err, result) => {
                if (err) throw err;
                console.log("Updated socket id");
                callback({...row, rooms: row["rooms"] && JSON.parse(row["rooms"]), virtual_id: socket.id});
            });

        });
    });

    socket.on("possible_changes", (username, email, callback) => {
        sql = "SELECT * FROM ?? WHERE username = ? OR email = ?";
        database.query(sql, ["users", username, email], (err, rows) => {
            if (err) throw err;
            console.log(rows);
            if (rows.length > 0) callback(false);
            else callback(true); 
        });
    });

    socket.on("get_rooms", (email, callback) => {
        sql = "SELECT * FROM ?? WHERE email = ?";
        database.query(sql, ["users", email], (errs, rows) => {
            if (errs) throw errs;
            
            console.log(rows, email);
            if (rows.length !== 1) {
                callback(false);
                return;
            }
            const row = rows[0];
            console.log(row, row["rooms"]);
            if (!row["rooms"] || row["rooms"].length === 0) callback(false);
            else callback(JSON.parse(row["rooms"]));
        });
    });

    socket.on("room_dbId", (roomId, username, callback) => {
        sql = "SELECT id FROM ?? WHERE username = ?";
        database.query(sql, [roomId, username], (err, rows) => {
            if (err) throw err;
            if (!rows) callback(false);
            else if (rows.length === 0) callback(false);
            else callback(rows[0]["id"]);
        });
    });

    socket.on("get_room_data", (roomId, callback) => {
        sql = "SELECT * FROM ??";
        database.query(sql, [roomId], (err, rows) => {
            if (err) throw err;
            callback(rows);
        });
    });

    socket.on("update_users", (initEmail, fullName, username, email) => {
        sql = "UPDATE ?? SET name = ?, username = ?, email = ? WHERE email = ?";
        database.query(sql, ["users", fullName, username, email,  initEmail], (err, result) => {
            if (err) throw err;
            console.log("Result: ", result);
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

    // Subrooms
    
    socket.on("get_subrooms", (roomId, username, callback) => {
        sql = "SELECT * FROM ?? WHERE username = ?";
        database.query(sql, ["users", username], (err, rows) => {
            if (err) throw err;
            const rooms = JSON.parse(rows[0]["rooms"]);
            const room = rooms.find(room => room.roomId === roomId);
            callback(room.subRooms);
        });
    });

    // Notifications (join / leave room)

    socket.on("send_notification", (adminUsername, title, body) => {
        sql = "SELECT * FROM ?? WHERE username = ?";
        database.query(sql, ["users", adminUsername], (err, rows) => {
            if (err) throw err;
            if (!rows || rows.length !== 1) return;
            const adminSocketId = rows[0]["virtual_id"];
            socket.to(adminSocketId).emit("new_notification", title, body);
        });
    });

    socket.on("disconnect", () => {
        console.log( "Socked disconnected", sockets);
        sockets = leftUsers(socket.id);
    });
   
}); 


server.listen(3000, () => console.log("Server listening on port 3000"));