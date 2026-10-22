# 11 · Gerar o build e preparar a publicação

[← Anterior](10-integracao-local.md) · [Voltar ao percurso](../../README.md#percurso-do-estudante)

**Etapa 11 de 11.** Conclua o [capítulo 10](10-integracao-local.md) antes de continuar.

**Objetivo:** Gerar dist para o ambiente escolhido e compreender a configuração de hospedagem existente.

Os caminhos partem da raiz do frontend, onde fica package.json. Crie as subpastas necessárias e copie o conteúdo completo dos arquivos indicados. Comandos de terminal usam PowerShell e npm.cmd.

Para conferir o frontend contra a API local:

```powershell
npm.cmd run build:local
npm.cmd run preview -- --port 5173 --strictPort
```

Pare o servidor dev antes de usar a mesma porta. Para gerar o artefato apontando para a URL de `.env.production`:

```powershell
npm.cmd run build
```

O resultado fica em `dist`, não em `build`. A configuração em `public` é copiada pelo Vite para a raiz de `dist`. Existe também uma cópia na raiz do repositório; mantenha as duas iguais. O fallback atende a navegação direta em `/aluno` e `/professor` na hospedagem configurada.

**Arquivo: `public/staticwebapp.config.json`**

<!-- source: public/staticwebapp.config.json -->
```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "/*.{png,jpg,gif,ico,svg}"]
  },
  "responseOverrides": {
    "404": {
      "rewrite": "/index.html",
      "statusCode": 200
    }
  },
  "globalHeaders": {
    "content-security-policy": "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'"
  }
}
```
<!-- endsource -->

**Arquivo: `staticwebapp.config.json`**

<!-- source: staticwebapp.config.json -->
```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "/*.{png,jpg,gif,ico,svg}"]
  },
  "responseOverrides": {
    "404": {
      "rewrite": "/index.html",
      "statusCode": 200
    }
  },
  "globalHeaders": {
    "content-security-policy": "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'"
  }
}
```
<!-- endsource -->

O workflow abaixo é a configuração presente no repositório. Ele usa a raiz como `app_location`, nenhuma API interna e `dist` como saída. Para reproduzir CI/CD em outro repositório, crie o secret de deploy correspondente àquele recurso antes de ativá-lo. O nome do secret é uma referência, não seu valor. Não é necessário publicar para executar o portal localmente. Esta revisão não executa o workflow nem comprova disponibilidade dos recursos Azure.

**Arquivo: `.github/workflows/azure-static-web-apps-green-pond-0f2bcd00f.yml`**

<!-- source: .github/workflows/azure-static-web-apps-green-pond-0f2bcd00f.yml -->
```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
          lfs: false
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_GREEN_POND_0F2BCD00F }}
          repo_token: ${{ secrets.GITHUB_TOKEN }} # Used for Github integrations (i.e. PR comments)
          action: "upload"
          ###### Repository/Build Configurations - These values can be configured to match your app requirements. ######
          # For more information regarding Static Web App workflow configurations, please visit: https://aka.ms/swaworkflowconfig
          app_location: "/" # App source code path
          api_location: "" # Api source code path - optional
          output_location: "dist" # Built app content directory - optional (Vite gera na pasta 'dist')
          ###### End of Repository/Build Configurations ######

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_GREEN_POND_0F2BCD00F }}
          action: "close"
```
<!-- endsource -->

O código usa comunicação direta com a API pública, sem proxy `/api` no Vite. Consulte [ambientes, cookies e publicação](../GUIA-DEPLOY-AZURE-COOKIES.md) para as condições e limites desta configuração.

## Conferência antes de avançar

- [ ] O build para o ambiente escolhido concluiu.
- [ ] dist contém staticwebapp.config.json.
- [ ] Você distingue build local de uma publicação efetivamente validada.

[← Anterior](10-integracao-local.md) · [Voltar ao percurso](../../README.md#percurso-do-estudante)
