<!-- Documento: docs/34-acessibilidade.md -->

# 34 · Acessibilidade

[← Anterior](33-lazy-loading.md) · [Índice](../README.md) · **Etapa 34 de 36** · [Próxima →](35-testes-react.md)

**Ponto de partida:** conclua a conferência do capítulo 33 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Formulário tem ids únicos, erros associados e foco no primeiro campo inválido.

**Conceitos praticados:** HTML semântico, label, htmlFor, teclado, ARIA, useId, useRef para foco.

## 1. Gerar identificadores sem depender de um único formulário

O formulário antigo usava um prefixo fixo, suficiente para uma montagem única. useId permite duas instâncias sem repetir ids. Use o mesmo prefixo para input, label e mensagem.

**Arquivo: `src/components/ClienteForm.tsx`**

Substitua todo o conteúdo.

<!-- file: src/components/ClienteForm.tsx -->
```tsx
// Arquivo: src/components/ClienteForm.tsx
import { useState, useId, useRef } from 'react';
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
  const prefix = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
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
      (errors.name ? nameRef : emailRef).current?.focus();
      return;
    }
    await onSave({ name: form.name.trim(), email: form.email.trim().toLowerCase() });
  }
  return (
    <form noValidate onSubmit={handleSubmit} aria-busy={submitting}>
      <fieldset disabled={submitting}>
        <legend className="h5">Dados do cliente</legend>
        <label htmlFor={prefix + '-name'}>Nome</label>
        <input ref={nameRef} id={prefix + '-name'} name="name" className="form-control mb-3"
          value={form.name} required minLength={2} maxLength={100} onChange={handleChange}
          aria-invalid={attempted && !!errors.name}
          aria-describedby={attempted && errors.name ? prefix + '-name-error' : undefined} />
        {attempted && errors.name && <p id={prefix + '-name-error'} role="alert">{errors.name}</p>}
        <label htmlFor={prefix + '-email'}>E-mail</label>
        <input ref={emailRef} id={prefix + '-email'} name="email" type="email" className="form-control mb-3"
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

## 2. Usar ref para interagir com o elemento

nameRef e emailRef apontam para inputs reais. Após validação, focus orienta a correção. A ref não precisa renderizar a interface; por isso não é state.

useId serve para relações de acessibilidade. Não use para key da lista: a identidade do contato continua sendo cliente.id.

## 3. Revisar toda a aplicação pelo teclado

| Área | Conferência |
|---|---|
| Login | Labels, autofill, Enter e aviso de falha |
| Layout | Link de salto, nav identificada e um main |
| Lista | Links para navegar, botões para ações e pesquisa rotulada |
| Modal | Nome do diálogo, foco contido e retorno ao botão |
| Formulário | Erro ligado ao campo, foco de correção e envio bloqueado |
| Feedback | Loading e sucesso anunciados sem depender só de cor |

Não remova outline sem oferecer outro foco visível. Texto de placeholder não substitui label. ARIA complementa HTML semântico; não use div clicável onde um button já resolve.

Teste zoom de 200%, largura estreita e leitor de tela disponível no ambiente. Testes DOM não comprovam toda a experiência de acessibilidade.
## Conferência antes de avançar

- [ ] Campos recebem foco na primeira falha.
- [ ] Label e erro apontam para o id correto.
- [ ] Duas instâncias geram ids distintos.
- [ ] Ações funcionam sem mouse.

## Prática do estudante

Monte duas instâncias do formulário em uma página temporária e clique nas labels. Verifique que cada label foca seu próprio input. Depois remova a montagem experimental.

## Se algo falhar

Se ref ficar null, confira se foi passada ao input montado. Se id duplicar, confira se cada instância chama useId no topo.

Referências: [useId](https://react.dev/reference/react/useId) · [useRef](https://react.dev/reference/react/useRef).

[← Anterior](33-lazy-loading.md) · [Índice](../README.md) · [Próxima →](35-testes-react.md)
