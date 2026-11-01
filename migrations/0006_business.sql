-- Спорт-клуб продаётся как бизнес в арендованном помещении: без цены за м²
UPDATE listings SET data = json_set(data, '$.business', json('true')) WHERE id = 'ad-104826708';
