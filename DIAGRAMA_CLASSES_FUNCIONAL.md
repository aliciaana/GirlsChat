# Diagrama de Classes - GirlsChat API

```mermaid
classDiagram
    class User {
        +id: number
        +email: string
        +password: string
        +name: string
        +bio: string
        +profile_picture: string
        +lastLogin: DateTime
        +createdAt: DateTime
        +updatedAt: DateTime
        +login()
        +signUp()
        +updateProfile()
    }

    class Chat {
        +id: number
        +id_host: number
        +last_message: string
        +last_message_at: DateTime
        +createdAt: DateTime
        +updatedAt: DateTime
        +createChat()
        +addParticipant()
        +updateLastMessage()
    }

    class Message {
        +id: number
        +id_chat: number
        +text: string
        +seen: boolean
        +sentBy: number
        +sentTo: number
        +createdAt: DateTime
        +updatedAt: DateTime
        +sendMessage()
        +markAsRead()
    }

    class Notification {
        +id: number
        +id_chat: number
        +id_user: number
        +text: string
        +seen: boolean
        +createdAt: DateTime
        +updatedAt: DateTime
        +createNotification()
        +markAsRead()
    }

    class Participant {
        +id: number
        +id_chat: number
        +id_user: number
        +createdAt: DateTime
        +updatedAt: DateTime
        +joinChat()
        +leaveChat()
    }

    class TokenUser {
        +id: number
        +id_user: number
        +expo_token: string
        +createdAt: DateTime
        +updatedAt: DateTime
        +registerToken()
        +removeToken()
    }

    class UsersController {
        -userService: UserService
        +login()
        +signUp()
        +index()
        +update()
        +findById()
    }

    class ChatsController {
        -chatsService: ChatsService
        +index()
        +show()
        +create()
    }

    class MessagesController {
        -messagesService: MessagesService
        +index()
        +create()
        +updateSeenStatus()
    }

    class UserService {
        +getUserByEmailAndPassword()
        +createUser()
        +getAllUsersExcept()
        +updateUser()
        +getUserById()
        +saveProfilePicture()
    }

    class ChatsService {
        +getUserChats()
        +showChat()
        +createChat()
    }

    class MessagesService {
        +getMessagesByChatID()
        +createMessage()
        +updateMessageSeenStatus()
    }

    class PushNotificationService {
        +sendNotification()
        +sendMultipleNotifications()
    }

    User ||--o{ Chat : hosts
    User ||--o{ Message : sends
    User ||--o{ Message : receives
    User ||--o{ Notification : receives
    User ||--o{ Participant : participates
    User ||--o{ TokenUser : has_tokens

    Chat ||--o{ Message : contains
    Chat ||--o{ Notification : generates
    Chat ||--o{ Participant : has_participants

    User ||--|| Participant : user_relation
    Chat ||--|| Participant : chat_relation

    UsersController ..> UserService : uses
    ChatsController ..> ChatsService : uses
    MessagesController ..> MessagesService : uses

    UserService ..> User : manages
    ChatsService ..> Chat : manages
    MessagesService ..> Message : manages
    PushNotificationService ..> TokenUser : uses
```

## 📋 Descrição da Arquitetura

### 🗂️ **Modelos de Dados (Models)**

| Modelo | Descrição | Principais Campos |
|--------|-----------|------------------|
| **User** | Usuários do sistema | `id`, `email`, `password`, `name`, `bio`, `profile_picture` |
| **Chat** | Conversas entre usuários | `id`, `id_host`, `last_message`, `last_message_at` |
| **Message** | Mensagens individuais | `id`, `id_chat`, `text`, `seen`, `sentBy`, `sentTo` |
| **Notification** | Notificações do sistema | `id`, `id_chat`, `id_user`, `text`, `seen` |
| **Participant** | Relacionamento User-Chat | `id`, `id_chat`, `id_user` |
| **TokenUser** | Tokens para push notifications | `id`, `id_user`, `expo_token` |

### 🎮 **Controladores (Controllers)**

| Controller | Responsabilidade | Principais Métodos |
|------------|------------------|-------------------|
| **UsersController** | Gestão de usuários | `login()`, `signUp()`, `update()`, `findById()` |
| **ChatsController** | Gestão de chats | `index()`, `show()`, `create()` |
| **MessagesController** | Gestão de mensagens | `index()`, `create()`, `updateSeenStatus()` |

### ⚙️ **Serviços (Services)**

| Service | Função | Responsabilidades |
|---------|--------|------------------|
| **UserService** | Lógica de usuários | Autenticação, CRUD usuários, upload de foto |
| **ChatsService** | Lógica de chats | Criação de chats, gestão de participantes |
| **MessagesService** | Lógica de mensagens | Envio, listagem, status de leitura |
| **PushNotificationService** | Notificações push | Integração com Expo/Firebase |

### 🔗 **Relacionamentos Principais**

1. **User → Chat**: Um usuário pode hospedar vários chats (1:N)
2. **User ↔ Chat**: Relacionamento many-to-many via Participant
3. **Chat → Message**: Um chat contém várias mensagens (1:N)
4. **User → Message**: Usuário envia/recebe mensagens (1:N)
5. **User/Chat → Notification**: Notificações ligadas a usuários e chats

### 🏗️ **Padrões de Arquitetura**

- ✅ **MVC + Service Layer**
- ✅ **Repository Pattern** (via Lucid ORM)
- ✅ **Dependency Injection**
- ✅ **Real-time Communication** (Socket.IO)
- ✅ **Push Notifications** (Expo + Firebase)

### 🛠️ **Stack Tecnológico**

- **Backend**: AdonisJS 5 + TypeScript
- **Database**: PostgreSQL/MySQL
- **ORM**: Lucid ORM
- **Real-time**: Socket.IO
- **Push**: Expo + Firebase
- **Auth**: MD5 (recomendado migrar para bcrypt)