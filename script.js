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
    "11d": "amcharts_weather_icons_1.0.0/animated/thunder.svg",
    "11n": "amcharts_weather_icons_1.0.0/animated/thunder.svg",
    "13d": "amcharts_weather_icons_1.0.0/animated/snowy-1.svg",
    "13n": "amcharts_weather_icons_1.0.0/animated/snowy-4.svg",
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
    chanceChuva: document.getElementById('chance-chuva'),
    precipitacaoHoje: document.getElementById('precipitacao-hoje'),
    errorContainer: document.getElementById('error-container'),
};

// =================================================================================================
// --- ESTADO DA APLICAÇÃO E CONVERSÕES ---
// =================================================================================================

let currentUnit = 'metric'; // 'metric' para Celsius, 'imperial' para Fahrenheit
let rawData = {}; // Armazena os dados brutos da API em unidades métricas

const CONVERSIONS = {
    toFahrenheit: (c) => (c * 9 / 5) + 32,
    msToKmh: (ms) => ms * 3.6,
    msToMph: (ms) => ms * 2.23694,
    metersToKm: (m) => m / 1000,
    metersToMiles: (m) => m / 1609.34,
};

// =================================================================================================
// --- FUNÇÕES DE UI (INTERFACE DO USUÁRIO) ---
// =================================================================================================

function showLoader() { DOMElements.loaderContainer.style.display = 'flex'; }
function hideLoader() { DOMElements.loaderContainer.style.display = 'none'; }
function showError(message) { DOMElements.errorContainer.textContent = message; DOMElements.errorContainer.style.display = 'block'; }
function hideError() { DOMElements.errorContainer.style.display = 'none'; }
function formatarHora(timestamp) { return new Date(timestamp * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }

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

function definirEfeitosDeClima(weatherMain) {
    document.body.className = ''; // Limpa classes antigas
    const clima = weatherMain.toLowerCase();

    if (clima === 'rain' || clima === 'drizzle') {
        document.body.classList.add('rain');
    } else if (clima === 'snow') {
        document.body.classList.add('snow');
    }

    switch(clima) {
        case 'clear':
            document.body.style.background = 'linear-gradient(to top, #2F80ED, #1A63D3)';
            break;
        case 'clouds':
            document.body.style.background = 'linear-gradient(to top, #bdc3c7, #2c3e50)';
            break;
        case 'rain':
        case 'drizzle':
            document.body.style.background = 'linear-gradient(to top, #4e54c8, #8f94fb)';
            break;
        case 'thunderstorm':
            document.body.style.background = 'linear-gradient(to top, #373B44, #4286f4)';
            break;
        case 'snow':
            document.body.style.background = 'linear-gradient(to top, #6A82FB, #FC5C7D)';
            break;
        case 'mist':
        case 'fog':
        case 'haze':
            document.body.style.background = 'linear-gradient(to top, #606C88, #3F4C6B)';
            break;
        default:
            document.body.style.background = 'linear-gradient(to top, #4facfe, #00f2fe)';
    }
}

// =================================================================================================
// --- FUNÇÕES DE ATUALIZAÇÃO DO DOM ---
// =================================================================================================

function atualizarUnidadesExibidas() {
    if (!rawData.climaAtual) return;

    const isImperial = currentUnit === 'imperial';
    const tempUnit = isImperial ? '°F' : '°C';
    const windUnit = isImperial ? 'mph' : 'km/h';
    const distUnit = isImperial ? 'mi' : 'km';

    const { climaAtual, previsao } = rawData;

    const elementsToAnimate = [ DOMElements.temperatura, DOMElements.sensacao, DOMElements.vento, DOMElements.rajadaVento, DOMElements.visibilidade ];
    elementsToAnimate.forEach(el => el.classList.add('fade-out'));

    setTimeout(() => {
        DOMElements.temperatura.textContent = `${(isImperial ? CONVERSIONS.toFahrenheit(climaAtual.main.temp) : climaAtual.main.temp).toFixed(1)}${tempUnit}`;
        DOMElements.sensacao.textContent = `Sensação térmica: ${(isImperial ? CONVERSIONS.toFahrenheit(climaAtual.main.feels_like) : climaAtual.main.feels_like).toFixed(1)}${tempUnit}`;
        DOMElements.vento.textContent = `Vento: ${(isImperial ? CONVERSIONS.msToMph(climaAtual.wind.speed) : CONVERSIONS.msToKmh(climaAtual.wind.speed)).toFixed(1)} ${windUnit}`;
        DOMElements.rajadaVento.textContent = climaAtual.wind.gust ? `${(isImperial ? CONVERSIONS.msToMph(climaAtual.wind.gust) : CONVERSIONS.msToKmh(climaAtual.wind.gust)).toFixed(1)} ${windUnit}` : '--';
        DOMElements.visibilidade.textContent = `${(isImperial ? CONVERSIONS.metersToMiles(climaAtual.visibility) : CONVERSIONS.metersToKm(climaAtual.visibility)).toFixed(1)} ${distUnit}`;
        
        atualizarDOM5Dias(previsao);
        atualizarDOMHoraAHora(previsao);

        elementsToAnimate.forEach(el => el.classList.remove('fade-out'));
    }, 150);
}

function processarEExibirDados(dadosAtuais, dadosPrevisao, dadosAr, dadosAlertas) {
    rawData = { climaAtual: dadosAtuais, previsao: dadosPrevisao, qualidadeAr: dadosAr, alertas: dadosAlertas };

    const { weather, sys, name } = dadosAtuais;
    DOMElements.nomeCidade.textContent = `${name}, ${sys.country}`;
    DOMElements.descricao.textContent = weather[0].description;
    DOMElements.iconeClima.src = ICON_MAP[weather[0].icon] || 'amcharts_weather_icons_1.0.0/animated/weather.svg';
    DOMElements.umidade.textContent = `Umidade: ${dadosAtuais.main.humidity}%`;
    DOMElements.nascerDoSol.textContent = formatarHora(sys.sunrise);
    DOMElements.porDoSol.textContent = formatarHora(sys.sunset);
    DOMElements.pressao.textContent = `${dadosAtuais.main.pressure} hPa`;
    DOMElements.qualidadeAr.textContent = dadosAr.list.length > 0 ? getDescricaoQualidadeAr(dadosAr.list[0].main.aqi) : '--';

    // Calcula e exibe os dados de chuva/precipitação para o dia de hoje
    const hojeLocal = new Date().toISOString().split('T')[0];
    const previsoesDeHoje = rawData.previsao.list.filter(item => item.dt_txt.startsWith(hojeLocal));
    const popMaxHoje = previsoesDeHoje.length > 0 ? Math.max(...previsoesDeHoje.map(p => p.pop)) : 0;
    const chuvaTotalHoje = previsoesDeHoje.reduce((acc, p) => acc + (p.rain?.['3h'] || 0), 0);
    DOMElements.chanceChuva.textContent = `${(popMaxHoje * 100).toFixed(0)}%`;
    DOMElements.precipitacaoHoje.textContent = `${chuvaTotalHoje.toFixed(1)} mm`;

    definirEfeitosDeClima(weather[0].main);
    atualizarDOMAlertas(dadosAlertas);
    atualizarUnidadesExibidas();

    DOMElements.resultadoDiv.classList.add('show');
}

function atualizarDOM5Dias(dados) {
    DOMElements.previsao5DiasDiv.innerHTML = '<h3>Próximos 5 dias</h3>';
    if (!dados) return;

    const isImperial = currentUnit === 'imperial';
    const tempUnit = isImperial ? '°F' : '°C';
    const windUnit = isImperial ? 'mph' : 'km/h';

    const previsoesPorDia = {};
    dados.list.forEach(item => {
        const dataString = item.dt_txt.split(' ')[0];
        if (!previsoesPorDia[dataString]) previsoesPorDia[dataString] = [];
        previsoesPorDia[dataString].push(item);
    });

    const hojeLocal = new Date().toISOString().split('T')[0];
    const datasOrdenadas = Object.keys(previsoesPorDia).sort();
    
    // Lógica corrigida para pular o dia de hoje
    let diasParaExibir = datasOrdenadas;
    if (diasParaExibir.length > 0 && diasParaExibir[0] === hojeLocal) {
        diasParaExibir.shift(); // Remove o dia de hoje do início do array
    }

    diasParaExibir.slice(0, 5).forEach(data => {
        const diaPrevisoes = previsoesPorDia[data];
        const diaSemana = new Date(diaPrevisoes[0].dt * 1000).toLocaleDateString('pt-BR', { weekday: 'long' });
        
        const temp_min = Math.min(...diaPrevisoes.map(p => p.main.temp_min));
        const temp_max = Math.max(...diaPrevisoes.map(p => p.main.temp_max));
        const pop_max = Math.max(...diaPrevisoes.map(p => p.pop));
        const umidade_media = diaPrevisoes.reduce((acc, p) => acc + p.main.humidity, 0) / diaPrevisoes.length;
        const vento_medio_ms = diaPrevisoes.reduce((acc, p) => acc + p.wind.speed, 0) / diaPrevisoes.length;
        const chuva_total_mm = diaPrevisoes.reduce((acc, p) => acc + (p.rain?.['3h'] || 0), 0);

        const ventoFormatado = isImperial ? CONVERSIONS.msToMph(vento_medio_ms) : CONVERSIONS.msToKmh(vento_medio_ms);

        const previsaoMeioDia = diaPrevisoes.find(p => p.dt_txt.includes('12:00:00')) || diaPrevisoes[0];

        const diaDiv = document.createElement('div');
        diaDiv.className = 'dia-previsao';
        diaDiv.innerHTML = `
            <div class="dia-previsao-info">
                <img src="${ICON_MAP[previsaoMeioDia.weather[0].icon]}" alt="${previsaoMeioDia.weather[0].description}">
                <div>
                    <p>${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}</p>
                    <p class="description">${previsaoMeioDia.weather[0].description}</p>
                </div>
            </div>
            <div class="dia-previsao-detalhes">
                <p><span>☔️ ${(pop_max * 100).toFixed(0)}%</span> Chance de Chuva</p>
                <p><span>🌧️ ${chuva_total_mm.toFixed(1)} mm</span> Precipitação</p>
                <p><span>💨 ${ventoFormatado.toFixed(1)} ${windUnit}</span> Vento</p>
                <p><span>💧 ${umidade_media.toFixed(0)}%</span> Umidade</p>
            </div>
            <div class="dia-previsao-temp">
                <span>${(isImperial ? CONVERSIONS.toFahrenheit(temp_max) : temp_max).toFixed(0)}${tempUnit}</span>
                <span class="min">${(isImperial ? CONVERSIONS.toFahrenheit(temp_min) : temp_min).toFixed(0)}${tempUnit}</span>
            </div>
        `;
        DOMElements.previsao5DiasDiv.appendChild(diaDiv);
    });
}

function atualizarDOMHoraAHora(dados) {
    DOMElements.previsaoHoraAHoraContainer.innerHTML = '';
    if (!dados) return;

    const isImperial = currentUnit === 'imperial';
    const tempUnit = isImperial ? '°F' : '°C';
    const windUnit = isImperial ? 'mph' : 'km/h';

    dados.list.slice(0, 8).forEach(item => {
        const ventoFormatado = isImperial ? CONVERSIONS.msToMph(item.wind.speed) : CONVERSIONS.msToKmh(item.wind.speed);
        const chuva_mm = item.rain?.['3h'] || 0;

        const horaDiv = document.createElement('div');
        horaDiv.className = 'hora-previsao';
        horaDiv.innerHTML = `
            <p class="hora-previsao-hora">${formatarHora(item.dt)}</p>
            <img src="${ICON_MAP[item.weather[0].icon]}" alt="${item.weather[0].description}">
            <p class="hora-previsao-temp">${(isImperial ? CONVERSIONS.toFahrenheit(item.main.temp) : item.main.temp).toFixed(0)}${tempUnit}</p>
            <p class="hora-previsao-detalhe">☔️ ${(item.pop * 100).toFixed(0)}%</p>
            <p class="hora-previsao-detalhe">💧 ${item.main.humidity}%</p>
            <p class="hora-previsao-detalhe">💨 ${ventoFormatado.toFixed(1)} ${windUnit}</p>
        `;
        DOMElements.previsaoHoraAHoraContainer.appendChild(horaDiv);
    });
}

function atualizarDOMAlertas(dados) {
    DOMElements.alertasClima.innerHTML = '';
    if (dados && dados.alerts && dados.alerts.length > 0) {
        const alerta = dados.alerts[0];
        DOMElements.alertasClima.innerHTML = `<div class="alerta-clima"><h4>⚠️ Alerta: ${alerta.event}</h4><p>${alerta.description}</p></div>`;
    }
}

function atualizarDOMSugestoes(dados) {
    DOMElements.sugestoesLista.innerHTML = '';
    const nomesVistos = new Set();
    dados.filter(cidade => {
        const id = `${cidade.name},${cidade.state},${cidade.country}`;
        if (nomesVistos.has(id)) return false;
        nomesVistos.add(id);
        return true;
    }).forEach(cidade => {
        const li = document.createElement('li');
        li.textContent = `${cidade.name}, ${cidade.country}`;
        li.onclick = () => {
            DOMElements.inputCidade.value = cidade.name;
            DOMElements.sugestoesLista.style.display = 'none';
            buscarDadosClimaticos(cidade.name);
        };
        DOMElements.sugestoesLista.appendChild(li);
    });
    DOMElements.sugestoesLista.style.display = dados.length > 0 ? 'block' : 'none';
}

// =================================================================================================
// --- FUNÇÕES DO MAPA ---
// =================================================================================================

let map;
let isMapInitialized = false;

function inicializarMapa(lat, lon) {
    if (isMapInitialized) {
        map.setView([lat, lon], 10);
        return;
    }
    map = L.map('mapa-clima').setView([lat, lon], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
    isMapInitialized = true;
    
    const tileLayers = {};
    let activeLayer;

    document.querySelectorAll('.mapa-controle-botao').forEach(botao => {
        const layerName = botao.dataset.layer;
        tileLayers[layerName] = L.tileLayer(`https://clima-agora-backend.onrender.com/api/map/${layerName}/{z}/{x}/{y}`, { attribution: '&copy; OpenWeatherMap' });
        
        botao.addEventListener('click', (e) => {
            if (activeLayer) {
                map.removeLayer(activeLayer);
            }
            document.querySelector('.mapa-controle-botao.active').classList.remove('active');
            e.target.classList.add('active');
            activeLayer = tileLayers[layerName];
            activeLayer.addTo(map);
        });
    });

    // Adiciona a camada inicial
    activeLayer = tileLayers['precipitation_new'];
    activeLayer.addTo(map);
}

// =================================================================================================
// --- FUNÇÕES DE API ---
// =================================================================================================

async function fetchData(openWeatherUrl) {
    const proxyUrl = `https://clima-agora-backend.onrender.com/api/weather?url=${encodeURIComponent(openWeatherUrl)}`;
    const resposta = await fetch(proxyUrl);
    if (!resposta.ok) {
        const errorData = await resposta.json().catch(() => ({ message: 'Erro desconhecido no servidor.' }));
        throw new Error(errorData.message || 'Não foi possível obter os dados.');
    }
    return resposta.json();
}

async function buscarDadosClimaticos(cidade = null, lat = null, lon = null) {
    showLoader();
    hideError();
    try {
        let initialLat, initialLon, cityName;
        if (cidade) {
            const geoData = await fetchData(`https://api.openweathermap.org/geo/1.0/direct?q=${cidade}&limit=1`);
            if (geoData.length === 0) throw new Error('Cidade não encontrada.');
            initialLat = geoData[0].lat;
            initialLon = geoData[0].lon;
            cityName = geoData[0].name;
        } else {
            initialLat = lat;
            initialLon = lon;
            const reverseGeo = await fetchData(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1`);
            if (reverseGeo.length > 0) cityName = reverseGeo[0].name;
        }

        localStorage.setItem('ultimaCidade', cityName);

        const [dadosAtuais, dadosPrevisao, dadosAr, dadosAlertas] = await Promise.all([
            fetchData(`https://api.openweathermap.org/data/2.5/weather?lat=${initialLat}&lon=${initialLon}&units=metric&lang=pt`),
            fetchData(`https://api.openweathermap.org/data/2.5/forecast?lat=${initialLat}&lon=${initialLon}&units=metric&lang=pt`),
            fetchData(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${initialLat}&lon=${initialLon}`),
            fetchData(`https://api.openweathermap.org/data/3.0/onecall?lat=${initialLat}&lon=${initialLon}&exclude=current,minutely,hourly,daily`).catch(() => null),
        ]);

        inicializarMapa(initialLat, initialLon);
        processarEExibirDados(dadosAtuais, dadosPrevisao, dadosAr, dadosAlertas);

    } catch (erro) {
        showError(erro.message);
    } finally {
        hideLoader();
    }
}

async function buscarSugestoes(query) {
    if (query.length < 3) {
        DOMElements.sugestoesLista.style.display = 'none';
        return;
    }
    try {
        const dados = await fetchData(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5`);
        atualizarDOMSugestoes(dados);
    } catch (erro) { console.error('Erro ao buscar sugestões:', erro); }
}

// =================================================================================================
// --- EVENT LISTENERS ---
// =================================================================================================

document.addEventListener('DOMContentLoaded', () => {
    const savedUnit = localStorage.getItem('unit');
    if (savedUnit) {
        currentUnit = savedUnit;
        DOMElements.unitSwitch.checked = savedUnit === 'imperial';
    }
    const ultimaCidade = localStorage.getItem('ultimaCidade');
    if (ultimaCidade) {
        buscarDadosClimaticos(ultimaCidade);
    } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => buscarDadosClimaticos(null, pos.coords.latitude, pos.coords.longitude),
            () => buscarDadosClimaticos('São Paulo') // Fallback
        );
    } else {
        buscarDadosClimaticos('São Paulo'); // Fallback
    }
});

DOMElements.botaoBuscar.addEventListener('click', () => {
    const cidade = DOMElements.inputCidade.value.trim();
    if (cidade) {
        buscarDadosClimaticos(cidade);
        DOMElements.sugestoesLista.style.display = 'none';
    }
});

DOMElements.botaoLocalizacao.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => buscarDadosClimaticos(null, pos.coords.latitude, pos.coords.longitude),
            () => showError('Não foi possível obter sua localização.')
        );
    }
});

DOMElements.inputCidade.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        const cidade = DOMElements.inputCidade.value.trim();
        if (cidade) {
            buscarDadosClimaticos(cidade);
            DOMElements.sugestoesLista.style.display = 'none';
        }
    } else {
        buscarSugestoes(DOMElements.inputCidade.value.trim());
    }
});

document.addEventListener('click', (e) => {
    if (!DOMElements.sugestoesLista.contains(e.target) && !DOMElements.inputCidade.contains(e.target)) {
        DOMElements.sugestoesLista.style.display = 'none';
    }
});

DOMElements.unitSwitch.addEventListener('change', () => {
    currentUnit = DOMElements.unitSwitch.checked ? 'imperial' : 'metric';
    localStorage.setItem('unit', currentUnit);
    atualizarUnidadesExibidas(); // Apenas atualiza a exibição, sem nova chamada de API
});
