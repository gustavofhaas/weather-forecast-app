
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

app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
});
