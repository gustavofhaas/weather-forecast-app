
// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const port = 3000;

// Habilita o CORS para permitir requisições do seu frontend
app.use(cors());

// Pega a chave da API do arquivo .env
const apiKey = process.env.OPENWEATHERMAP_API_KEY;

if (!apiKey) {
    console.error("Erro: A chave da API OPENWEATHERMAP_API_KEY não foi encontrada no arquivo .env.");
    process.exit(1); // Encerra o processo se a chave não for encontrada
}

/**
 * Endpoint que atua como um proxy para as requisições à API OpenWeatherMap.
 * Ele recebe a URL da API como um parâmetro de consulta 'url',
 * anexa a chave da API de forma segura e repassa a requisição.
 */
app.get('/api/weather', async (req, res) => {
    // Pega a URL do OpenWeatherMap a partir dos parâmetros da query
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ message: 'Parâmetro de consulta "url" ausente.' });
    }

    try {
        // Adiciona a chave da API à URL
        const urlWithKey = `${url}&appid=${apiKey}`;

        const apiResponse = await fetch(urlWithKey);
        const data = await apiResponse.json();

        // Repassa o status e os dados da resposta da OpenWeatherMap para o frontend
        res.status(apiResponse.status).json(data);

    } catch (error) {
        console.error('Erro no proxy:', error);
        res.status(500).json({ message: 'Erro ao buscar dados da API OpenWeatherMap.' });
    }
});

/**
 * Endpoint que atua como um proxy para os TILES (imagens) do mapa.
 * Recebe os parâmetros do tile, busca a imagem na OpenWeatherMap com a chave segura
 * e a repassa (stream) para o cliente.
 */
app.get('/api/map/:layer/:z/:x/:y', async (req, res) => {
    const { layer, z, x, y } = req.params;

    // Lista de camadas permitidas para segurança
    const allowedLayers = ['precipitation_new', 'clouds_new', 'temp_new', 'wind_new', 'pressure_new'];
    if (!allowedLayers.includes(layer)) {
        return res.status(400).send('Camada de mapa inválida');
    }

    const tileUrl = `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${apiKey}`;

    try {
        const tileResponse = await fetch(tileUrl);

        if (!tileResponse.ok) {
            return res.status(tileResponse.status).send(tileResponse.statusText);
        }

        // Define os cabeçalhos da resposta com base na resposta da OpenWeatherMap
        res.setHeader('Content-Type', tileResponse.headers.get('content-type'));
        res.setHeader('Content-Length', tileResponse.headers.get('content-length'));

        // Transmite a imagem diretamente para o cliente
        tileResponse.body.pipe(res);

    } catch (error) {
        console.error('Erro no proxy do mapa:', error);
        res.status(500).send('Erro ao buscar o tile do mapa.');
    }
});

app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
});
