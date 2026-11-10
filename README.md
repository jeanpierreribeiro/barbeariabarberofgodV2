# God Of Barber — site (variação "Arco")

Site de uma página da barbearia God Of Barber (Jardim Leblon, Belo Horizonte).
HTML, CSS e JavaScript puros: não há instalação nem etapa de build.

## Ver no computador

Abra `index.html` no navegador.

## Publicar na Vercel

1. Em vercel.com, escolha **Add New → Project** e importe este repositório.
2. Não mude nada nas configurações: o `vercel.json` já informa que é um site
   estático servido a partir da raiz (sem framework, sem comando de build).
3. Clique em **Deploy**. Cada novo `git push` na branch `main` publica de novo.

## Antes de divulgar o endereço

- **Domínio:** em `index.html`, troque `https://seu-dominio.example` pelo endereço
  final (aparece em `canonical`, `og:url`, `og:image` e nos dados estruturados).
- **WhatsApp:** preencha o número em `js/config.js` (ex.: `"5531999999999"`).
- **Fonte dos títulos:** confirme a licença de uso na web da EFCO Barnis
  (`assets/fonts/Barnis-Regular.otf`). A Bricolage Grotesque é livre (OFL).

## Estrutura

```
index.html        página inteira (SEO, dados estruturados, conteúdo)
css/tokens.css    cores e medidas do design system
css/site.css      estilos do site
js/config.js      número do WhatsApp
js/main.js        menu, slideshow, animações, carrossel de depoimentos
assets/           logos, fotos, ícones e fontes
vercel.json       configuração da hospedagem
```
