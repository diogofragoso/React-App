<!-- Documento: docs/18-exclusao-de-cliente.md -->

# 18 · Excluindo um cliente

[← Anterior](17-edicao-de-cliente.md) · [Índice](../README.md) · **Etapa 18 de 36** · [Próxima →](19-modal-de-confirmacao.md)

**Ponto de partida:** conclua a conferência do capítulo 17 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Exclusão confirmada pelo servidor remove o item da lista sem mutar o array.

**Conceitos praticados:** DELETE, callback props, filter, atualização funcional, eventos, estado de operação.

## 1. Passar a ação do pai para o cartão

ClienteCard apresenta o botão; a listagem decide como excluir e atualizar seus dados. Nesta etapa o clique exclui diretamente um contato de estudo. A confirmação entra no próximo capítulo.

**Arquivo: `src/components/ClienteCard.tsx`**

Substitua todo o conteúdo.

<!-- file: src/components/ClienteCard.tsx -->
```tsx
// Arquivo: src/components/ClienteCard.tsx
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { Cliente } from '../types';

interface ClienteCardProps {
  cliente: Cliente;
  onDelete?: (cliente: Cliente) => void;
  disabled?: boolean;
}

export function ClienteCard({ cliente, onDelete, disabled = false }: ClienteCardProps) {
  return (
    <Card>
      <Card.Body>
        <h2 className="h5">{cliente.name}</h2>
        <p>{cliente.email}</p>
        <Link to={"/clientes/" + cliente.id}>Ver detalhes</Link>
        <Link className="ms-3" to={"/clientes/" + cliente.id + "/editar"}>Editar</Link>
        {onDelete && <Button className="ms-3" variant="outline-danger"
          disabled={disabled} onClick={() => onDelete(cliente)}>Excluir {cliente.name}</Button>}
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
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { Cliente } from '../../types';
import { ClienteCard } from '../../components/ClienteCard';




export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);





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

  async function handleDelete(cliente: Cliente) {
    if (deletingId !== null) return;
    setDeletingId(cliente.id);
    setError(null);
    try {
      await api.delete('/clientes/' + cliente.id);
      setClientes(previous => previous.filter(item => item.id !== cliente.id));

    } catch {
      setError('Não foi possível excluir o cliente.');
    } finally {
      setDeletingId(null);
    }
  }




  return (
    <>
      <h1>Clientes</h1>
      <Link to="/clientes/novo">Cadastrar cliente</Link>


      {loading && <p role="status">Carregando clientes…</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && (
        <ul className="list-unstyled">
          {clientes.map(cliente => (
            <li key={cliente.id} className="mb-3">
              <ClienteCard cliente={cliente} onDelete={handleDelete} disabled={deletingId !== null} />
            </li>
          ))}
        </ul>
      )}


    </>
  );
}
```

## 2. Atualizar somente após sucesso

DELETE retorna 204 sem JSON. Não tente ler um cliente em response.data. Depois do sucesso, filter cria outro array e remove o id excluído. A atualização funcional evita usar uma lista antiga capturada antes da resposta.

Se DELETE falhar, mantemos o contato visível. Essa estratégia espera o servidor antes de alterar a interface; uma exclusão otimista exigiria restaurar o item em caso de falha.

Enquanto uma exclusão estiver em andamento, bloqueamos os botões de exclusão para manter a operação simples.
## Conferência antes de avançar

- [ ] DELETE usa o id selecionado.
- [ ] Sucesso remove apenas o item correspondente.
- [ ] Falha mantém o contato visível.
- [ ] Nenhum splice altera o array do state.

## Prática do estudante

Pare a API antes de clicar Excluir em um contato de estudo. Verifique que ele permanece na lista e explique por que a remoção fica depois do await.

## Se algo falhar

204 é sucesso sem corpo. Se outro item sumir, confira a comparação de ids no filter. Não use índices como identidade.

Referências: [Atualizando arrays](https://react.dev/learn/updating-arrays-in-state).

[← Anterior](17-edicao-de-cliente.md) · [Índice](../README.md) · [Próxima →](19-modal-de-confirmacao.md)
