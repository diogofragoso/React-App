<!-- Documento: docs/27-perfis-e-permissoes.md -->

# 27 · Perfis e permissões

[← Anterior](26-logout.md) · [Índice](../README.md) · **Etapa 27 de 36** · [Próxima →](28-erros-http-globais.md)

**Ponto de partida:** conclua a conferência do capítulo 26 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Estudante distingue autenticação, autorização da API e visibilidade na interface.

**Conceitos praticados:** condicionais, props, roles, composição, contratos, autorização.

## 1. Revisar a política existente

| Recurso | Regra real do guia |
|---|---|
| Conta User | Somente o titular pode consultar, alterar e excluir |
| Contato Cliente | Compartilhado entre usuários autenticados |
| Administrador | Não implementado |
| role em User | Não faz parte do JSON |

Não acrescente role opcional ao tipo para supor uma permissão que o servidor não fornece. Nesta etapa a aplicação continua com a política real. O exemplo abaixo é **isolado, não conectado à autenticação**, para exercitar condicionais e props.

**Arquivo: `src/examples/PermissionsDemo.tsx`**

Crie este arquivo e copie todo o conteúdo.

<!-- file: src/examples/PermissionsDemo.tsx -->
```tsx
// Arquivo: src/examples/PermissionsDemo.tsx
import type { ReactNode } from 'react';

type DemoRole = 'admin' | 'user';
interface PermissionsDemoProps { role: DemoRole; children?: ReactNode }

export function PermissionsDemo({ role, children }: PermissionsDemoProps) {
  const canManage = role === 'admin';
  return (
    <section aria-label="Demonstração de permissão">
      <h2>Exemplo isolado de interface</h2>
      {canManage ? <p>Opção administrativa visível.</p> : <p>Opção administrativa oculta.</p>}
      {canManage && children}
    </section>
  );
}
```

## 2. Experimentar sem alterar a política do produto

Em uma página de estudo temporária, importe PermissionsDemo e passe role="admin" e role="user" separadamente. role aqui é uma prop explícita de demonstração, não o user do Context. Compare ternário e &&. Remova a montagem experimental ao concluir.

Ocultar um botão não impede que alguém envie HTTP manualmente. Para implementar perfis reais será necessário:

1. Definir quais contas recebem cada papel e quem pode alterá-lo.
2. Implementar persistência, validação e autorização na API.
3. Expor somente os dados públicos necessários no login e recuperação.
4. Atualizar o contrato User e decidir quais ações a interface mostra.
5. Testar 403 no servidor para quem não tem permissão.

Não permita que o cliente escolha “admin” livremente em POST /users. Esta é uma ampliação do backend, fora do contrato atual do guia.
## Conferência antes de avançar

- [ ] A aplicação não inventa administrador nem usa role inexistente.
- [ ] Demonstração fica identificada e isolada.
- [ ] Estudante explica por que a API precisa validar cada ação.

## Prática do estudante

Monte uma matriz de permissões para um produto futuro antes de escrever código. Diferencie leitura da própria conta, alteração de contatos compartilhados e administração.

## Se algo falhar

Se aparecer 403 ao consultar outra conta, a API está aplicando a política correta. Não altere o frontend para contornar a regra.

Referências: [Política de acesso da API](../../api_t13/README.md) · [Condicionais React](https://react.dev/learn/conditional-rendering).

[← Anterior](26-logout.md) · [Índice](../README.md) · [Próxima →](28-erros-http-globais.md)
