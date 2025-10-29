# Guia de Autenticação de Usuário

## Como funciona a proteção de rotas

### 1. **UserContext com estados de loading**
```tsx
interface UserContextType {
    userLogged: UserModel | null,
    setUserLogged: (user: UserModel | null) => void,
    fetchUser: () => void,
    isLoading: boolean,
    isUserReady: boolean
}
```

### 2. **AuthGuard - Componente que protege as rotas**
O `AuthGuard` só renderiza os children quando o usuário estiver carregado:
- Se `isLoading = true` → Mostra tela de carregamento
- Se `isUserReady = false` → Mostra "Redirecionando para login"
- Se `isUserReady = true` → Renderiza as páginas normalmente

### 3. **Hook useAuthenticatedUser()**
Use este hook nas páginas em vez de `useContext(UserContext)`:
```tsx
// ❌ Antigo (userLogged pode ser null)
const { userLogged } = useContext(UserContext);

// ✅ Novo (userLogged garantido que não é null)
const userLogged = useAuthenticatedUser();
```

### 4. **Estrutura do _layout.tsx**
```tsx
<UserProvider>          // Fornece o contexto
  <AuthGuard>           // Só renderiza quando usuário carregado
    <ToastProvider>
      <ThemeProvider>
        <Stack>         // Suas páginas aqui
        </Stack>
      </ThemeProvider>
    </ToastProvider>
  </AuthGuard>
</UserProvider>
```

## Sequência de eventos:

1. **App inicia** → `isLoading = true`, `isUserReady = false`
2. **UserProvider chama fetchUser()** automaticamente
3. **Durante carregamento** → AuthGuard mostra "Carregando..."
4. **Usuário encontrado** → `isUserReady = true`, `isLoading = false`
5. **AuthGuard libera renderização** das páginas
6. **Páginas podem usar useAuthenticatedUser()** com segurança

## Vantagens:

✅ **Sem mais erros de .getId() em objeto vazio**
✅ **Children só renderizam quando usuário pronto**  
✅ **TypeScript garante que userLogged não é null**
✅ **Tela de loading automática**
✅ **Redirecionamento automático para login se necessário**