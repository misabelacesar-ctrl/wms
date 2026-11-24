# Gestão WMS — Protótipo Simplificado de Controle de Armazém

Protótipo web funcional de um **WMS (Warehouse Management System)** simplificado para gestão visual de posições porta-paletes, recebimento (*putaway*), saída (*picking*), painel de indicadores de ocupação e consulta por SKU ou nome do produto, com persistência local via `localStorage`.

---

## Stack Tecnológica e Justificativa

- **React 19 + TypeScript + Vite:** oferece build rápido, tipagem estática nas regras logísticas, excelente suporte nativo na **Vercel** (detecção automática de projeto Vite) e separação clara entre regras de negócio puras e interface.
- **Tailwind CSS v4:** estilização utilitária responsiva para uso em desktop e tablet, sem necessidade de arquivos CSS complexos.
- **Persistência em `localStorage`:** permite uso completo ponta a ponta sem dependência de banco de dados externo, mantendo os dados salvos ao recarregar a página.

---

## Estrutura Física do Armazém

As 150 posições são geradas dinamicamente por regra em `src/domain/warehouseConfig.ts` e `src/domain/warehouseEngine.ts`:

- **Ruas:** 6 ruas (`Rua A` a `Rua F`, códigos `RUA-A` a `RUA-F`)
- **Módulos por rua:** 5 módulos (`MOD-01` a `MOD-05`, totalizando 30 módulos)
- **Níveis por módulo:** 5 níveis (`NIVEL-1` = piso até `NIVEL-5` = topo)
- **Capacidade total:** `6 × 5 × 5 = 150` posições
- **Formato de endereço completo:** `RUA-A / MOD-02 / NIVEL-3`

---

## Arquitetura do Projeto

```text
├── index.html                           # Ponto de entrada HTML e fontes
├── package.json                         # Scripts e dependências
├── vite.config.ts                       # Configuração do Vite
└── src/
    ├── main.tsx                         # Inicialização do React
    ├── index.css                        # Tema Tailwind CSS e padrão visual
    ├── App.tsx                          # Orquestração da tela e estado principal
    ├── types/
    │   └── wms.ts                       # Tipos e interfaces do domínio WMS
    ├── domain/
    │   ├── warehouseConfig.ts           # Constantes físicas e formatadores de endereço
    │   └── warehouseEngine.ts           # Regras de negócio puras (geração, putaway, picking, busca, métricas)
    ├── storage/
    │   └── wmsStorage.ts                # Leitura, gravação e reset no localStorage
    └── components/
        ├── TopBar.tsx                   # Cabeçalho principal
        ├── MetricsStrip.tsx             # Painel de indicadores (taxa de ocupação, livres, ocupadas, indisponíveis)
        ├── WarehouseMap.tsx             # Mapa visual em grade com as 150 posições por rua
        ├── PositionInspector.tsx        # Detalhes da posição selecionada e bloqueio/desbloqueio
        ├── PutawayForm.tsx              # Formulário de entrada de mercadorias
        ├── InventorySearch.tsx          # Busca por SKU ou nome do produto
        └── PickingConfirmModal.tsx      # Confirmação de saída (picking) com dados do item
```

---

## Como Rodar Localmente

### Pré-requisitos

- **Node.js** 18 ou superior
- **npm** (instalado com o Node.js)

### Passos

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Acesse no navegador:
   ```text
   http://localhost:3000
   ```

4. Para gerar a build de produção e validar o empacotamento:
   ```bash
   npm run build
   npm run preview
   ```

---

## Como Versionar e Enviar para o GitHub

1. Crie um novo repositório vazio no GitHub (sem inicializar com `README` ou `.gitignore`, pois o projeto já possui esses arquivos).
2. Na pasta raiz do projeto, inicialize o Git e faça o primeiro commit:
   ```bash
   git init
   git add .
   git commit -m "feat: implementa protótipo funcional de WMS simplificado"
   ```
3. Conecte o repositório remoto e envie o código para a branch `main`:
   ```bash
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
   git push -u origin main
   ```

---

## Como Importar e Publicar na Vercel

1. Acesse [vercel.com](https://vercel.com) e entre com sua conta do **GitHub**.
2. Clique em **Add New... > Project**.
3. Selecione o repositório recém-enviado no GitHub e clique em **Import**.
4. Confirme as configurações detectadas automaticamente pela Vercel:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Clique em **Deploy**. Ao finalizar, a Vercel disponibilizará a URL pública da aplicação em produção.

---

## Testes Manuais de Validação do MVP

Execute a sequência abaixo no navegador para comprovar todos os requisitos:

1. **Contagem exata de 150 posições e formato de endereço:**
   - Abra a aplicação com o armazém zerado.
   - No painel de indicadores, verifique **Posições livres: 150** e **Capacidade total: 150 posições**.
   - No mapa visual, confira que há **6 ruas** (`Rua A` a `Rua F`), cada uma com **5 módulos** (`M01` a `M05`) e **5 níveis** (`N5` a `N1`).
   - Clique na célula da Rua A, módulo 2, nível 3 e confirme na aba **Posição** o endereço exato: `RUA-A / MOD-02 / NIVEL-3`.

2. **Entrada de mercadorias (Putaway) e bloqueio de posição ocupada/indisponível:**
   - Na aba **Entrada**, tente enviar o formulário com campos vazios ou quantidade `0`: o sistema deve exibir erro de validação em português.
   - Preencha **Código/SKU:** `SKU-100`, **Produto:** `Caixa Parafuso M8`, **Quantidade:** `12` e selecione `RUA-A / MOD-02 / NIVEL-3`. Confirme a entrada.
   - Verifique que a célula ficou azul (Ocupado) no mapa com o código `SKU-100`.
   - Ainda na aba **Entrada**, abra o seletor de endereço de destino e confirme que `RUA-A / MOD-02 / NIVEL-3` aparece bloqueada como **Ocupado (SKU-100)**. Clique sobre essa célula no mapa e confirme que o sistema exibe o aviso de bloqueio impedindo nova entrada no mesmo endereço.
   - Na aba **Posição**, selecione uma posição livre (ex.: `RUA-B / MOD-01 / NIVEL-1`), clique em **Marcar como Indisponível** e confirme que ela fica hachurada em âmbar no mapa e bloqueada no formulário de entrada. Em seguida, teste clicar em **Desfazer Indisponibilidade (Tornar Livre)**.

3. **Cálculo correto da taxa de ocupação:**
   - Com `1` posição ocupada e `0` indisponíveis: verifique que a taxa é `1 / 150 = 0,7%`, com `149` livres e `1` ocupada.
   - Marque `1` posição livre como **Indisponível**: as posições utilizáveis passam para `149` (`150 - 1`), e a taxa de ocupação atualiza automaticamente para `1 / 149 = 0,7%` (ou faça mais entradas, ex.: `3` ocupadas e `50` indisponíveis -> `3 / 100 = 3,0%`), comprovando o cálculo `ocupadas / utilizáveis`.

4. **Consulta e busca por SKU ou nome:**
   - Acesse a aba **Busca** e pesquise por `SKU-100` ou `Parafuso`.
   - Confirme que o resultado retorna **Rua A**, **Módulo MOD-02**, **Nível 3** e o endereço completo `RUA-A / MOD-02 / NIVEL-3`.
   - Recarregue a página (`F5`) e confirme que os dados e o status no mapa permanecem salvos via `localStorage`.

5. **Baixa de mercadoria (Picking) liberando a posição:**
   - Clique na posição ocupada no mapa (ou no botão **Picking** do resultado da busca).
   - Confirme que o modal exibe **Endereço**, **Código/SKU**, **Produto** e **Quantidade** antes da confirmação.
   - Clique em **Confirmar Baixa**.
   - Verifique que a posição volta ao status **Livre** no mapa, o indicador de posições ocupadas retorna a `0` e a taxa de ocupação volta para `0,0%`.
