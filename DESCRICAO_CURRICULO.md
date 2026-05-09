# Descrições para Currículo - Projeto GirlsChat

## 1. APLICATIVO MOBILE (React Native/Expo)

**Desenvolvedor Mobile - GirlsChat**

Desenvolvi um aplicativo de chat em tempo real para iOS e Android utilizando React Native com Expo, implementando arquitetura escalável com Context API para gerenciamento de estado global. O aplicativo integra autenticação segura, sistema robusto de notificações push (Expo Notifications com Firebase), e comunicação bidirecional em tempo real via WebSocket/Socket.IO.

**Principais Responsabilidades e Tecnologias:**

- **Frontend Mobile**: Implementei interface responsiva com React Native, Expo Router para navegação com roteamento nativo, e componentes reutilizáveis com ThemedText e ThemedView para suportar temas claro/escuro
- **Gerenciamento de Estado**: Utilizei Context API (UserContext) para compartilhamento de estado global entre abas de navegação (conversas, explorar, amigos, perfil)
- **Comunicação em Tempo Real**: Integrei Socket.IO para mensagens instantâneas, atualizações de status de leitura e presença de usuários em tempo real
- **Notificações Push**: Implementei sistema completo de notificações push usando Expo Notifications com registros de tokens e entrega em segundo plano
- **Requisições HTTP**: Configurei axios com interceptadores para autenticação, tratamento de erros e retry automático
- **Upload de Arquivos**: Integrei seleção e envio de imagens/documentos com tratamento de erro e feedback ao usuário
- **Build e Deploy**: Gerenciei builds para Android com Gradle, configuração de keystores assinados e processo de release para produção
- **Testes**: Criei testes de integração end-to-end (E2E) para fluxos críticos (autenticação, envio de mensagens, navegação)

**Stack Técnico**: React Native, Expo, TypeScript, Context API, Socket.IO, Expo Notifications, Firebase, Axios, React Navigation, Expo Router

---

## 2. API BACKEND (AdonisJS/Node.js)

**Desenvolvedor Backend - GirlsChat API**

Arquiteti e implementei uma API RESTful escalável em AdonisJS 5 (framework MVC full-stack para Node.js) com TypeScript, fornecendo endpoints para gerenciamento de usuários, chats, mensagens e notificações em tempo real. A API utiliza PostgreSQL com Lucid ORM, implementa autenticação JWT, e oferece suporte a comunicação bidirecional via WebSocket.

**Principais Responsabilidades e Tecnologias:**

- **Arquitetura Limpa**: Estruturei o projeto em padrão MVC com separação clara entre Controllers, Services, Models e Repositories para manutenibilidade e escalabilidade
- **Banco de Dados**: Projetei schema relacional com Lucid ORM (PostgreSQL), implementando relacionamentos complexos (one-to-many, many-to-many) para usuários, chats e mensagens
- **Autenticação e Autorização**: Implementei autenticação baseada em JWT com tokens de acesso e refresh, validação de permissões em middleware customizado
- **APIs RESTful**: Desenvolvi endpoints completos para CRUD de usuários, criação e listagem de chats, envio e leitura de mensagens com validação robusta
- **WebSocket/Socket.IO**: Integrei sala de chat em tempo real, entrega instantânea de mensagens, notificações de digitação e status online/offline
- **Processamento de Arquivo**: Implementei upload seguro de imagens/documentos com integração Firebase Storage e geração de URLs assinadas
- **Notificações Push**: Criei sistema de gerenciamento de tokens push, escalonamento de notificações e rastreamento de entrega
- **Validação de Dados**: Utilizei validadores customizados (AdonisJS Validator) com regras de negócio complexas
- **Testes Automatizados**: Desenvolvi suite completa de testes de integração com Japa framework:
  - **Testes de Autenticação**: Login, validação de credenciais, tratamento de erros
  - **Testes de Usuários**: CRUD de usuários, duplicação de emails, atualizações de perfil
  - **Testes de Chats**: Criação bidirecional, listagem, validação de permissões
  - **Testes de Mensagens**: Envio de texto/arquivo, marcação como lida, busca de não lidas
  - **Testes de Notificações**: Registro de tokens, atualização, remoção, fallback
  - **E2E Testing**: Testes de fluxos completos de usuário com transações de banco de dados
- **CI/CD**: Configurei testes automatizados com ambiente isolado (.env.test), transações reversíveis para isolamento entre testes
- **Documentação de API**: Gerei documentação com exemplos de requisição/resposta, tratamento de erros e status codes

**Stack Técnico**: AdonisJS 5, Node.js, TypeScript, PostgreSQL, Lucid ORM, Socket.IO, JWT, Firebase Admin, Japa Testing Framework, Axios, Middleware customizado

---

## Competências Destacadas em Ambém Projetos:

✅ **Arquitetura de Software**: Padrões MVC, separação de responsabilidades, escalabilidade  
✅ **Desenvolvimento Full-Stack**: Frontend mobile + Backend Node.js  
✅ **Comunicação em Tempo Real**: WebSocket, Socket.IO, implementação de salas e eventos  
✅ **Testes Automatizados**: Testes unitários, integração, E2E com ciclo TDD  
✅ **Integração com Serviços Externos**: Firebase (Storage, Notifications), Expo (Push)  
✅ **Banco de Dados**: Design relacional, migrations, seed data, transações  
✅ **TypeScript**: Tipagem forte em todo o projeto para maior segurança e manutenibilidade  
✅ **Versionamento de Código**: Git com commits semânticos, branches feature, code review  
✅ **Resolução de Problemas**: Debug de problemas complexos de sincronização, crashes, performance

