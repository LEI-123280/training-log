# GymLog PWA (Personal Training Log)

Progressive Web App (PWA) pessoal, ultrarrápida e 100% otimizada para utilização em smartphone durante os treinos no ginásio.

Inspirada nas melhores funcionalidades de apps como *Hevy* e *Strong*, com foco em **Zero Fricção**, **Offline-First** e **Gráficos Acionáveis de Volume Semanal por Grupo Muscular**.

---

##  Funcionalidades Principais

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
