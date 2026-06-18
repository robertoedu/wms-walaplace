# WMS Walaplace

Sistema de Gestão de Estoque (WMS) desenvolvido com React + Vite e Material UI.

## 🚀 Tecnologias

- React 19
- Vite 8
- Material UI (MUI)
- React Router DOM
- JavaScript (ES6+)

## 📦 Instalação

```bash
npm install
```

## 🏃 Executar

```bash
npm run dev
```

Acesse: http://localhost:5173

## 🔐 Credenciais de Teste

### Administrador

- **Usuário**: admin
- **Senha**: admin123
- **Acesso**: Todos os módulos

### Operador - Recebimento/Endereçamento

- **Usuário**: joao.silva
- **Senha**: 123456
- **Acesso**: Recebimento e Endereçamento

### Operador - Separação/Embalagem

- **Usuário**: maria.santos
- **Senha**: 123456
- **Acesso**: Separação e Embalagem

### Supervisor

- **Usuário**: carlos.oliveira
- **Senha**: 123456
- **Acesso**: Múltiplos módulos

## 📋 Funcionalidades Implementadas

✅ Sistema de autenticação com login  
✅ Controle de permissões por módulo  
✅ Tela de Dashboard (home)  
✅ Tela de Usuários e Permissões  
✅ Menu lateral dinâmico baseado em permissões  
✅ Proteção de rotas  
✅ Layout responsivo  
✅ Dados mockados no frontend

## 📁 Estrutura do Projeto

```
Estrutura atual organizada por modulo:

```txt
src/
├── assets/
├── auth/
│   ├── context/
│   └── pages/
├── mocks/
├── modules/
│   ├── addressing/
│   │   ├── components/
│   │   └── pages/
│   ├── dashboard/
│   │   └── pages/
│   ├── receiving/
│   │   ├── components/
│   │   └── pages/
│   └── users/
│       ├── components/
│       └── pages/
├── routes/
├── shared/
│   ├── components/
│   ├── layout/
│   └── theme/
├── App.jsx
└── main.jsx
```

Estrutura anterior:

```
src/
├── components/          # Componentes reutilizáveis
│   ├── MainLayout.jsx   # Layout principal com sidebar e topbar
│   ├── ProtectedRoute.jsx  # Componente de proteção de rotas
│   ├── Sidebar.jsx      # Menu lateral
│   └── TopBar.jsx       # Barra superior
├── contexts/            # Contextos React
│   └── AuthContext.jsx  # Contexto de autenticação
├── data/                # Dados mockados
│   └── mockData.js      # Usuários, módulos, permissões
├── pages/               # Páginas da aplicação
│   ├── HomePage.jsx     # Dashboard
│   ├── LoginPage.jsx    # Tela de login
│   └── UsersPage.jsx    # Gestão de usuários
├── routes/              # Configuração de rotas
│   └── AppRoutes.jsx    # Rotas da aplicação
├── App.jsx              # Componente principal
└── main.jsx             # Ponto de entrada

```

## 🎯 Módulos do Sistema

### Operacionais

1. **Recebimento** - Entrada de produtos
2. **Endereçamento** - Alocação em locais
3. **Separação** - Separação de pedidos
4. **Embalagem** - Embalagem de produtos
5. **Romaneio** - Fechamento de romaneio

### Administrativos

1. **Estoque** - Gestão de estoque
2. **Cadastro de Locais** - Endereços do galpão
3. **Tipos de Embalagem** - Tipos de embalagem
4. **Mapa do Galpão** - Visualização do layout
5. **Usuários e Permissões** - Gestão de acessos

## 📊 Fluxo do Sistema

```
Recebimento → aguardando_endereçamento → Endereçamento →
aguardando_separacao → Separação → aguardando_embalamento →
Embalagem → aguardando_romaneio → Romaneio → romaneio_finalizado
```

## 🔒 Sistema de Permissões

- **Admin**: Acesso total ao sistema
- **Supervisor**: Acesso a múltiplos módulos conforme configurado
- **Operador**: Acesso limitado aos módulos permitidos

Cada usuário só visualiza no menu os módulos que possui permissão. Tentativas de acesso direto via URL são bloqueadas.

## 📝 Dados Mockados

Todos os dados mockados estão documentados no arquivo `DADOS_MOCKADOS.md` na raiz do projeto. Use-o como referência para implementar o backend.

## 🛠️ Próximos Passos

- [ ] Implementar módulos operacionais
- [ ] Criar módulos administrativos
- [ ] Adicionar funcionalidade de bipagem
- [ ] Implementar relatórios
- [ ] Integrar com backend real
- [ ] Adicionar testes automatizados

## 📄 Licença

Projeto proprietário - Walaplace
