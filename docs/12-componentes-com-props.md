<!-- Documento: docs/12-componentes-com-props.md -->

# 12 · Componentes reutilizáveis com props

[← Anterior](11-renderizando-listas.md) · [Índice](../README.md) · **Etapa 12 de 36** · [Próxima →](13-detalhes-do-cliente.md)

**Ponto de partida:** conclua a conferência do capítulo 11 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Apresentação de um cliente extraída para um componente reutilizável.

**Conceitos praticados:** props tipadas, destructuring, fluxo pai → filho, reutilização, responsabilidades.

## 1. Extrair apresentação sem duplicar a busca

O pai busca e guarda a lista. O filho recebe um cliente e o apresenta. Ele não copia props para state e não faz outra requisição por cartão.

**Arquivo: `src/components/ClienteCard.tsx`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/components/ClienteCard.tsx -->
```tsx
// Arquivo: src/components/ClienteCard.tsx
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { Cliente } from '../types';

interface ClienteCardProps {
  cliente: Cliente;

}

export function ClienteCard({ cliente }: ClienteCardProps) {
  return (
    <Card>
      <Card.Body>
        <h2 className="h5">{cliente.name}</h2>
        <p>{cliente.email}</p>
        <Link to="/clientes">Lista de clientes</Link>


      </Card.Body>
    </Card>
  );
}
```

**Arquivo: `src/pages/Clientes/index.tsx`**

Substitua todo o conteúdo.

<!-- file: src/pages/Clientes/index.tsx -->
```tsx
// Arquivo: src/pages/Clientes/index.tsx
import { useEffect, useState } from 'react';

import axios from 'axios';
import { api } from '../../services/api';
import type { Cliente } from '../../types';
import { ClienteCard } from '../../components/ClienteCard';




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
              <ClienteCard cliente={cliente} />
            </li>
          ))}
        </ul>
      )}


    </>
  );
}
```

## 2. Ler a assinatura do componente

`{ cliente }` é destructuring de props. A interface descreve a entrada obrigatória. Props são somente leitura: não faça `cliente.name = ...` no filho.

Components não precisam ser genéricos em todas as aplicações para merecer extração. ClienteCard é reutilizável dentro deste domínio; um botão genérico e um cartão de cliente têm responsabilidades diferentes.
## Conferência antes de avançar

- [ ] ClienteCard recebe os dados por props.
- [ ] Listagem mantém uma única requisição.
- [ ] Não há state duplicando cliente dentro do cartão.

## Prática do estudante

Acrescente uma prop opcional `showEmail?: boolean`, com padrão true, e use-a para omitir o e-mail em uma renderização experimental. Explique o que o pai decide e o que o filho apresenta.

## Se algo falhar

Se TypeScript reclamar que falta cliente, confira `<ClienteCard cliente={cliente} />`. Não declare props como any para esconder o erro.

Referências: [Props](https://react.dev/learn/passing-props-to-a-component).

[← Anterior](11-renderizando-listas.md) · [Índice](../README.md) · [Próxima →](13-detalhes-do-cliente.md)
