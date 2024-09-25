# `ubiquity/cloudflare-deploy-action`

A Github action to automate the deployment of static or full-stack app to Cloudflare pages.

## How to build & upload artifact

```yml
- name: Upload build artifact
  uses: actions/upload-artifact@v4
  with:
    name: full-stack-app
    path: |
      static
      functions
      package.json
      yarn.lock
```

## How to use the action in a workflow

```yml
jobs:
  deploy-to-cloudflare:
    name: Automatic Cloudflare Deploy
    runs-on: ubuntu-22.04
    steps:
      - name: Deploy to Cloudflare
        if: ${{ github.event.workflow_run.conclusion == 'success' }}
        uses: ubiquity/cloudflare-deploy-action@main
        with:
          repository: ${{ github.repository }}
          production_branch: ${{ github.event.repository.default_branch }}
          build_artifact_name: "full-stack-app"
          output_directory: "full-stack-app"
          current_branch: ${{ github.event.workflow_run.head_branch }}
          cloudflare_account_id: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          cloudflare_api_token: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          commit_sha: ${{ github.event.workflow_run.head_sha }}
          workflow_run_id: ${{ github.event.workflow_run.id }}
          statics_directory: "static"
```

## Artifact for static-only apps

This method is not recommended. All new static-only and full-stack apps should use artifact directory structure given above. The old apps should also transition to the new directory structure of the artifact.
For backward compatibility, the action also works for static-only project with following artifact.

```yml
- name: Upload build artifact
  uses: actions/upload-artifact@v4
  with:
    name: static
    path: static
```

Using the action in workflow with static-only artifact:

```yml
jobs:
  deploy-to-cloudflare:
    name: Automatic Cloudflare Deploy
    runs-on: ubuntu-22.04
    steps:
      - name: Deploy to Cloudflare
        if: ${{ github.event.workflow_run.conclusion == 'success' }}
        uses: ubiquity/cloudflare-deploy-action@main
        with:
          repository: ${{ github.repository }}
          production_branch: ${{ github.event.repository.default_branch }}
          build_artifact_name: "static"
          output_directory: "static"
          current_branch: ${{ github.event.workflow_run.head_branch }}
          cloudflare_account_id: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          cloudflare_api_token: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          commit_sha: ${{ github.event.workflow_run.head_sha }}
          workflow_run_id: ${{ github.event.workflow_run.id }}
```
