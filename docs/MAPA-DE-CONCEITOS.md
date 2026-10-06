<!-- Documento: docs/MAPA-DE-CONCEITOS.md -->

# 🧠 Mapa de conceitos

[Índice geral](../README.md) · [Contrato da API](CONTRATO-DA-API.md)

Use esta tabela para revisar fundamentos no contexto de uma entrega real. A trilha cobre a base de uma SPA React com TypeScript; não pretende reproduzir todas as APIs de React, SSR ou frameworks.

| Conceito | Onde praticar | Exercício observável |
|---|---|---|
| Componentes, JSX e imports | [01](01-criacao-basica-do-projeto.md), [02](02-arquitetura-e-rotas.md) | Renderizar tela e separar páginas |
| Props, children e composição | [05](05-contexto-de-autenticacao.md), [08](08-layout-principal.md), [12](12-componentes-com-props.md) | Provider, layout e cartão |
| Eventos e formulário controlado | [04](04-tela-de-login.md), [14](14-cadastro-de-cliente.md) | Digitar e submeter sem recarregar |
| State como snapshot | [04](04-tela-de-login.md), [15](15-estado-dos-formularios.md) | Explicar setter e nova renderização |
| Elevar e compartilhar estado | [05](05-contexto-de-autenticacao.md), [19](19-modal-de-confirmacao.md) | Usuário no Provider e seleção no pai |
| Context e useContext | [05](05-contexto-de-autenticacao.md), [25](25-feedback-com-toasts.md) | Sessão e avisos acima das rotas |
| Efeitos, dependências e cleanup | [06](06-recuperando-a-sessao.md), [10](10-buscando-clientes.md), [13](13-detalhes-do-cliente.md) | Sessão, listagem e troca de id |
| useRef | [06](06-recuperando-a-sessao.md), [34](34-acessibilidade.md) | Versão da sessão e foco no input |
| Condicionais e early return | [07](07-rotas-privadas.md), [20](20-estados-da-interface.md) | Loading, erro, vazio e proteção |
| Listas e identidade com key | [11](11-renderizando-listas.md), [17](17-edicao-de-cliente.md) | Itens com id e remontagem do formulário |
| Objetos e arrays imutáveis | [15](15-estado-dos-formularios.md), [18](18-exclusao-de-cliente.md), [22](22-ordenacao-e-paginacao.md) | Spread, filter e cópia antes de sort |
| Estado derivado | [09](09-dashboard.md), [16](16-validacao-do-formulario.md), [21](21-pesquisa-e-filtros.md) | Nome, erros e lista filtrada |
| Callback props | [16](16-validacao-do-formulario.md), [18](18-exclusao-de-cliente.md), [19](19-modal-de-confirmacao.md) | onSave, onDelete, onConfirm |
| useReducer | [25](25-feedback-com-toasts.md) | Ações de adicionar/remover aviso |
| Custom Hooks | [23](23-custom-hooks.md) | Extrair consulta sem presumir cache global |
| HTTP e Promises | [03](03-servicos-e-tipagens.md), [24](24-services-por-dominio.md), [28](28-erros-http-globais.md) | Serviços, contrato e falhas |
| Router, navegação e Outlet | [02](02-arquitetura-e-rotas.md), [07](07-rotas-privadas.md), [13](13-detalhes-do-cliente.md) | Rotas públicas, privadas e dinâmicas |
| Pureza, render e commit | [31](31-renderizacoes.md) | Profiler e observação de atualizações |
| memo, useMemo e useCallback | [32](32-otimizacao.md) | Experimento isolado antes de otimizar |
| lazy e Suspense | [33](33-lazy-loading.md) | Chunks por página e espera de módulo |
| useId, semântica e ARIA | [34](34-acessibilidade.md) | Ids únicos e erros associados |
| Testes de comportamento | [35](35-testes-react.md) | Interação, modal e sessão simulada |
| Ambiente e produção | [29](29-variaveis-de-ambiente.md), [36](36-build-e-publicacao.md) | Build público, HTTPS e fallback |

## Revisão orientada por problemas

- Minha tela perdeu estado: veja montagem, identidade e key no capítulo 17.
- HTTP dispara em loop: confira render versus efeito e dependências nos capítulos 06 e 13.
- Quero copiar props para state: veja estado derivado e a montagem do formulário nos capítulos 16 e 17.
- Componentes repetem consulta: leia custom Hooks no capítulo 23; extrair lógica não cria cache.
- Quero restringir uma ação: confirme a regra do servidor no capítulo 27.
- Quero memoizar tudo: registre uma medição antes, nos capítulos 31 e 32.

## Possíveis aprofundamentos após a base

Error Boundaries, testes em navegador, portais, controle de foco após navegação, cache de consultas, useTransition/useDeferredValue, ações e formulários do React 19, SSR e hidratação são extensões possíveis. Cada uma deve entrar com um problema e critérios próprios. Recursos modernos não precisam ser adicionados para justificar uma tela simples.
