# Diagrama de Classes - GirlsChat API (Versão Simplificada)

```mermaid
classDiagram
    %% MODELS
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
    }

    class Chat {
        +id: number
        +id_host: number
        +last_message: string
        +last_message_at: DateTime
        +createdAt: DateTime
        +updatedAt: DateTime
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
    }

    class Notification {
        +id: number
        +id_chat: number
        +id_user: number
        +text: string
        +seen: boolean
        +createdAt: DateTime
        +updatedAt: DateTime
    }

    class Participant {
        +id: number
        +id_chat: number
        +id_user: number
        +createdAt: DateTime
        +updatedAt: DateTime
    }

    class TokenUser {
        +id: number
        +id_user: number
        +expo_token: string
        +createdAt: DateTime
        +updatedAt: DateTime
    }

    %% CONTROLLERS
    class UsersController {
        -userService: UserService
        +login(): Response
        +signUp(): Response
        +index(): Response
        +update(): Response
        +findById(): Response
    }

    class ChatsController {
        -chatsService: ChatsService
        +index(): Response
        +show(): Response
        +create(): Response
    }

    class MessagesController {
        -messagesService: MessagesService
        +index(): Response
        +create(): Response
        +updateSeenStatus(): Response
    }

    %% SERVICES
    class UserService {
        +getUserByEmailAndPassword(): User
        +createUser(): User
        +getAllUsersExcept(): User[]
        +updateUser(): User
        +getUserById(): User
        +saveProfilePicture(): void
    }

    class ChatsService {
        +getUserChats(): Chat[]
        +showChat(): Chat
        +createChat(): Chat
    }

    class MessagesService {
        +getMessagesByChatID(): Message[]
        +createMessage(): Message
        +updateMessageSeenStatus(): void
    }

    class PushNotificationService {
        +sendNotification(): void
        +sendMultipleNotifications(): void
    }

    class IoSocketServer {
        +setupSocketHandlers(): void
        +handleConnection(): void
        +handleDisconnection(): void
        +broadcastMessage(): void
    }

    %% RELATIONSHIPS
    User ||--o{ Chat : hosts
    User ||--o{ Message : sends
    User ||--o{ Message : receives
    User ||--o{ Notification : receives
    User ||--o{ Participant : participates
    User ||--o{ TokenUser : has_tokens

    Chat ||--o{ Message : contains
    Chat ||--o{ Notification : generates
    Chat ||--o{ Participant : has_participants

    User ||--o{ Participant : user_relation
    Chat ||--o{ Participant : chat_relation

    UsersController --> UserService
    ChatsController --> ChatsService
    MessagesController --> MessagesService

    UserService --> User
    ChatsService --> Chat
    MessagesService --> Message
```

## Resumo da Arquitetura

### **📊 Modelos de Dados**
- **User**: Usuários do sistema
- **Chat**: Conversas entre usuários
- **Message**: Mensagens individuais
- **Notification**: Notificações do sistema
- **Participant**: Relacionamento User-Chat (many-to-many)
- **TokenUser**: Tokens para push notifications

### **🎮 Controladores**
- **UsersController**: Autenticação e gestão de usuários
- **ChatsController**: Gestão de conversas
- **MessagesController**: Gestão de mensagens

### **⚙️ Serviços**
- **UserService**: Lógica de negócio para usuários
- **ChatsService**: Lógica de negócio para chats
- **MessagesService**: Lógica de negócio para mensagens
- **PushNotificationService**: Notificações push
- **IoSocketServer**: WebSocket real-time

### **🔗 Relacionamentos Principais**
1. **User → Chat**: Um usuário pode hospedar vários chats
2. **User ↔ Chat**: Usuários participam de chats via Participant (many-to-many)
3. **Chat → Message**: Um chat contém várias mensagens
4. **User → Message**: Usuário envia/recebe mensagens
5. **User/Chat → Notification**: Notificações ligadas a usuários e chats

### **🏗️ Padrões Utilizados**
- **MVC + Service Layer**
- **Repository Pattern** (via Lucid ORM)
- **Dependency Injection**
- **Real-time Communication** (Socket.IO)