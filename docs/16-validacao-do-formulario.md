<!-- Documento: docs/16-validacao-do-formulario.md -->

# 16 · Validando o formulário

[← Anterior](15-estado-dos-formularios.md) · [Índice](../README.md) · **Etapa 16 de 36** · [Próxima →](17-edicao-de-cliente.md)

**Ponto de partida:** conclua a conferência do capítulo 15 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Entradas inválidas recebem mensagens; formulário reutilizável mantém estado local.

**Conceitos praticados:** estado derivado, função pura, validação, atributos HTML, condicionais, callback props.

## 1. Calcular erros sem criar cópias de estado

Os erros dependem de form, portanto podem ser calculados durante o render. attempted guarda se já houve tentativa de envio. Não precisamos de useEffect para copiar form em errors.

A API continua validando tudo. A expressão de e-mail abaixo é uma aproximação didática; não reproduz integralmente o schema Zod nem prova que o endereço existe.

**Arquivo: `src/utils/validateCliente.ts`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/utils/validateCliente.ts -->
```typescript
// Arquivo: src/utils/validateCliente.ts
import type { ClienteInput } from '../types';

export type ClienteErrors = Partial<Record<keyof ClienteInput, string>>;

export function validateCliente(input: ClienteInput): ClienteErrors {
  const errors: ClienteErrors = {};
  const name = input.name.trim();
  const email = input.email.trim();
  if (name.length < 2 || name.length > 100) errors.name = 'Informe um nome entre 2 e 100 caracteres.';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Informe um e-mail válido com até 254 caracteres.';
  }
  return errors;
}
```

**Arquivo: `src/components/ClienteForm.tsx`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/components/ClienteForm.tsx -->
```tsx
// Arquivo: src/components/ClienteForm.tsx
import { useState } from 'react';
import type { ChangeEvent, SubmitEvent } from 'react';
import type { ClienteInput } from '../types';
import { validateCliente } from '../utils/validateCliente';

interface ClienteFormProps {
  initialValue: ClienteInput;
  submitting: boolean;
  onSave: (input: ClienteInput) => Promise<void>;
}
export function ClienteForm({ initialValue, submitting, onSave }: ClienteFormProps) {
  const [form, setForm] = useState<ClienteInput>(initialValue);
  const [attempted, setAttempted] = useState(false);
  const prefix = 'cliente-form';
  const errors = validateCliente(form);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
  }
  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setAttempted(true);
    if (Object.keys(errors).length > 0) {

      return;
    }
    await onSave({ name: form.name.trim(), email: form.email.trim().toLowerCase() });
  }
  return (
    <form noValidate onSubmit={handleSubmit} aria-busy={submitting}>
      <fieldset disabled={submitting}>
        <legend className="h5">Dados do cliente</legend>
        <label htmlFor={prefix + '-name'}>Nome</label>
        <input  id={prefix + '-name'} name="name" className="form-control mb-3"
          value={form.name} required minLength={2} maxLength={100} onChange={handleChange}
          aria-invalid={attempted && !!errors.name}
          aria-describedby={attempted && errors.name ? prefix + '-name-error' : undefined} />
        {attempted && errors.name && <p id={prefix + '-name-error'} role="alert">{errors.name}</p>}
        <label htmlFor={prefix + '-email'}>E-mail</label>
        <input  id={prefix + '-email'} name="email" type="email" className="form-control mb-3"
          value={form.email} required maxLength={254} onChange={handleChange}
          aria-invalid={attempted && !!errors.email}
          aria-describedby={attempted && errors.email ? prefix + '-email-error' : undefined} />
        {attempted && errors.email && <p id={prefix + '-email-error'} role="alert">{errors.email}</p>}
        <button className="btn btn-primary" type="submit">{submitting ? 'Salvando…' : 'Salvar'}</button>
      </fieldset>
    </form>
  );
}
```

**Arquivo: `src/pages/ClienteNovo/index.tsx`**

Substitua todo o conteúdo.

<!-- file: src/pages/ClienteNovo/index.tsx -->
```tsx
// Arquivo: src/pages/ClienteNovo/index.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { ClienteForm } from '../../components/ClienteForm';
import type { Cliente, ClienteInput } from '../../types';

export function ClienteNovo() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function save(input: ClienteInput) {
    setSubmitting(true);
    setError(null);
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
      <ClienteForm initialValue={{ name: '', email: '' }} submitting={submitting} onSave={save} />
    </>
  );
}
```

## 2. Separar campos da operação

ClienteForm mantém os campos e chama onSave com dados válidos. ClienteNovo controla HTTP, estado de envio e navegação. O callback permite reutilizar os campos para edição.

noValidate desliga mensagens nativas neste formulário para usar as mensagens calculadas e associadas por aria-describedby. required, type e limites descrevem o campo; o código precisa aplicar as regras porque a validação nativa não bloqueará o envio.

A normalização ocorre no envio. Não remova espaços a cada tecla: isso atrapalha a digitação de nomes.

initialValue é lido na primeira montagem; mudar uma prop não reinicializa useState. A edição será montada somente após carregar dados.
## Conferência antes de avançar

- [ ] Nome inválido e e-mail inválido não enviam HTTP.
- [ ] Erros aparecem após a tentativa e se atualizam durante a correção.
- [ ] Cadastro válido continua persistindo.
- [ ] Falhas de API ficam na página.

## Prática do estudante

Teste um nome com 101 caracteres e um e-mail com espaço. Explique por que validar no navegador não substitui Zod.

## Se algo falhar

Se a mensagem nativa aparecer, confira noValidate. Se errors ficar desatualizado, calcule a partir do form atual.

Referências: [Estado derivado](https://react.dev/learn/you-might-not-need-an-effect).

[← Anterior](15-estado-dos-formularios.md) · [Índice](../README.md) · [Próxima →](17-edicao-de-cliente.md)
