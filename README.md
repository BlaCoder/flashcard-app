# Hanzi Cards — Mobile

App simples (HTML/CSS/JS) para estudar ideogramas do chinês no celular. Sem servidor, funciona direto no navegador com armazenamento local (localStorage).

## Recursos
- **Listas**: crie, renomeie, apague e edite listas de cartões.
- **Cartões**: Hanzi, pinyin, significado, alternativas (ex.: tradicional) e várias frases de exemplo.
- **Estudo**: o ideograma aparece grande, exemplos logo abaixo e um campo para digitar. Se errar, aparecem o **pinyin** e o **significado**. Se acertar, vai para o próximo.
- **Opções**: embaralhar e repetir no fim. Importação/Exportação em JSON.
- **Mobile-first**: botões grandes, layout responsivo, input fixo no rodapé.

## Como executar

### Opção A — Abrir direto (sem servidor)
1. Extraia o ZIP.
2. Abra o arquivo `index.html` no navegador do seu celular ou computador (dica: arraste e solte no navegador do desktop). 

> Observação: Alguns navegadores bloqueiam importação de arquivos locais por segurança. Este app não faz `fetch` de arquivos externos, então abrir direto funciona bem.

### Opção B — Servidor local (Python)
Se preferir, rode um servidor HTTP local (útil para testar no celular na mesma rede):

```bash
# Python 3
cd hanzi-cards-mobile
python -m http.server 8080
```
Depois, acesse `http://localhost:8080` ou pelo IP da sua máquina no celular.

## Como usar
- **Criar lista**: toque em **+ Nova lista**.
- **Editar**: toque em **Editar** dentro da lista. Adicione cartões com Hanzi, Pinyin, Significado, Alternativas (se quiser aceitar variações) e uma ou mais frases (uma por linha).
- **Estudar**: toque na lista ou no botão **Estudar ▶**. Digite o ideograma no campo — use seu teclado com IME de chinês para produzir o Hanzi. 
  - **Acertou**: aparece um check e avança.
  - **Errou**: o app exibe pinyin e significado como dica. Você pode tocar em **Mostrar dica** a qualquer momento.
- **Exportar**: botão de setinha no topo (**📤**) gera um arquivo `hanzi-cards-export.json`.
- **Importar**: botão **Importar** → selecione um `.json` exportado anteriormente.

## Estrutura de dados (JSON)
```json
{
  "lists": [
    {
      "id": "...",
      "name": "HSK 1 — básicos",
      "cards": [
        {
          "id": "...",
          "hanzi": "你",
          "pinyin": "nǐ",
          "meaning": "você",
          "alt": ["妳"],
          "examples": ["你好！", "我认识你。"]
        }
      ]
    }
  ]
}
```

## Notas e dicas
- **Comparação de resposta**: o app aceita exatamente o Hanzi do cartão ou qualquer alternativa listada (útil para formas tradicionais, variantes, etc.).
- **Acentos do pinyin**: você não precisa digitá-los; são mostrados apenas como dica.
- **Backup**: use Exportar para fazer backup das suas listas regularmente.
- **Privacidade**: todos os dados ficam apenas no seu navegador (localStorage).

## Personalização rápida
- Cores e espaçamentos: edite `styles.css` (variáveis em `:root`).
- Lógica de estudo/validação: edite `app.js` (função `checkAnswer` e `showCurrent`).

Bom estudo! 加油！
