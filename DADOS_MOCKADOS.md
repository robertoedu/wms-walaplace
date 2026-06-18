# Dados Mockados - WMS Walaplace

Este arquivo contém todos os dados mockados utilizados no frontend. Use como referência para implementar o backend.

---

## 🔐 Usuários de Teste

### Credenciais de Acesso

| Usuário         | Senha    | Tipo               | Permissões                                                          |
| --------------- | -------- | ------------------ | ------------------------------------------------------------------- |
| admin           | admin123 | Administrador      | Todas                                                               |
| joao.silva      | 123456   | Operador           | Recebimento, Endereçamento                                          |
| maria.santos    | 123456   | Operador           | Separação, Embalagem                                                |
| carlos.oliveira | 123456   | Supervisor         | Recebimento, Endereçamento, Separação, Embalagem, Romaneio, Estoque |
| ana.costa       | 123456   | Operador (Inativo) | Romaneio                                                            |

---

## 👥 Estrutura de Usuário

```javascript
{
  id: 1,
  username: "admin",
  password: "admin123", // Hash no backend
  name: "Administrador",
  email: "admin@walaplace.com",
  role: "admin", // admin | supervisor | operator
  active: true,
  permissions: ["receiving", "addressing", ...], // Array de IDs dos módulos
  createdAt: "2026-01-15T10:00:00Z"
}
```

### Tipos de Usuário (role)

- **admin**: Acesso total ao sistema, gerencia usuários e permissões
- **supervisor**: Acesso a múltiplos módulos conforme permissões
- **operator**: Acesso limitado aos módulos específicos permitidos

---

## 📦 Módulos do Sistema

### Módulos Operacionais

| ID         | Nome          | Rota           | Descrição              |
| ---------- | ------------- | -------------- | ---------------------- |
| receiving  | Recebimento   | /recebimento   | Entrada de produtos    |
| addressing | Endereçamento | /enderecamento | Alocação em locais     |
| picking    | Separação     | /separacao     | Separação de pedidos   |
| packaging  | Embalagem     | /embalagem     | Embalagem de produtos  |
| manifest   | Romaneio      | /romaneio      | Fechamento de romaneio |

### Módulos Administrativos

| ID              | Nome                  | Rota             | Descrição              |
| --------------- | --------------------- | ---------------- | ---------------------- |
| stock           | Estoque               | /estoque         | Gestão de estoque      |
| locations       | Cadastro de Locais    | /locais          | Cadastro de endereços  |
| packaging_types | Tipos de Embalagem    | /tipos-embalagem | Tipos de embalagem     |
| warehouse_map   | Mapa do Galpão        | /mapa-galpao     | Visualização do galpão |
| users           | Usuários e Permissões | /usuarios        | Gestão de usuários     |

---

## 📊 Fluxo de Estados dos Produtos

```
RECEBIMENTO
    ↓
aguardando_enderecamento
    ↓
ENDEREÇAMENTO
    ↓
aguardando_separacao
    ↓
SEPARAÇÃO
    ↓
aguardando_embalamento
    ↓
EMBALAGEM
    ↓
aguardando_romaneio
    ↓
ROMANEIO
    ↓
romaneio_finalizado
```

### Status Disponíveis

```javascript
[
  {
    value: "aguardando_enderecamento",
    label: "Aguardando Endereçamento",
    color: "warning",
  },
  {
    value: "aguardando_separacao",
    label: "Aguardando Separação",
    color: "info",
  },
  {
    value: "aguardando_embalamento",
    label: "Aguardando Embalamento",
    color: "info",
  },
  { value: "aguardando_romaneio", label: "Aguardando Romaneio", color: "info" },
  {
    value: "romaneio_finalizado",
    label: "Romaneio Finalizado",
    color: "success",
  },
];
```

---

## 🔒 Regras de Negócio

### Autenticação

- Login com username e password
- Apenas usuários com `active: true` podem fazer login
- Token JWT ou sessão persistente (implementar no backend)
- Armazenar usuário no localStorage (frontend) após login bem-sucedido

### Permissões

- Admin tem acesso automático a todos os módulos
- Outros usuários só acessam módulos em seu array de `permissions`
- Validar permissões tanto no frontend quanto no backend
- Rotas devem ser protegidas por middleware de autenticação

### Gestão de Usuários

- Apenas Admin pode acessar o módulo de Usuários
- Admin pode:
  - Criar novos usuários
  - Editar dados e permissões de usuários existentes
  - Ativar/desativar usuários
  - Não pode deletar usuários (apenas desativar)
- Supervisor e Operador não têm acesso ao módulo de usuários (exceto se liberado)

### Validações

- Username deve ser único
- Email deve ser único e válido
- Senha deve ter no mínimo 6 caracteres (ajustar conforme necessário)
- Nome é obrigatório
- Ao criar usuário, senha é obrigatória
- Ao editar usuário, senha só é atualizada se informada

---

## 🎯 Endpoints Sugeridos para o Backend

### Autenticação

```
POST /api/auth/login
  Body: { username, password }
  Response: { user, token }

POST /api/auth/logout
  Headers: { Authorization: Bearer token }

GET /api/auth/me
  Headers: { Authorization: Bearer token }
  Response: { user }
```

### Usuários

```
GET /api/users
  Headers: { Authorization: Bearer token }
  Response: [{ id, username, name, email, role, active, permissions, createdAt }]

GET /api/users/:id
  Headers: { Authorization: Bearer token }
  Response: { id, username, name, email, role, active, permissions, createdAt }

POST /api/users
  Headers: { Authorization: Bearer token }
  Body: { username, password, name, email, role, permissions }
  Response: { user }

PUT /api/users/:id
  Headers: { Authorization: Bearer token }
  Body: { name, email, role, permissions, active, password? }
  Response: { user }

PATCH /api/users/:id/toggle-active
  Headers: { Authorization: Bearer token }
  Response: { user }
```

### Módulos

```
GET /api/modules
  Response: [{ id, name, route, type }]
```

---

## 📝 Observações Importantes

1. **Senhas**: No backend, sempre fazer hash das senhas (bcrypt, argon2, etc.)
2. **Tokens**: Implementar JWT ou sistema de sessão seguro
3. **Validações**: Validar todos os dados tanto no frontend quanto no backend
4. **Permissões**: Middleware deve verificar permissões em todas as rotas protegidas
5. **Audit Log**: Considerar adicionar log de ações (quem fez o quê e quando)
6. **Timestamps**: Adicionar `updatedAt` além do `createdAt`
7. **Soft Delete**: Usuários não são deletados, apenas desativados (`active: false`)

---

## 🚀 Como Usar os Dados Mockados

No frontend, os dados estão em: `src/mocks/mockData.js`

Para substituir por chamadas reais ao backend:

1. Criar serviço de API em `src/services/api.js`
2. Substituir arrays mockados por chamadas HTTP (axios, fetch)
3. Atualizar contexto de autenticação para usar API real
4. Implementar loading states e error handling

Exemplo de estrutura de serviço:

```javascript
// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (username, password) =>
    api.post("/auth/login", { username, password }),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};

export const userService = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  toggleActive: (id) => api.patch(`/users/${id}/toggle-active`),
};
```

---

**Data de criação**: 05/06/2026
**Versão**: 1.0.0
