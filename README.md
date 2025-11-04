# ClimaAgora: Aplicativo de Previsão do Tempo

Um aplicativo web simples e elegante para consultar o clima atual, previsões futuras e outros dados meteorológicos de qualquer cidade do mundo.

---

### 🔗 Demo Ao Vivo

**[>> Clique aqui para ver o projeto em ação <<](URL_DA_SUA_DEMO_AQUI)**

*(Instrução: Depois de hospedar o projeto no GitHub Pages, Netlify ou Vercel, substitua o link acima.)*

---

### 📸 Screenshots

| Versão Desktop | Versão Mobile |
| :---: | :---: |
| ![Screenshot da versão desktop do ClimaAgora](URL_DO_SEU_SCREENSHOT_DESKTOP_AQUI) | ![Screenshot da versão mobile do ClimaAgora](URL_DO_SEU_SCREENSHOT_MOBILE_AQUI) |

*(Instrução: Tire os screenshots, adicione-os a uma pasta no seu projeto (ex: `/assets`) e substitua as URLs acima.)*

---

### ✨ Funcionalidades Principais

*   **Clima Atual:** Exibe temperatura, sensação térmica, umidade, velocidade do vento e descrição do clima.
*   **Busca Inteligente:** Busca por qualquer cidade do mundo com sugestões de autocompletar.
*   **Geolocalização:** Botão para obter o clima da localização atual do usuário.
*   **Previsão para 5 Dias:** Resumo diário com temperaturas máxima/mínima e condições do tempo.
*   **Previsão Hora a Hora:** Detalhes das próximas 24 horas.
*   **Detalhes Adicionais:** Informações como nascer/pôr do sol, visibilidade, pressão, qualidade do ar e rajadas de vento.
*   **Mapa Interativo:** Mapa do Leaflet com camadas de precipitação, nuvens, temperatura e mais.
*   **Interface Responsiva:** Design que se adapta perfeitamente a desktops, tablets e celulares.

---

### 🛠️ Tecnologias Utilizadas

*   **HTML5**
*   **CSS3** (com Variáveis, Flexbox e Grid)
*   **JavaScript (ES6+)** (com `async/await` e `fetch`)
*   **APIs:**
    *   [OpenWeatherMap API](https://openweathermap.org/api) para todos os dados meteorológicos.
    *   [Leaflet.js](https://leafletjs.com/) para o mapa interativo.

---

### 🚀 Como Executar Localmente

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
    ```
2.  **Navegue até a pasta do projeto:**
    ```bash
    cd NOME_DA_PASTA
    ```
3.  **Adicione a Chave da API:**
    *   Abra o arquivo `script.js`.
    *   Encontre a constante `API_KEY`.
    *   Substitua o placeholder `'COLOQUE_SUA_CHAVE_API_AQUI'` pela sua chave de API da [OpenWeatherMap](https://openweathermap.org/api).
    ```javascript
    const API_KEY = 'SUA_CHAVE_VEM_AQUI';
    ```
4.  **Abra o `index.html`:**
    *   Abra o arquivo `index.html` no seu navegador de preferência.

---

### 🌟 Melhorias Futuras

*   [ ] Criar um endpoint de back-end em Node.js ou outra tecnologia para proteger a chave da API.
*   [ ] Adicionar testes unitários para as funções de manipulação de dados.
*   [ ] Implementar um sistema de unidades (Celsius/Fahrenheit).

---

### 🙏 Créditos

*   Os ícones de clima utilizados neste projeto foram criados pela [amCharts](https://www.amcharts.com/) e estão licenciados sob a [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).
