export default async function handler(req, res) {
    // Permite que qualquer origem acesse essa função (libera o CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const API_KEY = "81ee36dbdf5f0e139157f9529400ce94";
    const url = `https://gnews.io/api/v4/top-headlines?category=general&lang=pt&country=br&max=10&apikey=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: "Erro ao buscar na GNews", details: data });
        }

        // Cache de 10 minutos na Vercel: garante que o site não gaste requisições à toa 
        // e traga conteúdo atualizado periodicamente
        res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: "Erro interno no servidor proxy", message: error.message });
    }
}