# GymLog PWA (Personal Training Log) 🏋️‍♂️

Progressive Web App (PWA) pessoal, ultrarrápida e 100% otimizada para utilização em smartphone durante os treinos no ginásio.

Inspirada nas melhores funcionalidades de apps como *Hevy* e *Strong*, com foco em **Zero Fricção**, **Offline-First** e **Gráficos Acionáveis de Volume Semanal por Grupo Muscular**.

---

## ⚡ Funcionalidades Principais

- **Zero Fricção & Touch-First:**
  - Botões táteis com altura mínima de 44px (fáceis de premir com mãos cansadas).
  - Teclado numérico móvel automático (`inputmode="decimal"`).
  - Sem necessidade de login diário.
- **Auto-Preenchimento Inteligente (Ghost Values):**
  - Preenchimento em marca de água (placeholder esbatido) dos pesos e repetições alcançados na última sessão para cada exercício.
  - Validação de série rápida com um toque no checkmark `✓`.
- **Biblioteca de Exercícios 100% Personalizada:**
  - Gestão de exercícios por grupo muscular (Peito, Costas, Pernas, Ombros, etc.) e equipamento.
- **Templates de Rotinas Dinâmicos:**
  - Criação de treinos como *Push*, *Pull*, *Legs*, *Upper*, *Lower* com contagem de séries alvo.
  - Treino livre instantâneo com botão "+".
- **Métricas & Gráficos de Hipertrofia (Recharts):**
  - Visualização de **Séries Efetivas por Músculo** (com indicador de meta 10-20 séries semanais).
  - Visualização de **Tonelagem / Volume Total de Carga (kg levantados)**: $\sum (\text{peso} \times \text{reps})$.
  - Filtros por: *Esta Semana*, *4 Semanas*, *3 Meses*.
- **Offline-First Ininterrupto:**
  - Armazenamento local imediato no IndexedDB via **Dexie.js** (latência 0ms).
  - Cache de assets e Service Worker com **Workbox**.
  - Sincronização em segundo plano com **Supabase (PostgreSQL)** quando há ligação.

---

## 🚀 Como Executar Localmente

### 1. Iniciar o Servidor de Desenvolvimento
```bash
cd gym-log-pwa
npm run dev
```

Abre o URL apresentado (normalmente `http://localhost:5173`) no navegador ou acede via rede local no telemóvel (ex.: `http://192.168.x.x:5173`).

### 2. Compilar para Produção (PWA)
```bash
npm run build
npm run preview
```

---

## 📲 Como Instalar como App no Smartphone

- **No iPhone (Safari):**
  1. Abre a URL no Safari.
  2. Toca no botão de **Partilhar** (quadrado com seta para cima).
  3. Seleciona **"Adicionar ao Ecrã Principal"** (Add to Home Screen).
- **No Android (Chrome):**
  1. Abre a URL no Chrome.
  2. Toca no menu (três pontos) ou no aviso que surge na barra inferior.
  3. Seleciona **"Instalar aplicação"** / **"Adicionar ao ecrã principal"**.

A app abrirá em modo `standalone` ecrã inteiro (sem barras de navegação do browser).

---

## ☁️ Configuração da Nuvem (Supabase & Vercel)

### 1. Supabase (PostgreSQL)
1. Cria um projeto gratuito em [supabase.com](https://supabase.com).
2. Acede ao **SQL Editor** do Supabase e executa o ficheiro [`supabase/schema.sql`](supabase/schema.sql).
3. Cria um ficheiro `.env` na raiz do projeto com base no `.env.example`:
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh......
```

### 2. Vercel (Deploy Gratuito)
1. Conecta o teu repositório GitHub ao Vercel.
2. Adiciona as variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
3. O ficheiro `vercel.json` incluído assegura os redirecionamentos para SPA.
