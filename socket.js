'use strict';

const socketio = require('socket.io');

module.exports.listen = function(server) {

    const io = socketio.listen(server);

    // user ={ name: name, userId: id, room: roomName}
    let users = [];

    // room = { name: name, users: 0}
    // Default rooms: 'general', 'fun', 'love', 'secret'
    let rooms = [
        {name: 'general', users: 0},
        {name: 'fun', users: 0},
        {name: 'love', users: 0},
        {name: 'secret', users: 0}
    ];


    // needed in reconnection
    let disconnected = false;

    io.on('connection', function(socket) {

        socket.on('new user', function(data) {
            if (users.find(x => x.name === data.user) === undefined) {
                users.push({name: data.user, userId: socket.id, room: ''});

                socket.emit('new user', { message: 'user created', socketId: socket.id });
            } else {
                socket.emit('new user', {message: 'user creation failed'});
            }
        });

        socket.on('is authenticated', function(data) {
            let foundUser = users.find(x => x.name === data.user);

            if (foundUser !== undefined) {
                disconnected = false;
                //restore session
                if (foundUser.userId !== socket.id) {
                    foundUser.userId = socket.id;
                    socket.join(foundUser.room);
                }
                socket.emit('is authenticated', {message: 'true', socketId: socket.id});
            } else socket.emit('is authenticated', {message: 'false', socketId: socket.id});
        });

        // room list request
        socket.on('get rooms', function() {
            socket.emit('update rooms', { rooms: rooms });
        });

        // room's user list request
        socket.on('get users', function(data) {
            socket.emit('update users', { users: users.map(x => x.room === data.room ? x.name : null) });
        });

        socket.on('join room', function(data) {

            let joiningUser = users.find(x => x.userId === data.userId);

            if (joiningUser !== undefined) {
                // create if room doesn't exist
                if (rooms.find(x => x.name === data.room) === undefined) {
                    rooms.push({name: data.room, users: 0});
                }

                joiningUser.room = data.room;
                rooms.find(x => x.name === data.room).users++;
                io.emit('update rooms', { rooms: rooms });

                socket.join(data.room);
                io.in(data.room).emit('new message', { content: data.user + " has joined the room." });
                io.in(data.room).emit('update users', { users: users.map(x => x.room === data.room ? x.name : null) });
            }
        });

        socket.on('new message', function(data) {
            let newMsg = ({
                room: data.room,
                user: data.user,
                content: data.content,
                time: new Date()
            });

            io.in(data.room).emit('new message', newMsg);
        });

        socket.on('leave room', function(data) {
            let leavingUser =  users.find(x => x.userId === data.userId);

            if (leavingUser !== undefined) {
                leavingUser.room = '';
            }

            let leaveRoom = rooms.find(x => x.name === data.room);
            if (leaveRoom !== undefined) {
                leaveRoom.users--;
                io.in(data.room).emit('new message', {content: data.user + " has left the room."});
                io.in(data.room).emit('update users', {users: users.map(x => x.room === data.room ? x.name : null)});
                socket.leave(data.room);

                removeEmptyRoom(data.room);
                io.emit('update rooms', { rooms: rooms });
            }
        });

        // logout
        socket.on('logout', function(data) {
            removeUser(data.userId, 0);
        });

        // close the window
        socket.on('disconnect', function() {
            removeUser(socket.id, 3000);
        });

        function removeUser(socketId, waitTime) {
            disconnected = true;

            setTimeout(function () {
                let leavingUser = users.find(x => x.userId === socketId);
                if (leavingUser !== undefined && disconnected === true) {
                    if (leavingUser.room !== '') {
                        rooms.find(x => x.name === leavingUser.room).users--;

                        io.in(leavingUser.room).emit('new message', { content: leavingUser.name + " has left the room." });
                        io.in(leavingUser.room).emit('update users', { users: users.map(x => x.room === leavingUser.room ? x.name : null) });
                        socket.leave(leavingUser.room);

                        removeEmptyRoom(leavingUser.room);
                    }

                }
                // remove from users
                let userIndex = users.findIndex(x => x === leavingUser);
                if (userIndex !== -1) users.splice(userIndex, 1);

                io.emit('update rooms', { rooms: rooms });
            }, waitTime);
        }

    });

    function removeEmptyRoom(roomName) {
        if (rooms.find(x => x.name === roomName).users === 0) {
            if (roomName !== 'general' && roomName !== 'fun' && roomName !== 'love' && roomName !== 'secret') {
                rooms.splice(rooms.findIndex(x => x.name === roomName), 1);
            }
        }
    }

    return io;
};