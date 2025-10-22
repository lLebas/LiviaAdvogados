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

Suporte ao Supabase (opcional):

- Se você quiser persistir propostas em produção (Vercel) recomendo usar Supabase ou outro DB gerenciado. Crie uma tabela `propostas` com colunas JSON/text conforme necessário.
- Defina as variáveis de ambiente no Vercel / .env.local:

	NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
	NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
	SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # opcional, necessário para operações server-side com privilégios

- Quando o Supabase estiver configurado, a API usará Supabase automaticamente. Caso contrário, o app usará um arquivo local `data/proposals.json` como fallback (somente para desenvolvimento).

Limpeza automática:

- Propostas com mais de 7 dias são removidas automaticamente (lazy cleanup) ao listar/salvar. Também existe um endpoint DELETE para exclusão manual pelo usuário.

Deploy no Vercel
-----------------

- O app foi construído em Next.js e é compatível com deploys automáticos no Vercel.
- IMPORTANTE: O fallback por arquivo (`data/proposals.json`) não é persistente em ambientes serverless (como Vercel) — arquivos gravados no filesystem podem desaparecer entre implantações/cold starts. Por isso é fortemente recomendado configurar Supabase (ou outro banco gerenciado) para produção.

Passos rápidos:

1. Crie uma conta em https://vercel.com e conecte o repositório Git.
2. Em Settings > Environment Variables adicione as chaves (se usar Supabase):

	NEXT_PUBLIC_SUPABASE_URL
	NEXT_PUBLIC_SUPABASE_ANON_KEY
	SUPABASE_SERVICE_ROLE_KEY

3. Defina a Branch a ser implantada (por exemplo `main` ou `Feactue-Edições`).
4. Deploy será automático ao pushar commits.

Observações:

- Se não configurar Supabase, o app ainda irá funcionar, mas os dados salvos podem não persistir entre deploys.
- Para testes locais, use `.env.local` com as mesmas variáveis.
