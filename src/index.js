const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(404).json({
      error: 'Esse usuário não existe!'
    })
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { username, name } = request.body;

  const user = users.some(user => user.username === username);

  if(user) {
    return response.status(400).json({
      error: 'Já existe um usuário cadastrado com esse username!'
    })
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  })

  return response.status(201).json(users[users.length-1])
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  user.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  })

  return response.status(201).json(user.todos[user.todos.length-1]);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  var todo = user.todos.find(todo => todo.id === id);

  if(!todo) return response.status(404).json({ error: "Tarefa não encontrada" })

  const idx = user.todos.indexOf(todo);

  user.todos.splice(idx, 1);

  todo.title = title;
  todo.deadline = deadline;

  user.todos.push(todo);

  return response.json(user.todos[user.todos.length-1]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  var todo = user.todos.find(todo => todo.id === id);

  if(!todo) return response.status(404).json({ error: "Tarefa não encontrada" })

  const idx = user.todos.indexOf(todo);

  user.todos.splice(idx, 1);

  todo.done = true;

  user.todos.push(todo);

  return response.json(user.todos[user.todos.length-1]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  var todo = user.todos.find(todo => todo.id === id);

  if(!todo) return response.status(404).json({ error: "Tarefa não encontrada" })

  const idx = user.todos.indexOf(todo);

  user.todos.splice(idx, 1);

  return response.status(204).send();
});

module.exports = app;