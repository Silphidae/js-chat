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

    io.on('connection', function(socket) {
        console.log('new client connected', socket.id);

        socket.on('new user', function(data) {
            console.log('create new user, name ' + data.user + ', id '+ socket.id);
            if (users.find(x => x.name === data.user) === undefined) {
                users.push({name: data.user, userId: socket.id, rooms: []});

                socket.emit('new user', { message: 'user created', userId: socket.id });
            } else {
                socket.emit('new user', {message: 'user creation failed'});
            }
        });

        socket.on('is authenticated', function(data, fn) {
            console.log('is authenticated', data.name, data.userId);

            let isAuth = 'false';

            let foundUser = users.find(x => x.name === data.user);
            if (foundUser !== undefined) {
                if (foundUser.userId !== socket.id) {
                    foundUser.userId = socket.id;
                }
                isAuth = 'true';
            }

            fn({message: isAuth});
        });

        // room list request
        socket.on('get rooms', function() {
            console.log('get rooms');
            socket.emit('update rooms', { rooms: rooms });
        });

        // room'a user list request
        socket.on('get users', function(data) {
            console.log('get users');
            socket.emit('update users', { users: users.map(x => x.rooms.some(y => y === data.room) ? x.name : null) });
        });

        socket.on('join room', function(data) {
            console.log('user ' + data.user + ' joins room ' + data.room);
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
            console.log('new message to room ' + data.room + ': user ' + data.user + ', ' + data.content);
            let newMsg = ({
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

            let leavingUser = users.find(x => x.userId === data.userId);

            if (leavingUser !== undefined) {
                let roomIndex = leavingUser.rooms.indexOf(data.room);

                if (roomIndex !== -1) {
                    leavingUser.rooms.splice(roomIndex, 1);
                }
            }

            io.in(data.room).emit('update users', {users: users.map(x => x.rooms.some(y => y === data.room) ? x.name : null) });

            socket.leave(data.room);

            // if empty remove room
            removeRoom(data.room);

        });

        // logout
        socket.on('logout', function(data) {
            console.log('user ' + data.user + ' left chat. ' + data.userId);

            let leavingUser = users.find(x => x.userId === data.userId);

            removeUser(leavingUser);

        });

        // close the window
        socket.on('disconnect', function() {
            console.log('client connection closed.', socket.id);

            let leavingUser = users.find(x => x.userId === socket.id);

            removeUser(leavingUser);
        });

        function removeUser(leavingUser) {
            if (leavingUser !== undefined) {
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
        }

    });

    function removeRoom(roomName) {
        if (users.filter(x => x.rooms.find(y => y === roomName)).length === 0) {
            if (roomName !== ('general' || 'fun' || 'love' || 'secret')) {
                rooms.splice(rooms.findIndex(x => x.name === roomName), 1);
            }
        }
    }

    return io;

};