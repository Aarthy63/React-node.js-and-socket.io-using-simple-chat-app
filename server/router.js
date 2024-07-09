const express = require('express');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const router = express.Router();

// Endpoint to add a user
router.post('/addUser', (req, res) => {
  const { id, name, room } = req.body;
  const result = addUser({ id, name, room });
  res.json(result);
});

// Endpoint to remove a user
router.delete('/removeUser/:id', (req, res) => {
  const { id } = req.params;
  const result = removeUser(id);
  res.json(result);
});

// Endpoint to get a user
router.get('/getUser/:id', (req, res) => {
  const { id } = req.params;
  const user = getUser(id);
  res.json(user);
});

// Endpoint to get users in a room
router.get('/getUsersInRoom/:room', (req, res) => {
  const { room } = req.params;
  const users = getUsersInRoom(room);
  res.json(users);
});

module.exports = router;
