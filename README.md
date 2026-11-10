# Plantão+ — Bruna

Aplicação web responsiva em português para organizar plantões, hospitais, recebimentos, despesas e a viagem para Cartagena. Mantém React, TanStack Start/Router/Query, Tailwind, shadcn/ui e Supabase do projeto Lovable original.

## Executar no computador

Requer Node.js 22.12+ (validado com Node 24) e npm.

```sh
npm ci
test -f .env || cp .env.example .env
# Preencha o .env com a URL e a chave pública do seu Supabase.
npm run dev
```

A cópia de trabalho e os pacotes ZIP mantêm o `.env` público original recebido. No GitHub, o `.env` fica excluído: use o arquivo `.env.example` e configure seu Supabase. Se ele já estiver presente, não é necessário substituí-lo. Para usar outro projeto, copie `.env.example` e ajuste os valores. Os quatro valores de URL/chave no exemplo devem apontar para o mesmo projeto. Use somente chave **publishable** ou **anon**; chaves secretas e `service_role` nunca entram em variáveis `VITE_*`. O `.env` fica fora do Git.

## Ativar o banco

O código não aplica mudanças automaticamente no banco remoto. As instruções Lovable do projeto e os arquivos gerados em `drizzle/` e `src/integrations/supabase/` foram preservados. Os arquivos em `database/` são scripts separados para revisão e aplicação administrativa.

1. **No banco já conectado ao Lovable:** a base `profiles`, `locations` e `shifts` já existe. Não execute `01-base.sql` novamente. Aplique **somente `database/02-modulos.sql`** no SQL Editor do backend, com uma conta administrativa.
2. **Em um Supabase novo:** execute primeiro `database/01-base.sql` (cópia da migração original, para uma base vazia) e depois `database/02-modulos.sql`.
3. No painel de autenticação, habilite e-mail/senha, configure a URL do site e autorize os redirects de desenvolvimento e de produção: `/dashboard` e `/auth?recovery=1`. Confirmação e recuperação dependem do serviço de e-mail do Supabase; para produção, configure o SMTP e suas cotas.
4. Cadastre uma conta pela interface, confirme o e-mail e cadastre o primeiro local antes de criar plantões.

`02-modulos.sql` é transacional e pode ser reaplicado. Cria despesas, meta e tarefas com RLS por usuário; também adiciona uma restrição que bloqueia plantões sobrepostos, inclusive gravações simultâneas em aparelhos diferentes. A atualização não exclui dados. Se houver conflitos antigos, a instalação dessa restrição falhará e a transação será revertida: corrija os horários antes de reaplicar.

Para localizar conflitos existentes, o administrador pode executar:

```sql
SELECT a.id AS plantao_a, b.id AS plantao_b, a.date, b.date
FROM public.shifts a
JOIN public.shifts b ON a.user_id = b.user_id AND a.id < b.id
WHERE a.status <> 'cancelado' AND b.status <> 'cancelado'
AND tsrange(a.date + a.start_time,
  a.date + a.end_time + CASE WHEN a.end_time <= a.start_time THEN interval '1 day' ELSE interval '0 day' END, '[)')
&& tsrange(b.date + b.start_time,
  b.date + b.end_time + CASE WHEN b.end_time <= b.start_time THEN interval '1 day' ELSE interval '0 day' END, '[)');
```

As verificações de horário nulo e pagamento sem data são `NOT VALID`: não removem registros históricos inconsistentes e passam a valer para novas gravações/alterações. Pagos antigos sem `paid_at` devem ter a data real preenchida na edição; o app não inventa datas históricas para contabilizá-los.

## Funcionalidades

- Cadastro, login, confirmação de e-mail, recuperação de senha e saída. Rotas internas exigem sessão válida; a troca/saída de conta limpa o cache.
- Perfil com nome e profissão editáveis.
- Locais: criar, listar, editar e excluir; a exclusão de hospitais vinculados a plantões é bloqueada.
- Plantões: CRUD completo com tipo, status, valor padrão editável, pagamento, data e observações. Filtro mensal e calendário com seleção de dia.
- Duração incluindo virada de dia, aviso para plantões acima de 12 horas e bloqueio de sobreposição. Recorrência semanal/quinzenal de 2 a 52 ocorrências, inseridas em um único lote; qualquer conflito impede o lote inteiro. Cada ocorrência é um registro independente, editado/excluído individualmente.
- Dashboard: próximo plantão e resumo do mês.
- Financeiro: despesas por categoria e mês, recebimentos, saldo líquido e valores pendentes dos plantões do mês. Despesas têm criação, edição e exclusão.
- Cartagena: meta e prazo editáveis, valor guardado, aportes futuros e ganho líquido por extra; calcula extras necessários e esforço mensal.
- Rotina por plantão: tarefas e marmitas, marcar/desmarcar conclusão e remover. Abra um plantão já salvo para acessar a rotina.
- Transporte RJ: calculadora de chegada pela duração habitual, com Queimados → Central de trem pré-preenchido em 70 minutos. Inclui van Queimados → Maracanã e outro trajeto com duração a informar, saída imediata ou escolhida, cálculo inverso para chegar em um horário e margem opcional. Os valores editados valem para a simulação atual e não são salvos. Mantém trajetos externos no Google Maps e fontes oficiais de trens, metrô, ônibus e BRT.
- Navegação inferior no celular, ferramentas adicionais no topo e barra lateral no desktop. Erros de consulta têm estado próprio, sem aparecer como ausência de dados.

## Regras financeiras

- **Previsto:** valor dos plantões cuja data está no mês, excluindo cancelados.
- **Recebido:** valor dos plantões pagos cuja **data de pagamento** está no mês, mesmo que o trabalho tenha ocorrido antes. Um pagamento registrado continua sendo receita mesmo se o plantão for cancelado depois; estornos podem ser registrados como despesa.
- **Saldo líquido:** recebido no mês menos despesas registradas no mês. Não calcula impostos automaticamente.
- **A receber:** plantões não cancelados do mês de trabalho que ainda estão pendentes; não representa todo o histórico de dívidas anteriores.
- **Meta:** custo menos valor guardado e aportes futuros planejados; divide o restante pelo ganho líquido por extra e arredonda para cima. Conta um aporte por mês após o mês atual, incluindo o mês da viagem. O valor guardado é atualizado manualmente: uma receita profissional não significa necessariamente um depósito para a viagem.
- Valores são tratados em centavos nas somas. Datas civis e horários seguem o relógio local do aparelho; plantão com fim anterior ao início termina no dia seguinte. Início e fim iguais são rejeitados; jornadas de 24h devem ser divididas.

## Verificações

```sh
npm run typecheck
npm run lint
npm test
npm run build

# Testes reais das tabelas/regras em PostgreSQL descartável (requer Docker):
npm run test:db

# Navegador desktop e celular (API simulada; não envia e-mails nem cria contas reais):
npx playwright install chromium
npm run test:e2e
```

Os testes do banco criam apenas uma instância Docker temporária, com um simulador mínimo de `auth.users`/`auth.uid()`. Exercitam PostgreSQL/RLS reais, criação do perfil por trigger, acesso entre usuários, vínculos privados, horários noturnos, atomicidade dos lotes e restrições de pagamento. Não substituem a verificação de autenticação/e-mails no Supabase de produção.

## Publicação e limites atuais

```sh
npm run build
npm run preview
```

O build atual usa TanStack Start com preset Cloudflare/Nitro herdado do Lovable e gera `.output/server/wrangler.json`. Publique o Worker e os assets juntos usando a integração Lovable existente ou o fluxo Cloudflare/Nitro. Não publique somente a pasta de assets como se fosse uma SPA estática. Configure as variáveis públicas antes do build e autorize o domínio final na autenticação.

**Ainda depende da conta de vocês:** aplicar o SQL dos módulos novos, validar cadastro/login/confirmação/recuperação com o e-mail real e publicar no domínio escolhido. A versão entregue é código pronto para essas etapas; não foi publicada nem teve o banco remoto alterado.

**Transporte:** não há ingestão de GPS, previsão de chegada, GTFS ou alertas operacionais em tempo real dentro do app. A previsão local soma a duração informada ao horário de saída, ou calcula a saída a partir da chegada desejada. Essa calculadora funciona sem API paga ou novas tabelas. Em “Sair agora”, atualiza o relógio a cada 30 segundos. Inclua espera, caminhada e baldeações na duração; o trecho de trem até a Central não representa automaticamente a viagem completa até outro destino. O módulo também usa links de trajeto e fontes oficiais. Uma integração ao vivo exige escolher e validar a disponibilidade/licença/cotas de uma fonte.

**PWA no iPhone:** manifesto, ícones Apple, abertura standalone, guia de instalação, áreas seguras e página de recuperação sem conexão estão implementados. Consulte [IPHONE.md](IPHONE.md). O acesso e a edição dos dados exigem internet; não há edição offline.

**Alertas:** conflitos e jornadas longas aparecem na interface; não há push, alarmes em segundo plano ou distribuição nas lojas nesta versão.

## Organização

Domínios em `src/features/{locations,shifts,finance,goals,routine,profile,transport}`; componentes compartilhados em `src/components/app`; páginas protegidas em `src/routes/_authenticated`. Tipos dos módulos adicionais ficam em `src/features/finance/database.ts`, separados dos tipos gerados do Lovable. O `package-lock.json` permite instalação reproduzível com npm; se continuar por npm, use esse lockfile.
