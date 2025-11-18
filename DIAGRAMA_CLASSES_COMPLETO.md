# Diagrama de Classes - GirlsChat API

```mermaid
classDiagram
    %% === MODELS ===
    class User {
        -id: number [PK]
        -email: string
        -password: string
        -name: string
        -bio: string
        -profile_picture: string
        -lastLogin: DateTime
        -createdAt: DateTime
        -updatedAt: DateTime
        --Relationships--
        +hostedChats: HasMany~Chat~
        +sentMessages: HasMany~Message~
        +receivedMessages: HasMany~Message~
        +notifications: HasMany~Notification~
        +participatingChats: ManyToMany~Chat~
        +participantRecords: HasMany~Participant~
    }

    class Chat {
        -id: number [PK]
        -id_host: number [FK]
        -last_message: string
        -last_message_at: DateTime
        -createdAt: DateTime
        -updatedAt: DateTime
        --Relationships--
        +host: BelongsTo~User~
        +messages: HasMany~Message~
        +notifications: HasMany~Notification~
        +participants: ManyToMany~User~
        +participantRecords: HasMany~Participant~
    }

    class Message {
        -id: number [PK]
        -id_chat: number [FK]
        -text: string
        -seen: boolean
        -sentBy: number [FK]
        -sentTo: number [FK]
        -createdAt: DateTime
        -updatedAt: DateTime
        --Relationships--
        +chat: BelongsTo~Chat~
        +sender: BelongsTo~User~
        +receiver: BelongsTo~User~
    }

    class Notification {
        -id: number [PK]
        -id_chat: number [FK]
        -id_user: number [FK]
        -text: string
        -seen: boolean
        -createdAt: DateTime
        -updatedAt: DateTime
        --Relationships--
        +chat: BelongsTo~Chat~
        +user: BelongsTo~User~
    }

    class Participant {
        -id: number [PK]
        -id_chat: number [FK]
        -id_user: number [FK]
        -createdAt: DateTime
        -updatedAt: DateTime
        --Relationships--
        +chat: BelongsTo~Chat~
        +user: BelongsTo~User~
    }

    class TokenUser {
        -id: number [PK]
        -id_user: number [FK]
        -expo_token: string
        -createdAt: DateTime
        -updatedAt: DateTime
    }

    %% === CONTROLLERS ===
    class UsersController {
        -userService: UserService
        +login(HttpContextContract): Promise~Response~
        +signUp(HttpContextContract): Promise~Response~
        +index(HttpContextContract): Promise~Response~
        +update(HttpContextContract): Promise~Response~
        +findById(HttpContextContract): Promise~Response~
    }

    class ChatsController {
        -chatsService: ChatsService
        +index(HttpContextContract): Promise~Response~
        +show(HttpContextContract): Promise~Response~
        +create(HttpContextContract): Promise~Response~
    }

    class MessagesController {
        -messagesService: MessagesService
        +index(HttpContextContract): Promise~Response~
        +create(HttpContextContract): Promise~Response~
        +updateSeenStatus(HttpContextContract): Promise~Response~
    }

    %% === SERVICES ===
    class UserService {
        +getUserByEmailAndPassword(email: string, password: string): Promise~User~
        +createUser(email: string, password: string, name: string): Promise~User~
        +getAllUsersExcept(userID: number): Promise~User[]~
        +updateUser(userID: number, data: object): Promise~User~
        +getUserById(userID: number): Promise~User~
        +saveProfilePicture(userID: number, file: MultipartFile): Promise~void~
    }

    class ChatsService {
        +getUserChats(userID: number): Promise~Chat[]~
        +showChat(chatID: number, userID: number): Promise~Chat~
        +createChat(hostID: number, participantID: number): Promise~Chat~
    }

    class MessagesService {
        +getMessagesByChatID(chatID: number): Promise~Message[]~
        +createMessage(messageData: object): Promise~Message~
        +updateMessageSeenStatus(chatID: number, userID: number): Promise~void~
    }

    class PushNotificationService {
        +sendNotification(token: string, title: string, body: string): Promise~void~
        +sendMultipleNotifications(tokens: string[], title: string, body: string): Promise~void~
    }

    class IoSocketServer {
        +setupSocketHandlers(): void
        +handleConnection(socket: Socket): void
        +handleDisconnection(socket: Socket): void
        +broadcastMessage(event: string, data: any): void
    }

    class FirebaseAdmin {
        +initialize(): void
        +sendPushNotification(token: string, payload: object): Promise~void~
    }

    %% === MIDDLEWARE ===
    class ExpoPushNotification {
        +handle(ctx: HttpContextContract, next: function): Promise~void~
    }

    %% === RELATIONSHIPS BETWEEN MODELS ===
    User ||--o{ Chat : "hosts (1:N)"
    User ||--o{ Message : "sends (1:N)"
    User ||--o{ Message : "receives (1:N)"
    User ||--o{ Notification : "receives (1:N)"
    User ||--o{ Participant : "participates (1:N)"
    User ||--o{ TokenUser : "has tokens (1:N)"

    Chat ||--o{ Message : "contains (1:N)"
    Chat ||--o{ Notification : "generates (1:N)"
    Chat ||--o{ Participant : "has participants (1:N)"

    User }|--|| Participant : "many-to-many via"
    Chat }|--|| Participant : "many-to-many via"

    %% === RELATIONSHIPS BETWEEN CONTROLLERS AND SERVICES ===
    UsersController --> UserService : uses
    ChatsController --> ChatsService : uses
    MessagesController --> MessagesService : uses

    %% === RELATIONSHIPS BETWEEN SERVICES AND MODELS ===
    UserService --> User : manages
    ChatsService --> Chat : manages
    ChatsService --> Participant : manages
    MessagesService --> Message : manages

    PushNotificationService --> TokenUser : uses
    PushNotificationService --> FirebaseAdmin : uses
    IoSocketServer --> MessagesService : uses
    IoSocketServer --> ChatsService : uses

    %% === MIDDLEWARE RELATIONSHIPS ===
    ExpoPushNotification --> PushNotificationService : uses
```

## Descrição da Arquitetura

### **Camadas da Aplicação**

#### 1. **Models (Modelos de Dados)**
- **User**: Representa usuários do sistema com perfil, bio e autenticação
- **Chat**: Representa conversas entre usuários
- **Message**: Mensagens individuais dentro de chats
- **Notification**: Notificações do sistema
- **Participant**: Tabela pivot para relacionamento many-to-many entre User e Chat
- **TokenUser**: Armazena tokens push notification dos usuários

#### 2. **Controllers (Controladores HTTP)**
- **UsersController**: Gerencia autenticação, cadastro e perfil de usuários
- **ChatsController**: Gerencia criação e listagem de chats
- **MessagesController**: Gerencia envio e listagem de mensagens

#### 3. **Services (Serviços de Negócio)**
- **UserService**: Lógica de negócio para usuários
- **ChatsService**: Lógica de negócio para chats
- **MessagesService**: Lógica de negócio para mensagens
- **PushNotificationService**: Gerencia notificações push
- **IoSocketServer**: Gerencia conexões WebSocket
- **FirebaseAdmin**: Integração com Firebase

#### 4. **Middleware**
- **ExpoPushNotification**: Middleware para notificações

### **Relacionamentos Principais**

1. **User ↔ Chat**: Um usuário pode hospedar vários chats (1:N) e participar de vários chats via Participant (N:M)
2. **Chat ↔ Message**: Um chat contém várias mensagens (1:N)
3. **User ↔ Message**: Um usuário envia e recebe várias mensagens (1:N cada)
4. **Participant**: Tabela pivot que conecta Users e Chats em relacionamento many-to-many
5. **Notification**: Ligada a User e Chat para notificações do sistema

### **Padrões de Arquitetura Utilizados**

- **MVC (Model-View-Controller)**: Separação clara entre Models, Controllers
- **Service Layer**: Lógica de negócio encapsulada em Services
- **Repository Pattern**: Através dos Models do Lucid ORM
- **Dependency Injection**: Controllers injetam Services
- **Observer Pattern**: WebSocket para real-time updates

### **Tecnologias**

- **Framework**: AdonisJS 5
- **ORM**: Lucid ORM
- **Database**: PostgreSQL/MySQL (configurável)
- **Real-time**: Socket.IO
- **Push Notifications**: Expo + Firebase
- **Authentication**: Hash MD5 (recomendado migrar para bcrypt)