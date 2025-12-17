const axios = require('axios');
const xml2js = require('xml2js');

exports.getRates = async (req, res) => {
    try {
        const response = await axios.get('https://www.tcmb.gov.tr/kurlar/today.xml');
        const parser = new xml2js.Parser({ explicitArray: false });

        parser.parseString(response.data, (err, result) => {
            if (err) {
                console.error('XML Parse Error:', err);
                return res.status(500).json({ error: 'Failed to parse TCMB data' });
            }

            const currencies = result.Tarih_Date.Currency;
            const usd = currencies.find(c => c.$.CurrencyCode === 'USD');
            const eur = currencies.find(c => c.$.CurrencyCode === 'EUR');

            // Return ForexBuying (Döviz Alış)
            res.json({
                USD: parseFloat(usd.ForexBuying),
                EUR: parseFloat(eur.ForexBuying),
                TRY: 1.0
            });
        });
    } catch (error) {
        console.error('TCMB Fetch Error:', error);
        res.status(500).json({ error: 'Failed to fetch rates from TCMB' });
    }
};
