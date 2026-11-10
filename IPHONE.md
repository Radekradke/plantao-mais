# Usar o Plantão+ no iPhone

## Instalação da Bruna

Depois que o aplicativo estiver publicado em um endereço **HTTPS**:

1. Abra o endereço do Plantão+ no **Safari** do iPhone.
2. Toque em **Compartilhar**. Dependendo da versão do iOS, esse botão fica dentro do menu do Safari.
3. Escolha **Adicionar à Tela de Início**.
4. Se aparecer a opção **Abrir como App**, deixe-a ativada e toque em **Adicionar**.
5. Abra o ícone **Plantão+** criado na tela inicial e entre na conta. Na primeira abertura pelo ícone, o iOS pode pedir login novamente.

A tela de login e o cabeçalho do aplicativo também têm um botão **Instalar aplicativo** com essas instruções.

## O que esta versão oferece

- Ícones de alta resolução próprios para iPhone e identidade visual consistente.
- Abertura em janela própria ao usar o ícone da tela inicial.
- Áreas seguras para barra de status, recortes de tela e indicador inferior do iPhone.
- Campos com tamanho de fonte que evita o zoom automático do Safari, sem bloquear o zoom de acessibilidade.
- Formulários deslizantes com altura dinâmica e rolagem para telas pequenas.
- Atualização do aplicativo oferecida quando uma nova versão estiver pronta. Salve o formulário antes de tocar em **Atualizar app**.
- Aviso de perda de conexão e página de recuperação quando abrir o app sem internet após o primeiro acesso online.

## Internet e dados

A consulta e a edição de plantões, perfil, despesas, metas e tarefas precisam de conexão. Não há modo de edição offline nem sincronização de alterações feitas offline nesta versão. O cache do PWA contém somente recursos públicos (ícones, arquivos de interface e página offline); páginas internas, respostas do Supabase e links de recuperação não são armazenados nele.

O PWA não inclui notificações push, alarmes em segundo plano ou publicação na App Store. A instalação é feita pelo Safari. Não é necessário contratar uma API de transporte para a calculadora por duração habitual.

## Preparação de quem publica

- Configure o Supabase e execute o SQL dos módulos indicado no README.
- Publique o Worker e os assets do build juntos, com HTTPS.
- Autorize o domínio final e os redirects no Supabase Auth.
- O manifesto (`/manifest.webmanifest`), o worker (`/sw.js`) e os ícones (`/icons/*`) devem ficar acessíveis no mesmo domínio, a partir da raiz.
- Preserve os cabeçalhos de `public/_headers`, especialmente a revalidação de `sw.js`.
- Em atualizações que alterarem o conjunto de arquivos públicos, incremente `CACHE` em `public/sw.js` para remover o cache público antigo na ativação.

Para testar o build local:

```sh
npm ci
npm run build
npm run preview
```

O comando de preview usa Wrangler local, sem publicar no Cloudflare. O endereço aparece no terminal. HTTP em `localhost` permite os testes locais do worker; para instalar no iPhone acessando pela rede, use uma publicação HTTPS. Um endereço HTTP com o IP do computador não habilita todos os recursos do PWA.

Para as verificações automatizadas:

```sh
npx playwright install --with-deps chromium webkit
npm run test:e2e
npm run test:pwa
```

Os testes incluem WebKit em viewport de iPhone e execução do build de produção no emulador local de Cloudflare. Isso não substitui a conferência final da instalação e do teclado no aparelho físico da Bruna.
