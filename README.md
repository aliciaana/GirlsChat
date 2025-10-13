# Girls Chat

This project is an chat to girls conversation. Sometimes, we want talk about "womans things" but we hasn't friends to this. Eg.: inspiration to new hair, new nails and somenting else...
To solve this problem, GirlsChat was created.

📌 Diagrama de Caso de Uso

O diagrama foi elaborado para representar as principais funcionalidades do aplicativo, como registrar-se, fazer login, visualizar conversas e iniciar novos chats.

Atores: Usuário
Casos de Uso Principais:
Cadastrar-se no aplicativo
Fazer login
Visualizar conversas existentes
Iniciar nova conversa
Enviar e receber mensagens

📎 Visualizar o Diagrama:
https://app.diagrams.net/?src=about

🎨 Protótipo no Figma

O design das telas foi criado no Figma, representando o fluxo visual da navegação entre as páginas de Login, Cadastro, Conversas, Chat e Lista de Girls.

📎 Acesse o protótipo completo no Figma:
https://www.figma.com/proto/UdK7AQmGbgGYlo8ZiVKx3H/Untitled?node-id=0-1&t=oWSK5czZuPxtEUON-1


### Get started into Front-end

1. Use node version

   ```bash
   nvm use 22.18.0
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

### Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

### Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Get started into Back-end

This project uses REST API and WebSocket to connect with Back-end, and the server was done with AdonisJS.
The WebSocket will be used to send messages in live.
To run it:

1. Enter the folder

   ```bash
   cd girls-chat-api
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the app

   ```bash
   npm run dev
   ```
