# Arquivos Legados / Não Utilizados

Este diretório contém arquivos de configurações antigas que não são mais necessárias para o projeto atual (Vite + React).

## Arquivos movidos para backup:

### `prisma.config.ts.backup`
- **Status**: Não utilizado
- **Motivo**: O projeto atual é front-end puro (Vite + React)
- **Prisma**: Schema existe mas não está ativo (seria para backend futuro)
- **Ação**: Arquivo renomeado para `.backup` para evitar erros TypeScript

### `pages/` → `api-backup/`
- **Status**: Não utilizado
- **Motivo**: Pasta `pages/` é convenção do Next.js, mas o projeto usa Vite
- **Ação**: Renomeada para `api-backup/` para evitar confusão

## Projeto Atual

O projeto **LiviaAdvogados** é uma aplicação front-end pura usando:
- ⚡ **Vite** (build tool)
- ⚛️ **React 18** (UI)
- 💾 **LocalStorage** (persistência no cliente)
- 🛡️ **DOMPurify** (segurança)

Não há backend ativo no momento. Todos os dados são armazenados localmente no navegador.
