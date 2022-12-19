const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const user = users.find(user => user.username == request.headers.username);
  if(user){
    request.body.user = user;
    next();
  }
  response.status(404).json({error: 'User does not exist'});

}

app.post('/users', (request, response) => {
  const doesUserAlreadyExist = users.find(user => user.username == request.body.username);
  if (doesUserAlreadyExist) response.status(400).json({error: 'username already registered'});
  const user = {
    id: uuidv4(),
    name: request.body.name,
    username: request.body.username,
    todos: []
  };

  users.push(user);
  response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request.body;
  response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request.body;
  const todo = {
    id: uuidv4(),
    title: request.body.title,
    deadline: new Date(request.body.deadline),
    done: false,
    created_at: new Date()
  };
  user.todos.push(todo);
  
  response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request.body;
  const todo = user.todos.find(todo => todo.id === request.params.id);
  if (!todo) response.status(404).json({ error: 'todo does not exist'});
  todo.title = request.body.title;
  todo.deadline = request.body.deadline;

  response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request.body;
  const todo = user.todos.find(todo => todo.id === request.params.id);
  if (!todo) response.status(404).json({ error: 'todo does not exist'});
  todo.done = true;

  response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request.body;
  const todoIndex = user.todos.findIndex(todo => todo.id === request.params.id)
  if (todoIndex === -1) response.status(404).json({ error: 'todo does not exist'})
  user.todos.splice(todoIndex, 1)

  response.status(204).send()
});

module.exports = app;