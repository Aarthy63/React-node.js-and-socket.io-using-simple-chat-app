const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const apiRouter = require('./router');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');
const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json()); // To parse JSON request bodies
app.use(router);
app.use('/api', apiRouter); // Use the new API routes

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join', ({ name, room }, callback) => {
    console.log(`User ${name} with id ${socket.id} joining room ${room}`);
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) {
      console.log('Join error:', error);
      return callback(error);
    }

    socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.` });
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

    socket.join(user.room);

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    console.log('Send message event received:', message);
    const user = getUser(socket.id);
    console.log('User found:', user);

    if (user) {
      io.to(user.room).emit('message', { user: user.name, text: message });
    } else {
      console.log('Error: User not found for socket id', socket.id);
    }

    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
    }

    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server has started on port ${PORT}.`));
