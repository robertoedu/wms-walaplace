# Mock de endereçamento

O fluxo de recebimento e endereçamento usa o repositório em
`src/mocks/wmsMockRepository.js`. Os dados são persistidos no `localStorage`
pela chave `wms_mock_database_v2`.

## Entidades

- `notes`: notas/remessas recebidas com seus itens.
- `items`: itens dentro da nota, identificados por `id` estável.
- `locations`: locais físicos com `capacity` e `occupied`.
- `movements`: eventos de endereçamento armazenados dentro do item.

Cada movimento possui:

```json
{
  "id": "mov-123",
  "itemId": "rcv-2001:SKU-10001:0",
  "noteId": "rcv-2001",
  "sku": "SKU-10001",
  "locationCode": "1000001",
  "quantity": 5,
  "timestamp": "2026-06-13T12:00:00.000Z",
  "operator": "Operador mock"
}
```

Movimentos originados de notas com problema também guardam `receivingStatus` e
`noteObservation`, preservando a ocorrência existente no momento da operação.

## Operações a substituir por API

- `listNotes()` e `saveNote(note)` para o recebimento.
- `listAddressingItems()` para a fila por produto.
- `searchPendingItem(term)` para bipagem ou busca manual.
- `findLocation(code)` para validação do endereço.
- `confirmAddressing(payload)` para registrar o movimento.

## Modos da interface

- `/enderecamento`: lista notas. Ao abrir uma nota, todos os produtos são
  apresentados e os pendentes seguem juntos para a operação.
- `/enderecamento/produtos`: lista produtos de todas as notas e permite seleção
  múltipla antes de abrir a operação.
- `/enderecamento/operacao`: tela única de bipagem. Recebe `itemIds` e mantém
  uma fila de produtos durante a sessão.

`confirmAddressing` concentra as regras que o backend deverá validar novamente:

- produto existente e não bloqueado explicitamente para quarentena;
- quantidade inteira, positiva e não superior à pendência;
- local existente;
- capacidade disponível no local;
- atualização atômica do item, movimento e ocupação.

Notas `incompleta` ou `divergente` podem ser endereçadas. Esses estados geram
alertas e permanecem vinculados ao item e ao movimento. Um bloqueio real exige
`addressingBlocked: true` na nota.

Para restaurar os dados iniciais durante testes, execute no console do navegador:

```js
localStorage.removeItem("wms_mock_database_v2");
location.reload();
```
