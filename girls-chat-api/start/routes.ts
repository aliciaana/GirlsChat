/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import ChatsController from 'App/Controllers/Http/ChatsController'
import MessagesController from 'App/Controllers/Http/MessagesController'
import UsersController from 'App/Controllers/Http/UsersController'


const usersController = new UsersController()
const chatsController = new ChatsController()
const messagesController = new MessagesController()

// Route.get('/users', usersController.index)

Route.post('/login', usersController.login)

Route.post('/sign-up', usersController.signUp)

Route.get('/chats', chatsController.index)

// Route.get('/chat', chatsController.show)

// Route.post('/chat', chatsController.create)

Route.get('/messages', messagesController.index)



