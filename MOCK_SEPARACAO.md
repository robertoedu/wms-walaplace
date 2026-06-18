# Mock de separação

O módulo usa `src/mocks/pickingMockRepository.js` e persiste os dados na chave
`wms_picking_database_v3` do `localStorage`.

## Regras implementadas

- Seleção por item bloqueia somente os itens escolhidos.
- Seleção por pedido bloqueia todos os itens e o pedido inteiro.
- Sessões registram operador, pedidos, itens e eventos.
- A bipagem valida local, SKU/EAN, quantidade necessária e saldo disponível.
- Retirada parcial é permitida.
- Remoção sem retirada devolve o item para `aguardando_separacao`.
- Remoção parcial transforma o item em `faltou_item`.
- Na finalização, itens separados seguem para `aguardando_embalamento` e são
  adicionados a `packagingQueue`.

## Quantidades

Todos os produtos são tratados como unidades normais. A quantidade necessária
é exatamente a quantidade física que o operador deve separar.

Pedidos com três ou mais SKUs ou pelo menos 50 unidades continuam recebendo
destaque de volume alto.
