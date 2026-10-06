<!-- Documento: docs/RELATORIO-DE-VALIDACAO.md -->

# ✅ Validação da documentação React

[Índice](../README.md) · [Contrato](CONTRATO-DA-API.md)

Revisão realizada em **2 de outubro de 2026**, na trilha de 36 capítulos. O escopo é a documentação: os exemplos foram reconstruídos em uma área isolada, sem aplicar as evoluções ao src da aplicação existente.

## Resultado verificado

| Verificação | Resultado |
|---|---|
| Criação do template | create-vite@9.2.1 gerou React + TypeScript sem interação |
| Exemplos cumulativos | Os 36 capítulos passaram na conferência TypeScript |
| Tipos e imports | Conferência com strict, noUnusedLocals e noUnusedParameters |
| Testes de interface | 15 testes aprovados, em quatro arquivos |
| Build final | tsc -b e Vite concluíram; chunks de cinco páginas foram gerados |
| Documentação | Links relativos e fechamento de blocos conferidos pelo script |

A validação TypeScript recompõe os arquivos completos identificados em cada capítulo. Não utiliza o src existente como atalho para fornecer componentes que ainda não foram ensinados. O host do compilador bloqueia arquivos de etapas posteriores na resolução local.

## Ambiente e versões

| Ferramenta | Versão usada |
|---|---|
| Node dos testes e build | 24.15.0, runtime isolado |
| Node disponível inicialmente | 24.11.1 |
| npm | 11.12.1 |
| React e React DOM | 19.3.0 |
| TypeScript | 6.0.3 |
| Vite / plugin React | 8.3.1 / 6.1.1 |
| React Router DOM | 7.18.4 |
| Axios | 1.20.0 |
| Bootstrap / React Bootstrap | 5.3.8 / 2.10.10 |
| Vitest / jsdom | 5.0.3 / 30.1.1 |
| Testing Library React | 16.3.3 |
| user-event / jest-dom | 14.6.7 / 7.0.1 |

A primeira execução dos testes também passou com Node 24.11.1, mas jsdom e dependências declararam requisito de Node 24.15.0. A aprovação de testes e build deste relatório usa o runtime compatível 24.15.0. A instalação global do usuário não foi atualizada.

## Evidências

- [Conferência por capítulo e links](evidencias/validacao-estatica.json).
- [Resultado dos 15 testes](evidencias/testes.json).
- [Ambiente e versões](evidencias/ambiente.json).
- [Build e hashes dos arquivos reconstruídos](evidencias/build.json).

Os testes verificam formulário inválido e foco, envio normalizado, bloqueio durante envio, ids únicos, ações do modal, recuperação de sessão, 401, erro de rede com tentativa, login, logout, resposta antiga após login e funções puras.

## Repetir a conferência

Na raiz de react-project, com dependências instaladas:

```bat
node docs\scripts\validar-guia.cjs
```

O verificador grava a reconstrução em docs/.validacao/projeto e a evidência em docs/evidencias/validacao-estatica.json. docs/.validacao é ignorada pelo Git.

Para reproduzir a aplicação completa em uma pasta nova, siga o capítulo 1, copie os arquivos em ordem e use os comandos dos capítulos 35 e 36. Preserve os arquivos de configuração gerados pelo Vite e o lockfile; configure VITE_API_URL no capítulo 29.

## Limites práticos

Esta revisão não executou uma sessão de navegador contra a API real, não alterou banco e não publicou o frontend. Os testes de autenticação simulam o service. Não comprovam CORS, armazenamento do cookie HttpOnly, autorização do servidor, navegação direta na hospedagem ou acessibilidade com leitor de tela.

Essas verificações estão nas listas dos capítulos e no roteiro final do [capítulo 36](36-build-e-publicacao.md). A conclusão desta revisão é: o material possui exemplos cumulativos tipados, testes de comportamento aprovados e build final gerado no ambiente registrado.
