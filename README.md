# Gerador de Propostas - Livia Advogados

# Gerador de Propostas - Livia Advogados

App em Next.js (React) para gerar propostas advocatícias dinâmicas e processar modelos .docx no servidor.

Requisitos:

- Node 18+ e npm

Instalação (Windows cmd.exe):

npm install

Rodar em desenvolvimento:

npm run dev

Build para produção:

npm run build

Deploy na Vercel:

- Crie uma conta em https://vercel.com e vincule o repositório (GitHub/GitLab/Bitbucket).
- Vercel detecta automaticamente um app Next.js. Use o branch `main` (ou o branch de sua preferência).

Funcionalidades implementadas nesta versão:

- Editor lateral para selecionar município, data e quais serviços (2.1-2.7) incluir
- Preview do documento com estrutura básica
- Copiar o HTML do preview para área de transferência
- Upload de modelo .docx e processamento server-side (substituição de município/data e remoção das seções 2.2-2.8)
- Geração e download do .docx ajustado via API

Próximos passos sugeridos:

- Ajustar heurísticas de extração/removal usando exemplos reais de .docx
- Preservar formatação/tabelas do documento original (pode exigir processamento mais avançado)
- Polir layout e paleta de cores
