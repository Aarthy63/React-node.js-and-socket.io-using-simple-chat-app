const io = require('socket.io-client')

// Function to handle connection to a room
const connectToRoom = (roomName, userName) => {
  const socket = io('http://localhost:5000');

  socket.on('connect', () => {
    console.log(`Connected to the server for ${roomName}`);

    // Join a room
    socket.emit('join', { name: userName, room: roomName }, (error) => {
      if (error) {
        console.log(`Join error in ${roomName}:`, error);
      } else {
        console.log(`Joined ${roomName}`);
      }
    });

    // Listen for messages
    socket.on('message', (message) => {
      console.log(`Message received in ${roomName}:`, message);
    });

    // Send a message
    setTimeout(() => {
      socket.emit('sendMessage', `Hello ${roomName}`, () => {
        console.log(`Message sent to ${roomName}`);
      });
    }, 2000);

    // Disconnect after 10 seconds
    setTimeout(() => {
      socket.disconnect();
    }, 10000);
  });

  socket.on('disconnect', () => {
    console.log(`Disconnected from the server for ${roomName}`);
  });

  return socket;
};

// Connect to two rooms
const room1Socket = connectToRoom('Room1', 'John Doe');
const room2Socket = connectToRoom('Room2', 'Jane Doe');

// Send a message from Room1 and get a response in Room2
room1Socket.on('message', (message) => {
  if (message.text === 'Hello Room1') {
    console.log('Received "Hello Room1" in Room1');
    setTimeout(() => {
      room2Socket.emit('sendMessage', 'Hi Room1');
    }, 1000);
  }
});
