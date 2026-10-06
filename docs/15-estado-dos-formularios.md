<!-- Documento: docs/15-estado-dos-formularios.md -->

# 15 · Evoluindo o estado dos formulários

[← Anterior](14-cadastro-de-cliente.md) · [Índice](../README.md) · **Etapa 15 de 36** · [Próxima →](16-validacao-do-formulario.md)

**Ponto de partida:** conclua a conferência do capítulo 14 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Campos agrupados em um objeto atualizado sem mutação.

**Conceitos praticados:** objetos em state, spread, imutabilidade, propriedades computadas, ChangeEvent, atualização funcional.

## 1. Agrupar dados relacionados

Dois useState são suficientes para um formulário curto. Quando os campos crescem, um objeto pode facilitar reset e envio. O agrupamento é uma decisão de organização.

**Arquivo: `src/pages/ClienteNovo/index.tsx`**

Substitua todo o conteúdo.

<!-- file: src/pages/ClienteNovo/index.tsx -->
```tsx
// Arquivo: src/pages/ClienteNovo/index.tsx
import { useState } from 'react';
import type { ChangeEvent, SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import type { Cliente, ClienteInput } from '../../types';

export function ClienteNovo() {
  const [form, setForm] = useState<ClienteInput>({ name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
  }
  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const input: ClienteInput = { name: form.name.trim(), email: form.email.trim().toLowerCase() };
    try {
      await api.post<Cliente>('/clientes', input);
      navigate('/clientes', { replace: true });
    } catch {
      setError('Não foi possível cadastrar. Confira a conexão e se o e-mail já está em uso.');
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <>
      <h1>Cadastrar cliente</h1>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={handleSubmit} aria-busy={submitting}>
        <fieldset disabled={submitting}>
          <legend className="h5">Dados do cliente</legend>
          <label htmlFor="cliente-name">Nome</label>
          <input id="cliente-name" name="name" className="form-control mb-3"
            value={form.name} required minLength={2} maxLength={100}
            onChange={handleChange} />
          <label htmlFor="cliente-email">E-mail</label>
          <input id="cliente-email" name="email" type="email" className="form-control mb-3"
            value={form.email} required maxLength={254}
            onChange={handleChange} />
          <button className="btn btn-primary" type="submit">{submitting ? 'Salvando…' : 'Salvar'}</button>
        </fieldset>
      </form>
    </>
  );
}
```

## 2. Ler a atualização campo por campo

`{ ...previous, [name]: value }` cria outro objeto, preserva os campos anteriores e troca o campo indicado por name. Colocar o spread depois do campo sobrescreveria a atualização com o valor antigo.

Não faça `form.name = value; setForm(form)`: isso altera o objeto já usado em renders anteriores e pode manter a mesma referência. A atualização funcional usa o objeto mais recente que React entregar.

O atributo name dos inputs precisa corresponder ao contrato. Não confunda name do atributo HTML com name que também é um campo de domínio.
## Conferência antes de avançar

- [ ] Editar name preserva email e vice-versa.
- [ ] Payload mantém o formato do capítulo anterior.
- [ ] Objeto atual não é modificado diretamente.

## Prática do estudante

Crie um botão Limpar com type="button" que executa setForm({ name: '', email: '' }). Explique por que um botão sem type dentro de form pode submeter por padrão.

## Se algo falhar

Se somente o último campo permanecer preenchido, confira o spread. Se uma propriedade inesperada aparecer, confira o atributo name.

Referências: [Atualizando objetos](https://react.dev/learn/updating-objects-in-state).

[← Anterior](14-cadastro-de-cliente.md) · [Índice](../README.md) · [Próxima →](16-validacao-do-formulario.md)
