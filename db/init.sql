-- init.sql: create tables and insert sample data

-- providers
INSERT INTO providers (id, name, website) VALUES
('prov1','OpenWeather','https://openweathermap.org'),
('prov2','CoinGecko','https://coingecko.com'),
('prov3','AlphaVantage','https://alphavantage.co'),
('prov4','NewsAPI','https://newsapi.org'),
('prov5','OpenAI','https://openai.com'),
('prov6','IPStack','https://ipstack.com'),
('prov7','Twilio','https://twilio.com'),
('prov8','Unsplash','https://unsplash.com'),
('prov9','Mapbox','https://mapbox.com'),
('prov10','IPinfo','https://ipinfo.io')
ON CONFLICT DO NOTHING;

-- apis
INSERT INTO apis (id, name, provider_id, category, docs_url, pricing_url, free_tier) VALUES
('api1','OpenWeather API','prov1','Weather','https://openweathermap.org/api','https://openweathermap.org/price','Yes'),
('api2','CoinGecko API','prov2','Crypto','https://www.coingecko.com/en/api','https://www.coingecko.com/en/api/pricing','Yes'),
('api3','Alpha Vantage','prov3','Stock & Forex','https://www.alphavantage.co/documentation/','https://www.alphavantage.co/pricing','Yes'),
('api4','NewsAPI','prov4','News','https://newsapi.org/docs','https://newsapi.org/pricing','Yes'),
('api5','OpenAI API','prov5','AI','https://platform.openai.com/docs','https://platform.openai.com/pricing','Limited'),
('api6','IPStack API','prov6','Geo','https://ipstack.com/documentation','https://ipstack.com/pricing','Yes'),
('api7','Twilio SMS','prov7','Communication','https://www.twilio.com/docs/sms','https://www.twilio.com/sms/pricing','Limited'),
('api8','Unsplash API','prov8','Image','https://unsplash.com/developers','https://unsplash.com/pricing','Yes'),
('api9','Mapbox Tiles','prov9','Maps','https://docs.mapbox.com/api/','https://www.mapbox.com/pricing','Limited'),
('api10','IPinfo API','prov10','IP','https://ipinfo.io/developers','https://ipinfo.io/pricing','Yes')
ON CONFLICT DO NOTHING;

-- sample users (password placeholder)
INSERT INTO users (id, email, password, name) VALUES
('user_alex','alex@example.com','{hashed_pw}','Alex'),
('user_sam','sam@example.com','{hashed_pw}','Sam')
ON CONFLICT DO NOTHING;

-- sample reviews (anonymous allowed with nickname)
INSERT INTO reviews (id, api_id, nickname, rating, comment) VALUES
('r1','api5','Alex',5,'Great latency and docs.'),
('r2','api3','Sam',4,'Useful market data for quick checks.')
ON CONFLICT DO NOTHING;
