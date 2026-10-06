<!-- Documento: docs/19-modal-de-confirmacao.md -->

# 19 · Modal de confirmação

[← Anterior](18-exclusao-de-cliente.md) · [Índice](../README.md) · **Etapa 19 de 36** · [Próxima →](20-estados-da-interface.md)

**Ponto de partida:** conclua a conferência do capítulo 18 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Exclusão exige confirmação e mantém o modal aberto em caso de falha.

**Conceitos praticados:** componente controlado, props, callbacks, estado booleano derivado, Modal.

## 1. Usar a seleção como fonte da abertura

selected guarda o contato ou null. `selected !== null` equivale à informação “modal aberto”. Guardar também um booleano separado criaria duas informações que poderiam divergir.

O modal não chama HTTP. Ele recebe busy, erro e callbacks do pai.

**Arquivo: `src/components/ConfirmDeleteModal.tsx`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/components/ConfirmDeleteModal.tsx -->
```tsx
// Arquivo: src/components/ConfirmDeleteModal.tsx
import { Alert, Button, Modal } from 'react-bootstrap';
import type { Cliente } from '../types';

interface ConfirmDeleteModalProps {
  cliente: Cliente | null;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}
export function ConfirmDeleteModal({
  cliente, busy, error, onCancel, onConfirm,
}: ConfirmDeleteModalProps) {
  if (!cliente) return null;
  return (
    <Modal show onHide={onCancel} backdrop={busy ? 'static' : true} keyboard={!busy}
      aria-labelledby="confirm-delete-title" centered>
      <Modal.Header closeButton={!busy}>
        <Modal.Title id="confirm-delete-title">Excluir cliente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Deseja excluir {cliente.name}? Essa operação remove o contato do servidor.</p>
        {error && <Alert variant="danger" role="alert">{error}</Alert>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" disabled={busy} onClick={onCancel}>Cancelar</Button>
        <Button variant="danger" disabled={busy} onClick={onConfirm}>
          {busy ? 'Excluindo…' : 'Confirmar exclusão'}
        </Button>
      </Modal.Footer>
    </Modal>
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
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal';



export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Cliente | null>(null);




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
      setSelected(null);
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
              <ClienteCard cliente={cliente} onDelete={setSelected} disabled={deletingId !== null} />
            </li>
          ))}
        </ul>
      )}

      <ConfirmDeleteModal cliente={selected} busy={deletingId !== null}
        error={error}
        onCancel={() => { if (deletingId === null) setSelected(null); }}
        onConfirm={() => { if (selected) void handleDelete(selected); }} />
    </>
  );
}
```

## 2. Seguir a sequência de confirmação

Clicar no cartão só atualiza selected. Cancelar limpa selected e não faz DELETE. Confirmar usa o contato selecionado. Depois do sucesso, o pai remove o item e fecha o modal; em caso de erro ele continua aberto com a mensagem.

Durante busy, impedimos fechar por Esc, fundo ou botão. React Bootstrap gerencia a exibição, o foco e a estrutura do diálogo; ainda precisamos fornecer título e botões claros.

A callback `onDelete={setSelected}` passa a função. `onDelete={setSelected(cliente)}` a executaria no render e seria incorreto.
## Conferência antes de avançar

- [ ] Abrir e cancelar não enviam DELETE.
- [ ] Confirmar envia somente uma operação.
- [ ] Falha mantém modal e mensagem.
- [ ] Teclado alcança Cancelar e Confirmar.

## Prática do estudante

Abra o modal usando teclado e feche com Esc antes de confirmar. Observe para onde o foco retorna. Explique como um componente controlado comunica ações sem decidir o próprio estado.

## Se algo falhar

Se DELETE ocorrer ao abrir, confira o callback passado ao cartão. Se fechar durante busy, confira onCancel e as props keyboard/backdrop.

Referências: [Modal do React Bootstrap](https://react-bootstrap.github.io/docs/components/modal/).

[← Anterior](18-exclusao-de-cliente.md) · [Índice](../README.md) · [Próxima →](20-estados-da-interface.md)
