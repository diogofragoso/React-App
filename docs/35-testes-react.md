<!-- Documento: docs/35-testes-react.md -->

# 35 · Testando a aplicação React

[← Anterior](34-acessibilidade.md) · [Índice](../README.md) · **Etapa 35 de 36** · [Próxima →](36-build-e-publicacao.md)

**Ponto de partida:** conclua a conferência do capítulo 34 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Testes verificam interação, validação, modal e recuperação da sessão sem banco.

**Conceitos praticados:** Vitest, Testing Library, eventos, mocks, act, isolamento, testes de componentes e serviços simulados.

## 1. Instalar ferramentas e configurar

Execute na raiz da cópia construída:

```bat
npm install --save-dev --save-exact vitest@5.0.3 jsdom@30.1.1 @testing-library/react@16.3.3 @testing-library/user-event@14.6.7 @testing-library/jest-dom@7.0.1
npm pkg set scripts.test="vitest run"
npm pkg set scripts.test:watch="vitest"
```

Versione o package-lock.json atualizado. Os testes usam jsdom, um ambiente de DOM simulado; não abrem um navegador real.

**Arquivo: `vite.config.ts`**

Substitua todo o conteúdo. Preserve configurações extras se tiver acrescentado algo fora desta trilha.

<!-- file: vite.config.ts -->
```typescript
// Arquivo: vite.config.ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    clearMocks: true,
  },
});
```

**Arquivo: `tests/setup.ts`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: tests/setup.ts -->
```typescript
// Arquivo: tests/setup.ts
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());
```

## 2. Testar comportamento, não detalhes internos

Consultas por role e label refletem como a interface é usada e ajudam a detectar campos sem rótulo. userEvent reproduz digitação e clique. Não teste se existe um useState em uma linha específica.

**Arquivo: `tests/ClienteForm.test.tsx`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: tests/ClienteForm.test.tsx -->
```tsx
// Arquivo: tests/ClienteForm.test.tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClienteForm } from '../src/components/ClienteForm';

describe('ClienteForm', () => {
  it('bloqueia entradas inválidas e foca o primeiro campo com erro', async () => {
    const onSave = vi.fn();
    render(<ClienteForm initialValue={{ name: '', email: '' }} submitting={false} onSave={onSave} />);
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Nome')).toHaveFocus();
    expect(screen.getByLabelText('Nome')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });

  it('envia dados normalizados depois da interação real nos campos', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<ClienteForm initialValue={{ name: '', email: '' }} submitting={false} onSave={onSave} />);
    await user.type(screen.getByLabelText('Nome'), '  Maria Silva  ');
    await user.type(screen.getByLabelText('E-mail'), 'MARIA@EXAMPLE.COM');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(onSave).toHaveBeenCalledExactlyOnceWith({ name: 'Maria Silva', email: 'maria@example.com' });
  });

  it('bloqueia o formulário durante envio', () => {
    render(<ClienteForm initialValue={{ name: 'Maria', email: 'maria@example.com' }}
      submitting onSave={vi.fn()} />);
    expect(screen.getByLabelText('Nome')).toBeDisabled();
    expect(screen.getByLabelText('E-mail')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Salvando…' })).toBeDisabled();
  });

  it('gera ids diferentes em duas instâncias', () => {
    render(<>
      <ClienteForm initialValue={{ name: '', email: '' }} submitting={false} onSave={vi.fn()} />
      <ClienteForm initialValue={{ name: '', email: '' }} submitting={false} onSave={vi.fn()} />
    </>);
    const inputs = screen.getAllByLabelText('Nome');
    expect(inputs[0].id).not.toBe(inputs[1].id);
  });
});
```

**Arquivo: `tests/ConfirmDeleteModal.test.tsx`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: tests/ConfirmDeleteModal.test.tsx -->
```tsx
// Arquivo: tests/ConfirmDeleteModal.test.tsx
import { expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDeleteModal } from '../src/components/ConfirmDeleteModal';

const cliente = { id: 1, name: 'Maria', email: 'maria@example.com', createdAt: '2026-01-01T00:00:00Z' };

it('cancelar não confirma a exclusão', async () => {
  const onCancel = vi.fn();
  const onConfirm = vi.fn();
  render(<ConfirmDeleteModal cliente={cliente} busy={false} error={null}
    onCancel={onCancel} onConfirm={onConfirm} />);
  await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(onCancel).toHaveBeenCalledOnce();
  expect(onConfirm).not.toHaveBeenCalled();
});

it('confirmar chama a ação e oferece um diálogo identificado', async () => {
  const onConfirm = vi.fn();
  render(<ConfirmDeleteModal cliente={cliente} busy={false} error={null}
    onCancel={vi.fn()} onConfirm={onConfirm} />);
  expect(screen.getByRole('dialog', { name: 'Excluir cliente' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }));
  expect(onConfirm).toHaveBeenCalledOnce();
});

it('operação pendente bloqueia confirmação e cancelamento', () => {
  render(<ConfirmDeleteModal cliente={cliente} busy error={null}
    onCancel={vi.fn()} onConfirm={vi.fn()} />);
  expect(screen.getByRole('button', { name: 'Excluindo…' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
});
```

## 3. Simular serviços e verificar transições

A API real continua exigindo testes próprios. Aqui substituímos o service, preservando Context e Hooks reais para observar a sequência loading → user, falha → retry e logout.

**Arquivo: `tests/AuthProvider.test.tsx`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: tests/AuthProvider.test.tsx -->
```tsx
// Arquivo: tests/AuthProvider.test.tsx
import { beforeEach, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../src/contexts/AuthProvider';
import { useAuth } from '../src/hooks/useAuth';
import { authService } from '../src/services/authService';
import type { User } from '../src/types';

vi.mock('../src/services/authService', () => ({
  authService: { currentUser: vi.fn(), signIn: vi.fn(), signOut: vi.fn() },
}));
const alice: User = { id: 1, name: 'Alice', email: 'alice@example.com', createdAt: '2026-01-01T00:00:00Z' };
const bob: User = { ...alice, id: 2, name: 'Bob', email: 'bob@example.com' };

function Probe() {
  const { user, loading, sessionError, retrySession, signIn, signOut } = useAuth();
  return (
    <>
      <p>{loading ? 'Conferindo sessão' : user?.name ?? 'Sem sessão'}</p>
      {sessionError && <p role="alert">{sessionError}</p>}
      <button onClick={retrySession}>Tentar novamente</button>
      <button onClick={() => void signIn({ email: bob.email, password: 'senha-de-estudo' })}>Entrar</button>
      <button onClick={() => void signOut()}>Sair</button>
    </>
  );
}
beforeEach(() => {
  vi.mocked(authService.currentUser).mockReset().mockResolvedValue(null);
  vi.mocked(authService.signIn).mockReset().mockResolvedValue(bob);
  vi.mocked(authService.signOut).mockReset().mockResolvedValue(undefined);
});
function mount() { return render(<AuthProvider><Probe /></AuthProvider>); }

it('recupera o usuário da API ao abrir', async () => {
  vi.mocked(authService.currentUser).mockResolvedValue(alice);
  mount();
  expect(screen.getByText('Conferindo sessão')).toBeInTheDocument();
  expect(await screen.findByText('Alice')).toBeInTheDocument();
});

it('401 significa ausência de sessão, sem erro de rede', async () => {
  vi.mocked(authService.currentUser).mockRejectedValue(
    Object.assign(new Error('401'), { isAxiosError: true, response: { status: 401 } }));
  mount();
  expect(await screen.findByText('Sem sessão')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('falha de rede oferece nova tentativa', async () => {
  vi.mocked(authService.currentUser).mockRejectedValueOnce(new Error('offline'));
  mount();
  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível conferir a sessão');
  await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
  expect(await screen.findByText('Sem sessão')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('login muda o usuário compartilhado', async () => {
  mount();
  await screen.findByText('Sem sessão');
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByText('Bob')).toBeInTheDocument();
});

it('logout bem-sucedido remove o usuário', async () => {
  vi.mocked(authService.currentUser).mockResolvedValue(alice);
  mount();
  await screen.findByText('Alice');
  await userEvent.click(screen.getByRole('button', { name: 'Sair' }));
  expect(await screen.findByText('Sem sessão')).toBeInTheDocument();
  expect(authService.signOut).toHaveBeenCalledOnce();
});

it('recuperação antiga não sobrescreve login recente', async () => {
  let resolveSession!: (user: User | null) => void;
  vi.mocked(authService.currentUser).mockImplementation(() =>
    new Promise(resolve => { resolveSession = resolve; }));
  mount();
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  await screen.findByText('Bob');
  await act(async () => { resolveSession(alice); });
  expect(screen.getByText('Bob')).toBeInTheDocument();
});
```

**Arquivo: `tests/utils.test.ts`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: tests/utils.test.ts -->
```typescript
// Arquivo: tests/utils.test.ts
import { expect, it } from 'vitest';
import { getHttpError } from '../src/utils/getHttpError';
import { validateCliente } from '../src/utils/validateCliente';

it('normaliza a leitura de mensagens da API', () => {
  const error = Object.assign(new Error(), {
    isAxiosError: true, response: { status: 409, data: { error: 'Este e-mail já está em uso.' } },
  });
  expect(getHttpError(error)).toBe('Este e-mail já está em uso.');
});

it('entrada sem conteúdo útil é inválida', () => {
  expect(validateCliente({ name: '   ', email: 'sem-email' })).toHaveProperty('name');
  expect(validateCliente({ name: '   ', email: 'sem-email' })).toHaveProperty('email');
});
```

## 4. Executar e conhecer os limites

```bat
npm test
npm run build
```

São **15 casos**: quatro de formulário, três de modal, seis de autenticação e dois de funções puras. Nenhum altera banco ou tenta validar cookie real. CORS, armazenamento de HttpOnly e download de chunks precisam de navegador e servidor reais.

Para ampliar, acrescente testes de ProtectedRoute, GET com falha na listagem, navegação para detalhes, interceptors com 401 atrasado e cancelamento. Para validar services HTTP, teste o contrato de transporte separadamente ou use uma simulação como MSW; não faça todos os testes dependerem de um banco.
## Conferência antes de avançar

- [ ] Os 15 testes passam na cópia construída.
- [ ] Falha de validação impede onSave.
- [ ] Cancelamento do modal não confirma.
- [ ] Recuperação antiga não substitui novo login.
- [ ] Build continua passando.

## Prática do estudante

Quebre temporariamente a normalização do e-mail e execute os testes. Confira que um teste relevante falha. Reverta a mudança; um teste útil deve detectar regressão observável.

## Se algo falhar

Se faltar jest-dom, confira setupFiles. Se houver elementos de testes anteriores, confira cleanup. Se api reclamar de ambiente, configure VITE_API_URL como no capítulo 29.

Referências: [Vitest](https://vitest.dev/guide/) · [Testing Library](https://testing-library.com/docs/react-testing-library/intro/) · [user-event](https://testing-library.com/docs/user-event/intro/).

[← Anterior](34-acessibilidade.md) · [Índice](../README.md) · [Próxima →](36-build-e-publicacao.md)
