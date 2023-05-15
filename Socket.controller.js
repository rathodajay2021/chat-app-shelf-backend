const userArray = [];

const addUser = ({ id, userName, chatRoomName }) => {
  const name = userName.trim().toLowerCase();
  const room = chatRoomName.trim().toLowerCase();

  const isUserExist = userArray.find(
    (user) => user.name === name && user.room === room
  );

  if (isUserExist) return { error: "UserName is taken, try with new userName" };

  const user = { id, name, room };

  userArray.push(user);

  return { user };
};

const getUser = (id) => {
  return 
}

const removeUser = (id) => {
  const index = userArray.findIndex((user) => user.id === id);

  if (index !== -1) return userArray.splice(index, 1)[0];
};

module.exports = {
  addUser,
  getUser,
  removeUser,
};
