-- Up Migration
-- Verticais sao catalogo de referencia (necessario em qualquer ambiente), por isso migracao.
INSERT INTO vertical (slug, nome, vocabulario, servicos_modelo) VALUES
  ('manicure', 'Manicure e Pedicure', '{"profissional": "manicure", "servico": "procedimento", "cliente": "cliente", "estabelecimento": "studio"}'::jsonb,
   '[{"nome": "Esmaltação em gel", "duracaoMinutos": 60, "precoCentavos": 7000}, {"nome": "Manicure simples", "duracaoMinutos": 45, "precoCentavos": 4000}, {"nome": "Pedicure", "duracaoMinutos": 50, "precoCentavos": 4500}, {"nome": "Alongamento em fibra", "duracaoMinutos": 120, "precoCentavos": 16000}]'::jsonb),
  ('cabeleireiro', 'Cabeleireiro', '{"profissional": "cabeleireira", "servico": "procedimento", "cliente": "cliente", "estabelecimento": "salão"}'::jsonb,
   '[{"nome": "Corte feminino", "duracaoMinutos": 60, "precoCentavos": 9000}, {"nome": "Escova", "duracaoMinutos": 45, "precoCentavos": 5500}, {"nome": "Coloração", "duracaoMinutos": 120, "precoCentavos": 18000}, {"nome": "Hidratação", "duracaoMinutos": 60, "precoCentavos": 8000}]'::jsonb),
  ('barbearia', 'Barbearia', '{"profissional": "barbeiro", "servico": "serviço", "cliente": "cliente", "estabelecimento": "barbearia"}'::jsonb,
   '[{"nome": "Corte masculino", "duracaoMinutos": 30, "precoCentavos": 4500}, {"nome": "Barba", "duracaoMinutos": 30, "precoCentavos": 3500}, {"nome": "Corte e barba", "duracaoMinutos": 60, "precoCentavos": 7500}, {"nome": "Sobrancelha", "duracaoMinutos": 15, "precoCentavos": 1500}]'::jsonb),
  ('estetica', 'Estética', '{"profissional": "esteticista", "servico": "procedimento", "cliente": "cliente", "estabelecimento": "clínica"}'::jsonb,
   '[{"nome": "Limpeza de pele", "duracaoMinutos": 75, "precoCentavos": 14000}, {"nome": "Massagem relaxante", "duracaoMinutos": 60, "precoCentavos": 12000}, {"nome": "Depilação a laser", "duracaoMinutos": 30, "precoCentavos": 9000}, {"nome": "Design de sobrancelha", "duracaoMinutos": 30, "precoCentavos": 5000}]'::jsonb),
  ('outro', 'Outro', '{"profissional": "profissional", "servico": "serviço", "cliente": "cliente", "estabelecimento": "estabelecimento"}'::jsonb,
   '[{"nome": "Atendimento padrão", "duracaoMinutos": 30, "precoCentavos": 5000}, {"nome": "Atendimento estendido", "duracaoMinutos": 60, "precoCentavos": 9000}]'::jsonb);

-- Down Migration
DELETE FROM vertical WHERE slug IN ('manicure', 'cabeleireiro', 'barbearia', 'estetica', 'outro');
