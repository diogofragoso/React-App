<!-- Documento: docs/11-renderizando-listas.md -->

# 11 · Renderizando listas

[← Anterior](10-buscando-clientes.md) · [Índice](../README.md) · **Etapa 11 de 36** · [Próxima →](12-componentes-com-props.md)

**Ponto de partida:** conclua a conferência do capítulo 10 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Cada cliente vira um item visual com identidade estável.

**Conceitos praticados:** map, arrays, expressões JSX, key, identidade de componentes.

## 1. Transformar o array em elementos

`map` cria um novo array; cada retorno vira um item renderizável. Chaves precisam ser estáveis e únicas entre irmãos, por isso usamos o id da API.

**Arquivo: `src/pages/Clientes/index.tsx`**

Substitua todo o conteúdo.

<!-- file: src/pages/Clientes/index.tsx -->
```tsx
// Arquivo: src/pages/Clientes/index.tsx
import { useEffect, useState } from 'react';

import axios from 'axios';
import { api } from '../../services/api';
import type { Cliente } from '../../types';





export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);







  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    api.get<Cliente[]>('/clientes', { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setClientes(data);
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted && !axios.isCancel(err)) {
          setError('Não foi possível carregar os clientes.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);






  return (
    <>
      <h1>Clientes</h1>



      {loading && <p role="status">Carregando clientes…</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && (
        <ul className="list-unstyled">
          {clientes.map(cliente => (
            <li key={cliente.id} className="mb-3">
              <strong>{cliente.name}</strong> — {cliente.email}
            </li>
          ))}
        </ul>
      )}


    </>
  );
}
```

## 2. Entender key pela prática

Não use Math.random(), pois ele troca a identidade em cada render. O índice também é inadequado para esta lista que será filtrada, ordenada e excluída: a posição muda, mas a pessoa representada pelo registro continua a mesma.

`key` pertence ao elemento mais externo produzido pelo map, aqui li. É uma instrução para React; ela não é recebida como uma prop comum pelo componente filho. Quando precisar do id, passe cliente ou id explicitamente.

Com função de seta e chaves, escreva return. `clientes.map(cliente => { <li /> })` retorna undefined e não mostra itens.
## Conferência antes de avançar

- [ ] Cada contato mostra nome e e-mail.
- [ ] Não há aviso de key no console.
- [ ] Map não altera o array original.

## Prática do estudante

Reordene os contatos pelo Swagger ou cadastre mais um. Explique por que id continua correto para key quando a ordem visual muda.

## Se algo falhar

Se a lista estiver vazia apesar de data conter registros, confira o return do map, as chaves JSX e a condição loading.

Referências: [Renderizando listas](https://react.dev/learn/rendering-lists).

[← Anterior](10-buscando-clientes.md) · [Índice](../README.md) · [Próxima →](12-componentes-com-props.md)
