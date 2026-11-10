# Verificação da entrega — 10/11/2026

- TypeScript: `npm run typecheck`, sem erros, incluindo os testes de navegador.
- ESLint: sem erros; 7 avisos de Fast Refresh herdados dos componentes do template.
- Vitest: 5 arquivos e 16 testes aprovados. Cobrem regras financeiras, pagamentos em outro mês, horários, centavos, datas inválidas, recorrência e planejamento da meta.
- Playwright: 16 cenários aprovados, 8 no Chromium desktop e 8 em viewport/toque de iPhone 13 com Chromium. Cobrem proteção de rotas, dashboard, tarefas, despesas/saldo, valor padrão, conflitos, estados de erro, largura das oito telas internas, login/recuperação/saída e meta. Os quatro cenários de formulário foram reexecutados após o ajuste final de validação da data de pagamento e passaram.
- PostgreSQL 17 descartável em Docker: scripts de base e módulos executados com sucesso; reaplicação do script de módulos aprovada. Verificados criação de perfil por trigger, privacidade entre usuários, vínculos privados de plantões/tarefas, conflito na virada de dia, horários adjacentes, cancelamentos, inserção em lote sem gravação parcial e pagamento com data obrigatória. O container temporário foi removido.
- `npm run build`: build de produção Cloudflare/Nitro aprovado.
- Locks npm e Bun atualizados.

## Limites da verificação

O navegador usou uma API simulada; nenhum cadastro ou envio real de e-mail foi realizado. O teste SQL exercitou PostgreSQL/RLS reais com uma implementação mínima de `auth.users` e `auth.uid()`, não uma instalação completa do serviço Supabase Auth.

A URL e a chave pública originais responderam ao health check de autenticação (HTTP 200); a tabela `locations` respondeu via REST (HTTP 200). A consulta à tabela `expenses` retornou HTTP 404, coerente com o módulo ainda não instalado. Não houve autenticação administrativa, alteração do banco remoto ou publicação.

Antes de uso em produção, aplique `database/02-modulos.sql` no backend conectado e valide cadastro, login, recuperação e persistência com contas reais. As instruções estão no README. Transporte em tempo real e notificações push não estão implementados; o módulo de transporte fornece trajetos externos e fontes oficiais.

## Atualização: previsão por duração habitual

A calculadora de transporte acrescenta a duração média ao horário atual/saída escolhida ou subtrai duração e margem do horário desejado de chegada. A sugestão Queimados → Central usa os 70 minutos informados pelo usuário; a van Queimados → Maracanã exige o preenchimento da duração. As alterações de valores valem para a simulação atual; não há persistência desses ajustes nem consulta a partidas reais.

Após essa atualização: TypeScript e build aprovados; ESLint sem erros (os mesmos 7 avisos do template); 20 testes unitários aprovados em 6 arquivos. Os dois novos cenários de navegador passaram em desktop e celular, verificando chegada após a meia-noite, duração da van a preencher e cálculo da saída no dia/ano anterior com margem. As verificações anteriores do banco continuam aplicáveis, pois esta atualização não altera tabelas.

## Atualização PWA e iPhone

- Manifesto standalone, ícones PNG 192/512 e Apple 180, botão/guia de instalação no Safari e service worker de produção adicionados.
- Worker armazena apenas recursos públicos; a navegação usa rede e cai em uma página offline genérica. Testes verificaram que páginas de autenticação, tokens de recuperação e uma chamada privada não entram no cache.
- A resposta offline é reconstruída para funcionar também quando a hospedagem normaliza URLs `.html` com redirecionamentos.
- CSS atualizado para viewport dinâmica, áreas seguras, controles sem zoom automático e formulários com altura/posição ajustadas à área visível do teclado. O uso do zoom de acessibilidade foi preservado.
- Corrigido um estouro horizontal no cartão de local detectado pelo WebKit.
- O preview de produção passou a usar Wrangler local; o preview Vite herdado procurava uma entrada SSR que o preset Cloudflare não gera.
- TypeScript sem erros; lint sem erros, com os mesmos 7 avisos de Fast Refresh; 20 testes unitários aprovados.
- A suíte funcional foi ampliada para Chromium desktop, Chromium mobile e WebKit iPhone (27 cenários). A execução inicial aprovou 25; os testes de navegação que apontaram timeout e largura foram corrigidos e reexecutados nos três navegadores, todos aprovados.
- Seis testes de PWA passaram sobre o build real no emulador local Cloudflare, incluindo três no WebKit com viewport de iPhone: manifesto/ícones/guia de instalação, recuperação offline/cache público e modo instalado/fontes/tamanho de tela.
- Os testes WebKit rodaram em Linux, com bibliotecas do navegador extraídas localmente; não houve teste em um iPhone físico. Instalação pela interface do iOS, teclado real e serviço de e-mail precisam de conferência final no aparelho e no domínio HTTPS de produção.

As instruções para a Bruna e para quem publica estão em `IPHONE.md`. Nenhum banco remoto foi alterado e o app ainda precisa ser publicado em HTTPS para instalação no telefone.
