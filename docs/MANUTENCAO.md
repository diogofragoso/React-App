# Manutenção da documentação

[Início](../README.md) · [Validação](RELATORIO-DE-VALIDACAO.md)

Este material é destinado a quem mantém o curso. O estudante segue os [11 capítulos do portal](../README.md#percurso-do-estudante). Relatórios e verificadores não são etapas obrigatórias para construir a interface.

Os exemplos e o script auxiliar de storage ficam em `docs/portal/*.md` (incluindo [REFERENCIA-ARQUIVOS.md](portal/REFERENCIA-ARQUIVOS.md)). O verificador lê esses arquivos, exige exatamente 11 capítulos numerados e compara os 32 blocos com os arquivos reais. `IMPLEMENTACAO.md` mantém somente um link para o percurso, sem duplicar os exemplos.

Na raiz do repositório de referência:

```powershell
npm.cmd run lint
node scripts/test-storage-security.mjs
node docs/scripts/sincronizar-portal.cjs
npm.cmd run build
```

Não existe script `npm test` neste `package.json`. O teste de storage faz inspeção textual e uma simulação de limpeza; não monta o AuthProvider nem abre navegador. O verificador documental compara cada bloco marcado com seu arquivo real, exige cobertura de `src` e `public` e verifica links locais. Ele falha se o código divergir do roteiro.

Depois de uma alteração intencional no aplicativo, atualize as explicações e execute:

```powershell
node docs/scripts/sincronizar-portal.cjs --write
node docs/scripts/sincronizar-portal.cjs
```

`--write` atualiza somente os blocos de código já marcados; ele não escreve explicações nem adiciona etapas para novos arquivos. Novos arquivos precisam de marcador e instrução no roteiro. As ferramentas de documentação e as evidências em `docs` pertencem ao repositório de referência; não são dependências de runtime da cópia de estudo.

## Script auxiliar de storage

O bloco completo de `scripts/test-storage-security.mjs` está incluído em [REFERENCIA-ARQUIVOS.md](portal/REFERENCIA-ARQUIVOS.md) para que o estudante também possa executá-lo ao concluir o capítulo 9.

