'use strict';

const socketio = require('socket.io');

module.exports.listen = function(server) {

    const io = socketio.listen(server);

    // user ={ name: name, userId: id, rooms: [] }
    let users = [];

    // room = { name: roomname }
    // Default rooms: 'general', 'fun', 'love', 'secret'
    let rooms = [
        {name: 'general'},
        {name: 'fun'},
        {name: 'love'},
        {name: 'secret'}
    ];

    // needed in reconnection
    let disconnected = false;

    io.on('connection', function(socket) {

        socket.on('new user', function(data) {
            if (users.find(x => x.name === data.user) === undefined) {
                users.push({name: data.user, userId: socket.id, rooms: []});

                socket.emit('new user', { message: 'user created', userId: socket.id });
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
                    users[users.findIndex(x => x.name === data.user)].userId = socket.id;
                }
                socket.emit('is authenticated', {message: 'true'});
            } else socket.emit('is authenticated', {message: 'false'});
        });

        // room list request
        socket.on('get rooms', function() {
            socket.emit('update rooms', { rooms: rooms });
        });

        // room'a user list request
        socket.on('get users', function(data) {
            socket.emit('update users', { users: users.map(x => x.rooms.some(y => y === data.room) ? x.name : null) });
        });

        socket.on('join room', function(data) {
            socket.join(data.room);

            // create if room doesn't exist
            if (rooms.findIndex(x => x.name === data.room) === -1) {
                rooms.push({name: data.room});
            }

            let joiningUser = users.find(x => x.userId === data.userId);

            if (joiningUser !== undefined) {
                if (joiningUser.rooms.findIndex(x => x === data.room) === -1) {
                    joiningUser.rooms.push(data.room);
                }
            }

            io.in(data.room).emit('new message', { content: data.user + " has joined the room." });

            io.in(data.room).emit('update users', {users: users.map(x => x.rooms.some(y => y === data.room) ? x.name : null) });
        });

        socket.on('new message', function(data) {
            let newMsg = ({
                room: data.room,
                user: data.user, // should this be users[data.userId].name ?
                content: data.content,
                time: new Date()
            });

            io.in(data.room).emit('new message', newMsg);
        });

        socket.on('leave room', function(data) {
            io.in(data.room).emit('new message', { content: data.user + " has left the room." });

            let leavingUser = users.find(x => x.userId === data.userId);

            if (leavingUser !== undefined) {
                let roomIndex = leavingUser.rooms.indexOf(data.room);
                if (roomIndex !== -1) leavingUser.rooms.splice(roomIndex, 1);
            }

            io.in(data.room).emit('update users', {users: users.map(x => x.rooms.some(y => y === data.room) ? x.name : null) });

            socket.leave(data.room);

            // if empty remove room
            removeRoom(data.room);
        });

        // logout
        socket.on('logout', function(data) {
            removeUser(data.userId);
        });

        // close the window
        socket.on('disconnect', function() {
            removeUser(socket.id);
        });

        function removeUser(socketId) {
            disconnected = true;
            setTimeout(function () {
                let leavingUser = users.find(x => x.userId === socketId);

                if (leavingUser !== undefined && disconnected === true) {
                    // go through rooms
                    for (let x of leavingUser.rooms) {
                        io.in(x).emit('new message', {content: leavingUser.name + " has left the room."});
                        io.in(x).emit('update users', {users: users.map(y => y.rooms.some(z => z === x) ? y.name : null)});

                        socket.leave(x);

                        // if empty remove room
                        removeRoom(x);
                    }

                    // remove from users
                    users.splice(users.findIndex(x => x === leavingUser), 1);
                }
            }, 2000);
        }

    });

    function removeRoom(roomName) {
        if (users.filter(x => x.rooms.find(y => y === roomName)).length === 0) {
            if (!roomName === ('general'|| 'fun' || 'love' || 'secret')) {
                rooms.splice(rooms.findIndex(x => x.name === roomName), 1);
            }
        }
    }

    return io;
};