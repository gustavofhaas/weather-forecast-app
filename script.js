/**
 * @file
 * @description
// 

const MAP_API_KEY = '50ec81c6728b6685e62e18f3cc53e61b';

/** Mapeamento de códigos de ícone da OpenWeatherMap para os arquivos de ícone locais. */
const ICON_MAP = {
    "01d": "amcharts_weather_icons_1.0.0/animated/day.svg",
    "01n": "amcharts_weather_icons_1.0.0/animated/night.svg",
    "02d": "amcharts_weather_icons_1.0.0/animated/cloudy-day-1.svg",
    "02n": "amcharts_weather_icons_1.0.0/animated/cloudy-night-1.svg",
    "03d": "amcharts_weather_icons_1.0.0/animated/cloudy-day-2.svg",
    "03n": "amcharts_weather_icons_1.0.0/animated/cloudy-night-2.svg",
    "04d": "amcharts_weather_icons_1.0.0/animated/cloudy.svg",
    "04n": "amcharts_weather_icons_1.0.0/animated/cloudy.svg",
    "09d": "amcharts_weather_icons_1.0.0/animated/rainy-5.svg",
    "09n": "amcharts_weather_icons_1.0.0/animated/rainy-5.svg",
    "10d": "amcharts_weather_icons_1.0.0/animated/rainy-1.svg",
    "10n": "amcharts_weather_icons_1.0.0/animated/rainy-4.svg",
    "10d-heavy": "amcharts_weather_icons_1.0.0/animated/rainy-6.svg",
    "10n-heavy": "amcharts_weather_icons_1.0.0/animated/rainy-7.svg",
    "11d": "amcharts_weather_icons_1.0.0/animated/thunder.svg",
    "11n": "amcharts_weather_icons_1.0.0/animated/thunder.svg",
    "13d": "amcharts_weather_icons_1.0.0/animated/snowy-1.svg",
    "13n": "amcharts_weather_icons_1.0.0/animated/snowy-4.svg",
    "13d-heavy": "amcharts_weather_icons_1.0.0/animated/snowy-6.svg",
    "13n-heavy": "amcharts_weather_icons_1.0.0/animated/snowy-6.svg",
    "50d": "amcharts_weather_icons_1.0.0/animated/cloudy.svg",
    "50n": "amcharts_weather_icons_1.0.0/animated/cloudy.svg",
};

/** Objeto contendo referências para os elementos do DOM usados com frequência. */
const DOMElements = {
    botaoBuscar: document.getElementById('buscar'),
    inputCidade: document.getElementById('cidade'),
    botaoLocalizacao: document.getElementById('usar-localizacao'),
    unitSwitch: document.getElementById('unit-switch'),
    nomeCidade: document.getElementById('nome-cidade'),
    iconeClima: document.getElementById('icone-clima'),
    descricao: document.getElementById('descricao'),
    temperatura: document.getElementById('temperatura'),
    sensacao: document.getElementById('sensacao'),
    umidade: document.getElementById('umidade'),
    vento: document.getElementById('vento'),
    resultadoDiv: document.getElementById('resultado'),
    sugestoesLista: document.getElementById('sugestoes'),
    previsao5DiasDiv: document.getElementById('previsao-5-dias'),
    loaderContainer: document.querySelector('.loader-container'),
    nascerDoSol: document.getElementById('nascer-do-sol'),
    porDoSol: document.getElementById('por-do-sol'),
    visibilidade: document.getElementById('visibilidade'),
    pressao: document.getElementById('pressao'),
    previsaoHoraAHoraContainer: document.querySelector('.previsao-hora-a-hora-container'),
    qualidadeAr: document.getElementById('qualidade-ar'),
    alertasClima: document.getElementById('alertas-clima'),
    rajadaVento: document.getElementById('rajada-vento'),
    errorContainer: document.getElementById('error-container'),
};

// Variáveis de estado
let map;
let isMapInitialized = false;
let currentMapLayer;
const mapLayers = {};
let currentUnit = 'metric'; // 'metric' para Celsius, 'imperial' para Fahrenheit

// =================================================================================================
// --- FUNÇÕES DE UI (INTERFACE DO USUÁRIO) ---
// =================================================================================================

/** Mostra o spinner de carregamento. */
function showLoader() {
    DOMElements.loaderContainer.style.display = 'flex';
}

/** Esconde o spinner de carregamento. */
function hideLoader() {
    DOMElements.loaderContainer.style.display = 'none';
}

/**
 * Exibe uma mensagem de erro na interface.
 * @param {string} message - A mensagem de erro a ser exibida.
 */
function showError(message) {
    DOMElements.errorContainer.textContent = message;
    DOMElements.errorContainer.style.display = 'block';
}

/** Esconde a mensagem de erro. */
function hideError() {
    DOMElements.errorContainer.style.display = 'none';
}

/**
 * Formata um timestamp Unix para uma string de hora local.
 * @param {number} timestamp - O timestamp Unix em segundos.
 * @returns {string} A hora formatada (HH:mm).
 */
function formatarHora(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Retorna a descrição da qualidade do ar baseada no índice AQI.
 * @param {number} aqi - O índice de qualidade do ar (1-5).
 * @returns {string} A descrição textual.
 */
function getDescricaoQualidadeAr(aqi) {
    switch (aqi) {
        case 1: return 'Bom';
        case 2: return 'Razoável';
        case 3: return 'Moderado';
        case 4: return 'Ruim';
        case 5: return 'Muito Ruim';
        default: return 'Desconhecido';
    }
}

/**
 * Define o plano de fundo e a animação do ícone com base na condição climática.
 * @param {string} weatherMain - A condição climática principal (ex: 'Clear', 'Clouds').
 */
function definirEfeitosDeClima(weatherMain) {
    document.body.className = '';
    DOMElements.iconeClima.className = '';

    const clima = weatherMain.toLowerCase();
    switch(clima) {
        case 'clear':
            document.body.style.background = 'linear-gradient(to top, #2F80ED, #1A63D3)';
            DOMElements.iconeClima.classList.add('pulse');
            break;
        case 'clouds':
            document.body.style.background = 'linear-gradient(to top, #bdc3c7, #2c3e50)';
            DOMElements.iconeClima.classList.add('float');
            break;
        case 'rain':
        case 'drizzle':
            document.body.style.background = 'linear-gradient(to top, #4e54c8, #8f94fb)';
            DOMElements.iconeClima.classList.add('pulse');
            document.body.classList.add('rain');
            break;
        case 'thunderstorm':
            document.body.style.background = 'linear-gradient(to top, #373B44, #4286f4)';
            DOMElements.iconeClima.classList.add('shake');
            break;
        case 'snow':
            document.body.style.background = 'linear-gradient(to top, #6A82FB, #FC5C7D)';
            DOMElements.iconeClima.classList.add('pulse');
            document.body.classList.add('snow');
            break;
        case 'mist':
        case 'fog':
            document.body.style.background = 'linear-gradient(to top, #606C88, #3F4C6B)';
            DOMElements.iconeClima.classList.add('pulse');
            break;
        default:
            document.body.style.background = 'linear-gradient(to top, #4facfe, #00f2fe)';
            DOMElements.iconeClima.classList.add('pulse');
    }
}

// =================================================================================================
// --- FUNÇÕES DE ATUALIZAÇÃO DO DOM ---
// =================================================================================================

/**
 * Atualiza a seção principal do clima com os dados atuais.
 * @param {object} dados - O objeto de dados da API de clima atual.
 */
function atualizarDOMPrincipal(dados) {
    const { weather, main, sys, name, visibility, wind } = dados;
    const weatherId = weather[0].id;
    let iconCode = weather[0].icon;

    const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
    const windUnit = currentUnit === 'metric' ? 'km/h' : 'mph';
    const windSpeed = currentUnit === 'metric' ? (wind.speed * 3.6).toFixed(1) : wind.speed.toFixed(1);

    // Ajusta o código do ícone para condições de chuva/neve intensa
    if (weatherId >= 502 && weatherId <= 504) { // Chuva intensa
        iconCode = iconCode.includes('d') ? "10d-heavy" : "10n-heavy";
    } else if (weatherId === 602) { // Neve intensa
        iconCode = iconCode.includes('d') ? "13d-heavy" : "13n-heavy";
    }

    DOMElements.nomeCidade.textContent = `${name}, ${sys.country}`;
    DOMElements.descricao.textContent = weather[0].description;
    DOMElements.temperatura.textContent = `${main.temp.toFixed(1)}${tempUnit}`;
    DOMElements.iconeClima.src = ICON_MAP[iconCode] || 'amcharts_weather_icons_1.0.0/animated/weather.svg';
    DOMElements.iconeClima.alt = weather[0].description;
    DOMElements.sensacao.textContent = `Sensação térmica: ${main.feels_like.toFixed(1)}${tempUnit}`;
    DOMElements.umidade.textContent = `Umidade: ${main.humidity}%`;
    DOMElements.vento.textContent = `Vento: ${windSpeed} ${windUnit}`;

    // Detalhes adicionais
    DOMElements.nascerDoSol.textContent = formatarHora(sys.sunrise);
    DOMElements.porDoSol.textContent = formatarHora(sys.sunset);
    
    const visValue = currentUnit === 'metric' 
        ? `${(visibility / 1000).toFixed(1)} km`
        : `${(visibility * 0.000621371).toFixed(1)} mi`;
    DOMElements.visibilidade.textContent = visValue;

    DOMElements.pressao.textContent = `${main.pressure} hPa`;
    const gustSpeed = wind.gust ? (currentUnit === 'metric' ? (wind.gust * 3.6).toFixed(1) : wind.gust.toFixed(1)) : '--';
    DOMElements.rajadaVento.textContent = `${gustSpeed} ${windUnit}`;

    definirEfeitosDeClima(weather[0].main);

    // Mostra a seção de resultados com uma animação
    DOMElements.resultadoDiv.classList.remove('show');
    setTimeout(() => DOMElements.resultadoDiv.classList.add('show'), 50);
}

/**
 * Atualiza a seção de previsão de 5 dias.
 * @param {object} dados - O objeto de dados da API de previsão.
 */
function atualizarDOM5Dias(dados) {
    DOMElements.previsao5DiasDiv.innerHTML = '<h3>Próximos 5 dias</h3>';
    const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
    const windUnit = currentUnit === 'metric' ? 'km/h' : 'mph';

    const previsoesPorDia = {};
    dados.list.forEach(item => {
        const localDate = new Date(item.dt * 1000);
        const ano = localDate.getFullYear();
        const mes = String(localDate.getMonth() + 1).padStart(2, '0');
        const dia = String(localDate.getDate()).padStart(2, '0');
        const dataString = `${ano}-${mes}-${dia}`;

        if (!previsoesPorDia[dataString]) {
            previsoesPorDia[dataString] = [];
        }
        previsoesPorDia[dataString].push(item);
    });

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const hojeLocal = `${ano}-${mes}-${dia}`;

    const datasOrdenadas = Object.keys(previsoesPorDia).sort();
    let count = 0;

    for (const data of datasOrdenadas) {
        if (data === hojeLocal) continue; // Pula o dia de hoje
        if (count >= 5) break;

        const diaPrevisoes = previsoesPorDia[data];
        const diaSemana = new Date(diaPrevisoes[0].dt * 1000).toLocaleDateString('pt-BR', { weekday: 'long' });
        
        let temp_min = diaPrevisoes[0].main.temp_min;
        let temp_max = diaPrevisoes[0].main.temp_max;
        let umidade_media = 0, vento_medio = 0, pop_max = 0, chuva_total_mm = 0;

        diaPrevisoes.forEach(item => {
            if (item.main.temp_min < temp_min) temp_min = item.main.temp_min;
            if (item.main.temp_max > temp_max) temp_max = item.main.temp_max;
            umidade_media += item.main.humidity;
            vento_medio += item.wind.speed;
            if (item.pop > pop_max) pop_max = item.pop;
            chuva_total_mm += (item.rain?.['3h'] || 0) + (item.snow?.['3h'] || 0);
        });

        umidade_media /= diaPrevisoes.length;
        const ventoFormatado = currentUnit === 'metric' ? (vento_medio / diaPrevisoes.length) * 3.6 : (vento_medio / diaPrevisoes.length);

        const previsaoMeioDia = diaPrevisoes.find(p => p.dt_txt.includes('12:00:00')) || diaPrevisoes[0];
        const { icon, description } = previsaoMeioDia.weather[0];

        const diaDiv = document.createElement('div');
        diaDiv.classList.add('dia-previsao');
        diaDiv.innerHTML = `
            <div class="dia-previsao-info">
                <img src="${ICON_MAP[icon] || 'amcharts_weather_icons_1.0.0/animated/weather.svg'}" alt="${description}">
                <div>
                    <p>${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}</p>
                    <p style="font-size: 0.8em; opacity: 0.8; text-transform: capitalize;">${description}</p>
                </div>
            </div>
            <div class="dia-previsao-detalhes">
                <p>💧 ${(pop_max * 100).toFixed(0)}%</p>
                <p>🌧️ ${chuva_total_mm.toFixed(1)} mm</p>
                <p>💨 ${ventoFormatado.toFixed(1)} ${windUnit}</p>
                <p>💦 ${umidade_media.toFixed(0)}%</p>
            </div>
            <div class="dia-previsao-temp">
                <span>${temp_max.toFixed(0)}${tempUnit}</span>
                <span class="min">${temp_min.toFixed(0)}${tempUnit}</span>
            </div>
        `;
        DOMElements.previsao5DiasDiv.appendChild(diaDiv);
        count++;
    }
}

/**
 * Atualiza a seção de previsão hora a hora.
 * @param {object} dados - O objeto de dados da API de previsão.
 */
function atualizarDOMHoraAHora(dados) {
    DOMElements.previsaoHoraAHoraContainer.innerHTML = '';
    const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
    const windUnit = currentUnit === 'metric' ? 'km/h' : 'mph';
    const proximas24Horas = dados.list.slice(0, 8);

    proximas24Horas.forEach(item => {
        const chuva_mm = (item.rain?.['3h'] || 0) + (item.snow?.['3h'] || 0);
        const windSpeed = currentUnit === 'metric' ? (item.wind.speed * 3.6).toFixed(1) : item.wind.speed.toFixed(1);

        const horaDiv = document.createElement('div');
        horaDiv.classList.add('hora-previsao');
        horaDiv.innerHTML = `
            <p class="hora-previsao-hora">${formatarHora(item.dt)}</p>
            <img src="${ICON_MAP[item.weather[0].icon] || 'amcharts_weather_icons_1.0.0/animated/weather.svg'}" alt="${item.weather[0].description}">
            <p class="hora-previsao-temp">${item.main.temp.toFixed(0)}${tempUnit}</p>
            <p class="hora-previsao-pop">💧 ${(item.pop * 100).toFixed(0)}%</p>
            <p class="hora-previsao-chuva">🌧️ ${chuva_mm.toFixed(1)} mm</p>
            <p class="hora-previsao-vento">💨 ${windSpeed} ${windUnit}</p>
            <p class="hora-previsao-umidade">💦 ${item.main.humidity}%</p>
        `;
        DOMElements.previsaoHoraAHoraContainer.appendChild(horaDiv);
    });
}

/**
 * Atualiza a seção de qualidade do ar.
 * @param {object} dados - O objeto de dados da API de qualidade do ar.
 */
function atualizarDOMQualidadeAr(dados) {
    if (dados.list && dados.list.length > 0) {
        const aqi = dados.list[0].main.aqi;
        DOMElements.qualidadeAr.textContent = getDescricaoQualidadeAr(aqi);
    }
}

/**
 * Atualiza a seção de alertas climáticos.
 * @param {object} dados - O objeto de dados da API One Call.
 */
function atualizarDOMAlertas(dados) {
    DOMElements.alertasClima.innerHTML = '';
    if (dados.alerts && dados.alerts.length > 0) {
        const alerta = dados.alerts[0];
        const alertaDiv = document.createElement('div');
        alertaDiv.classList.add('alerta-clima');
        alertaDiv.innerHTML = `
            <h4>⚠️ Alerta: ${alerta.event}</h4>
            <p>${alerta.description}</p>
        `;
        DOMElements.alertasClima.appendChild(alertaDiv);
    }
}

/**
 * Atualiza a lista de sugestões de cidades.
 * @param {Array<object>} dados - Uma lista de cidades da API de geocodificação.
 */
function atualizarDOMSugestoes(dados) {
    DOMElements.sugestoesLista.innerHTML = '';
    if (dados.length > 0) {
        const sugestoesUnicas = [];
        const nomesVistos = new Set();

        dados.forEach(cidade => {
            const nomeUnico = `${cidade.name}, ${cidade.state || ''}, ${cidade.country}`;
            if (!nomesVistos.has(nomeUnico)) {
                sugestoesUnicas.push(cidade);
                nomesVistos.add(nomeUnico);
            }
        });

        sugestoesUnicas.forEach(cidade => {
            const li = document.createElement('li');
            li.textContent = `${cidade.name}, ${cidade.country}`;
            li.addEventListener('click', () => {
                DOMElements.inputCidade.value = cidade.name;
                DOMElements.sugestoesLista.style.display = 'none';
                buscarDadosClimaticos(cidade.name);
            });
            DOMElements.sugestoesLista.appendChild(li);
        });
        DOMElements.sugestoesLista.style.display = 'block';
    } else {
        DOMElements.sugestoesLista.style.display = 'none';
    }
}

// =================================================================================================
// --- FUNÇÕES DO MAPA ---
// =================================================================================================

/**
 * Inicializa o mapa do clima ou atualiza sua visualização.
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 */
function inicializarMapa(lat, lon) {
    if (isMapInitialized) {
        map.setView([lat, lon], 13);
        return;
    }

    map = L.map('mapa-clima').setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const layers = ['precipitation_new', 'clouds_new', 'temp_new', 'wind_new', 'pressure_new'];
    layers.forEach(layer => {
        mapLayers[layer] = L.tileLayer(`https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${MAP_API_KEY}`, {
            maxZoom: 19,
            attribution: 'Weather data &copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>',
            opacity: 0.7
        });
    });

    currentMapLayer = mapLayers.precipitation_new;
    currentMapLayer.addTo(map);
    isMapInitialized = true;

    document.querySelectorAll('.mapa-controle-botao').forEach(botao => {
        botao.addEventListener('click', (e) => {
            const layerName = e.target.dataset.layer;
            if (currentMapLayer) {
                map.removeLayer(currentMapLayer);
            }
            currentMapLayer = mapLayers[layerName];
            currentMapLayer.addTo(map);

            document.querySelectorAll('.mapa-controle-botao').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
}

// =================================================================================================
// --- FUNÇÕES DE API ---
// =================================================================================================

/**
 * Função genérica para buscar dados da API OpenWeatherMap através do nosso proxy backend.
 * @param {string} openWeatherUrl - A URL da API OpenWeatherMap (sem a chave).
 * @returns {Promise<object>} Os dados em formato JSON.
 * @throws {Error} Lança um erro se a resposta da rede não for bem-sucedida.
 */
async function fetchData(openWeatherUrl) {
    const proxyUrl = `http://localhost:3000/api/weather?url=${encodeURIComponent(openWeatherUrl)}`;
    const resposta = await fetch(proxyUrl);

    if (!resposta.ok) {
        const errorData = await resposta.json().catch(() => ({ message: 'Erro desconhecido no servidor.' }));
        throw new Error(errorData.message || 'Não foi possível obter os dados. Verifique o console do servidor backend.');
    }
    return resposta.json();
}

/**
 * Busca todos os dados climáticos (atuais, previsões, etc.) para uma cidade ou coordenadas.
 * @param {string|null} cidade - O nome da cidade. Se nulo, usa as coordenadas.
 * @param {number|null} lat - Latitude.
 * @param {number|null} lon - Longitude.
 */
async function buscarDadosClimaticos(cidade = null, lat = null, lon = null) {
    showLoader();
    hideError();

    try {
        let weatherUrl;
        if (cidade) {
            weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&units=${currentUnit}&lang=pt`;
        } else {
            weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&lang=pt`;
        }

        const dadosAtuais = await fetchData(weatherUrl);
        atualizarDOMPrincipal(dadosAtuais);
        localStorage.setItem('ultimaCidade', dadosAtuais.name);

        const { lat: newLat, lon: newLon } = dadosAtuais.coord;
        inicializarMapa(newLat, newLon);

        const promises = [
            (async () => {
                const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${newLat}&lon=${newLon}&units=${currentUnit}&lang=pt`;
                const dadosPrevisao = await fetchData(forecastUrl);
                atualizarDOM5Dias(dadosPrevisao);
                atualizarDOMHoraAHora(dadosPrevisao);
            })(),
            (async () => {
                const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${newLat}&lon=${newLon}`;
                const dadosAr = await fetchData(airUrl);
                atualizarDOMQualidadeAr(dadosAr);
            })(),
            (async () => {
                const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${newLat}&lon=${newLon}&exclude=current,minutely,hourly,daily`;
                const dadosAlertas = await fetchData(oneCallUrl);
                atualizarDOMAlertas(dadosAlertas);
            })(),
        ];

        const safePromises = promises.map(p => p.catch(error => {
            console.error('Erro ao buscar dado secundário (ex: alertas):', error);
            return null;
        }));

        await Promise.all(safePromises);

    } catch (erro) {
        showError(erro.message);
    } finally {
        hideLoader();
    }
}

/**
 * Busca sugestões de cidades enquanto o usuário digita.
 * @param {string} query - O texto digitado pelo usuário.
 */
async function buscarSugestoes(query) {
    if (query.length < 2) {
        DOMElements.sugestoesLista.style.display = 'none';
        return;
    }

    try {
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5`;
        const dados = await fetchData(url);
        atualizarDOMSugestoes(dados);
    } catch (erro) {
        console.error('Erro ao buscar sugestões:', erro);
    }
}

// =================================================================================================
// --- EVENT LISTENERS (OUVINTES DE EVENTOS) ---
// =================================================================================================

/** Inicializa a aplicação quando o DOM está totalmente carregado. */
document.addEventListener('DOMContentLoaded', () => {
    const savedUnit = localStorage.getItem('unit');
    if (savedUnit) {
        currentUnit = savedUnit;
        DOMElements.unitSwitch.checked = savedUnit === 'imperial';
    }

    const ultimaCidade = localStorage.getItem('ultimaCidade');
    if (ultimaCidade) {
        buscarDadosClimaticos(ultimaCidade);
    } else {
        buscarDadosClimaticos('São Paulo'); 
    }
});

/** Event listener para o botão de busca. */
DOMElements.botaoBuscar.addEventListener('click', () => {
    const cidade = DOMElements.inputCidade.value.trim();
    if (cidade) {
        buscarDadosClimaticos(cidade);
        DOMElements.sugestoesLista.style.display = 'none';
    } else {
        showError('Por favor, digite o nome de uma cidade.');
    }
});

/** Event listener para o botão de usar localização atual. */
DOMElements.botaoLocalizacao.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (posicao) => {
                const { latitude, longitude } = posicao.coords;
                buscarDadosClimaticos(null, latitude, longitude);
            },
            (erro) => {
                showError('Não foi possível obter sua localização. Verifique as permissões do navegador.');
            }
        );
    } else {
        showError('Seu navegador não suporta geolocalização.');
    }
});

/** Event listener para o input da cidade (busca ao pressionar Enter e sugestões). */
DOMElements.inputCidade.addEventListener('keyup', (event) => {
    const cidade = DOMElements.inputCidade.value.trim();
    if (event.key === 'Enter') {
        if (cidade) {
            buscarDadosClimaticos(cidade);
            DOMElements.sugestoesLista.style.display = 'none';
        } else {
            showError('Por favor, digite o nome de uma cidade.');
        }
    } else {
        buscarSugestoes(cidade);
    }
});

/** Event listener para fechar a lista de sugestões ao clicar fora dela. */
document.addEventListener('click', (event) => {
    if (!DOMElements.sugestoesLista.contains(event.target) && !DOMElements.inputCidade.contains(event.target)) {
        DOMElements.sugestoesLista.style.display = 'none';
    }
});

/** Event listener para o seletor de unidades. */
DOMElements.unitSwitch.addEventListener('change', () => {
    currentUnit = DOMElements.unitSwitch.checked ? 'imperial' : 'metric';
    localStorage.setItem('unit', currentUnit);
    
    const ultimaCidade = localStorage.getItem('ultimaCidade');
    if (ultimaCidade) {
        buscarDadosClimaticos(ultimaCidade);
    }
});