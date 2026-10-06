<!-- Documento: docs/09-dashboard.md -->

# 09 · Dashboard do usuário autenticado

[← Anterior](08-layout-principal.md) · [Índice](../README.md) · **Etapa 9 de 36** · [Próxima →](10-buscando-clientes.md)

**Ponto de partida:** conclua a conferência do capítulo 08 antes de avançar. Os caminhos partem da raiz do frontend, onde fica `package.json`. Comandos são para o **CMD**.

## Resultado desta etapa

Dashboard mostra a conta recuperada do servidor.

**Conceitos praticados:** useContext, JSX com expressões, props, null, renderização condicional, dados derivados.

## 1. Consumir os dados existentes

Não crie um segundo estado para copiar user.name. Esse texto pode ser calculado diretamente do contexto. Se user mudar, o consumidor recebe o novo valor.

**Arquivo: `src/pages/Home/index.tsx`**

Substitua todo o conteúdo.

<!-- file: src/pages/Home/index.tsx -->
```tsx
// Arquivo: src/pages/Home/index.tsx
import { Card } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';

export function Home() {
  const { user } = useAuth();
  if (!user) return null;
  const firstName = user.name.trim().split(/\s+/)[0];
  return (
    <>
      <h1>Olá, {firstName}!</h1>
      <Card>
        <Card.Body>
          <Card.Title>Minha conta</Card.Title>
          <dl>
            <dt>Nome</dt><dd>{user.name}</dd>
            <dt>E-mail</dt><dd>{user.email}</dd>
          </dl>
          <p>Próxima entrega: consultar os clientes cadastrados.</p>
        </Card.Body>
      </Card>
    </>
  );
}
```

## 2. Observar a relação entre origem e apresentação

O Provider é a fonte do usuário. O dashboard deriva firstName durante o render, sem efeito. React escapa strings exibidas em JSX; não use dangerouslySetInnerHTML para mostrar o nome recebido.

O guia da API não devolve role nem oferece métricas agregadas. A primeira Home mostra dados que realmente existem. O próximo capítulo inicia a listagem de contatos.
## Conferência antes de avançar

- [ ] Nome e e-mail correspondem à conta usada no login.
- [ ] F5 recupera a conta antes de apresentar o dashboard.
- [ ] Nome derivado não foi duplicado em useState.

## Prática do estudante

Mostre a data de criação com `new Date(user.createdAt).toLocaleDateString('pt-BR')`. Explique por que createdAt continua sendo string no contrato HTTP.

## Se algo falhar

Se os dados forem undefined, inspecione data.user no login e data[0] em /users. Não invente campos para preencher a tela.

Referências: [Não precisar de um efeito](https://react.dev/learn/you-might-not-need-an-effect).

[← Anterior](08-layout-principal.md) · [Índice](../README.md) · [Próxima →](10-buscando-clientes.md)
