'use strict';

var socketio = require('socket.io');

module.exports.listen = function(server) {

    var io = socketio.listen(server);

    // users =[{ name: name, userId: id }, { name: name, userId: id }]
    var users = [];

    // rooms = [{ name: roomname, users: [ { name: name, userId: id }, { name: name, userId: id } ] }}
    // Default rooms: 'general', 'fun', 'love', 'secret'
    var rooms = [
        { name: 'general', users: [] },
        { name: 'fun', users: [] },
        { name: 'love', users: [] },
        { name: 'secret', users: [] }
    ];

    // used in reconnection
    var disconnected = false;


    io.on('connection', function(socket) {
        console.log('new client connected', socket.id);

        socket.on('restore session', function(data) {
            console.log('restore session', data.userId);
            if (findUser(data.userId) != -1) {
                disconnected = false;
                socket.id = data.userId;
            } else {
                socket.emit('close session');
            }
        });

        socket.on('new user', function(data) {
            console.log('create new user, name ' + data.user + ', id '+ socket.id);
            if (!contains(users, data.user)) {
                users.push({name: data.user, userId: socket.id});

                socket.emit('new user', { message: 'user created', userId: socket.id });
            } else {
                socket.emit('new user', {message: 'user creation failed'});
            }
        });

        // room list request
        socket.on('get rooms', function() {
            console.log('get rooms');
            socket.emit('update rooms', { rooms: rooms });
        });

        // room list request
        socket.on('get users', function(data) {
            console.log('get users');
            socket.emit('update users', { users: listUserNamesInRoom(data.room, null) });
        });

        socket.on('join room', function(data) {
            console.log('user ' + data.user + ' joins room ' + data.room);
            socket.join(data.room);

            // create if room doesn't exist
            if (!contains(rooms, data.room)) {
                rooms.push({name: data.room, users: []});
            }

            var roomIndex = findRoom(data.room);

            var userIndex = findUser(data.userId);
            if (userIndex != -1) {
                rooms[roomIndex].users.push(users[userIndex]);
            }

            io.in(data.room).emit('new message', { content: data.user + " has joined the room." });

            io.in(data.room).emit('update users', {users: listUserNamesInRoom(data.room, roomIndex)});
        });

        socket.on('new message', function(data) {
            console.log('new message to room ' + data.room + ': user ' + data.user + ', ' + data.content);
            var newMsg = ({
                room: data.room,
                user: data.user, // should this be users[data.userId].name ?
                content: data.content,
                time: new Date()
            });

            io.in(data.room).emit('new message', newMsg);
        });

        socket.on('leave room', function(data) {
            console.log('user ' + data.user + ' leaves room ' + data.room);
            io.in(data.room).emit('new message', { content: data.user + " has left the room." });

            var roomIndex = findRoom(data.room);
            var userIndex = findUserFromRoom(roomIndex, data.userId);

            if (userIndex != -1) {
                rooms[roomIndex].users.splice(userIndex, 1);
            }

            io.in(data.room).emit('update users', { users: listUserNamesInRoom(data.room, roomIndex)} );

            socket.leave(data.room);

            // if empty remove room
            if (rooms[roomIndex].users.length === 0) {
                if (!(data.room == 'general' || data.room == 'fun' || data.room == 'love' || data.room == 'secret')) {
                    rooms.splice(roomIndex, 1);
                }
            }

        });

        // logout
        socket.on('leave chat', function(data) {
            console.log('user ' + data.user + ' left chat. ' + data.userId);

            // remove from users
            var removeUserIndex = findUser(data.userId);
            if (removeUserIndex != -1) {
                users.splice(removeUserIndex, 1);
            }

        });

        // close the window
        socket.on('disconnect', function() {
            console.log('client disconnected. resuming', socket.id);
            disconnected = true;
            setTimeout(function() {
                if (disconnected == true) {
                    console.log('client connection closed.', socket.id);
                    var foundRooms = findUserFromAllRooms(socket.id);

                    // remove from users
                    var removeUserIndex = findUser(socket.id);
                    if (removeUserIndex != -1) {
                        users.splice(removeUserIndex, 1);
                    }

                    for (var i=0; i<foundRooms.length; i++) {
                        var userIndex = findUserFromRoom(i, socket.id);

                        if (userIndex != -1) {
                            io.in(rooms[i].name).emit('new message', { content: rooms[i].users[userIndex].name + " has left the room." });
                            rooms[i].users.splice(userIndex, 1);
                        }
                        io.in(rooms[i].name).emit('update users', { users: listUserNamesInRoom(rooms[i].name, i)} );

                        // if empty remove room
                        if (rooms[i].users.length === 0) {
                            if (!(rooms[i].name == 'general' || rooms[i].name == 'fun' || rooms[i].name == 'love' || rooms[i].name == 'secret')) {
                                rooms.splice(i, 1);
                            }
                        }
                    }

                }
            }, 5000);
        });
    });

    function contains(arr, name) {
        for (var i=0; i<arr.length; i++) {
            if (arr[i].name === name) {
                return true;
            }
        }
        return false;
    }

    function findRoom(name) {
        for (var i=0; i<rooms.length; i++) {
            if (rooms[i].name === name) {
                return i;
            }
        }
        return -1;
    }

    function findUser(userId) {
        for (var i=0; i<users.length; i++) {
            if (users[i].userId === userId) {
                return i;
            }
        }
        return -1;
    }

    function findUserFromRoom(roomIndex, userId) {
        for (var i=0; i<rooms[roomIndex].users.length; i++) {
            if (rooms[roomIndex].users[i].userId === userId) {
                return i;
            }
        }
        return -1;
    }

    function findUserFromAllRooms(userId) {
        var results = [];
        for (var i=0; i<rooms.length; i++) {
            if (findUserFromRoom(i, userId) != -1) {
                results.push(i);
            }
        }
        return results;
    }

    function listUserNamesInRoom(roomName, roomIndex) {
        var results = [];
        if (roomIndex == null) {
            roomIndex = findRoom(roomName);
        }
        for (var i=0;i<rooms[roomIndex].users.length; i++) {
            results.push(rooms[roomIndex].users[i].name);
        }
        return results;
    }


    return io;

};