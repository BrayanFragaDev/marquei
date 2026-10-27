# produto.md — Agendaí (nome provisório)

> Plataforma de agendamento para qualquer estabelecimento de serviços por hora marcada
> (manicure, cabeleireira, barbeiro, estética, e o que vier depois), com a marca de cada
> estabelecimento no app do cliente e um console central para quem opera a plataforma.

## 1. Visão

Um único produto, vendido como SaaS, que cada estabelecimento configura para parecer o
**seu próprio app**. O dono da plataforma (você) administra todos os clientes, acompanha a
saúde do negócio por indicadores e fatura por plano.

**Problema:** profissionais de beleza agendam por WhatsApp e caderno: perdem clientes por
demora na resposta, sofrem com faltas (no-show) e não enxergam números do próprio negócio.

**Proposta de valor**
- Para o cliente final: agendar em menos de 1 minuto, sem criar conta complicada.
- Para o estabelecimento: agenda cheia, menos faltas, marca própria, números simples.
- Para a plataforma: receita recorrente, escala sem código novo por cliente (tudo é configuração).

## 2. Personas e superfícies

| Persona | O que faz | Superfície | Autenticação |
|---|---|---|---|
| **Cliente final** | Escolhe serviço, profissional, horário; vê e cancela agendamentos | App mobile nativo (iOS/Android) com a marca do estabelecimento | Telefone + código (OTP) |
| **Profissional** | Vê a própria agenda do dia, marca atendimento como concluído | App mobile (modo profissional) e web responsiva | E-mail + senha |
| **Dono/gestor do estabelecimento** | Personaliza marca, serviços, equipe, horários, vê indicadores do salão | **Console do Estabelecimento** (web) | E-mail + senha (+ 2FA opcional) |
| **Operador da plataforma (você)** | Administra todos os estabelecimentos, leads, planos, cobrança, suporte | **Console da Plataforma** (web, somente web) | E-mail + senha + 2FA obrigatório |

Regra de separação: o Console da Plataforma é uma aplicação própria, com domínio, deploy e
autenticação separados. Nunca compartilha rota nem sessão com o Console do Estabelecimento.

## 3. Multi-vertical: como "qualquer estabelecimento" funciona

O sistema não conhece "salão" no código. Conhece **Estabelecimento**, **Serviço**,
**Profissional** e **Agendamento**. O que muda por segmento é configuração:

- **Vertical (template):** Manicure, Cabeleireiro(a), Barbearia, Estética, Outro. Cada uma
  traz serviços de exemplo, duração padrão, tema visual inicial e vocabulário.
- **Vocabulário configurável:** "profissional" pode virar "barbeiro" ou "manicure";
  "serviço" pode virar "procedimento". Aplicado em todo o app do cliente.
- **Modo de agenda:** profissional único (manicure autônoma) ou equipe (salão com vários).
- **Sinal/pagamento (fase posterior):** exigir sinal reduz no-show; ligado por estabelecimento.

## 4. Customização visual (pelo estabelecimento)

Tudo é **design token** guardado por estabelecimento e lido pelo app em tempo de execução,
sem nova versão na loja:

- Logo, capa/banner e galeria de fotos de trabalhos.
- Paleta: cor principal, cor de apoio, fundo, texto (validação automática de contraste).
- Tipografia: seleção entre famílias curadas (4 a 6 opções que combinam bem).
- Forma: raio dos cantos (reto, suave, arredondado) e densidade (compacto, confortável).
- Estilo de cabeçalho e de cartão de serviço (2 a 3 presets de layout).
- Textos: frase de boas-vindas, vocabulário, mensagem de confirmação.
- **Pré-visualização ao vivo** no painel, em moldura de celular, antes de publicar.
- **Rascunho x publicado:** edita sem afetar clientes até clicar em "Publicar".

Limite deliberado: o estabelecimento escolhe entre opções curadas. Isso garante que
qualquer combinação continue bonita e acessível, e mantém o suporte barato.

## 5. Módulos do produto

### 5.1 App do Cliente (mobile)
Descoberta do estabelecimento por link/QR/código; catálogo; escolha de profissional;
calendário com horários livres reais; confirmação; lembretes (push e WhatsApp); histórico;
reagendar e cancelar dentro da política; avaliação pós-atendimento.

### 5.2 Console do Estabelecimento (web)
Personalização de marca; serviços; equipe e permissões; horários, folgas e bloqueios;
agenda (dia/semana) com criação manual de agendamento; base de clientes; indicadores do
próprio negócio; página pública de agendamento e QR code; campanhas simples de retorno.

### 5.3 Console da Plataforma (web, você)
- **Dashboard de indicadores** (seção 6).
- **Leads (CRM):** funil Captado → Contatado → Demo → Trial → Ativo / Perdido, com origem,
  responsável e histórico de contatos.
- **Estabelecimentos:** lista, filtros, detalhe, status, plano, usuários, uso.
- **Planos e cobrança:** Grátis / Pro / Premium (limites e preços editáveis), faturas,
  inadimplência, cupons.
- **Suporte:** acesso assistido ("entrar como" o estabelecimento) com consentimento e log.
- **Feature flags:** liberar recurso por plano ou por estabelecimento.
- **Templates de vertical:** editar serviços, temas e vocabulário de cada segmento.
- **Auditoria:** quem mudou o quê e quando (obrigatório para acesso assistido).
- **Configurações globais:** provedores de notificação, textos legais, manutenção.

## 6. Indicadores do Dashboard da Plataforma

**Receita e crescimento**
- MRR, ARR, ARPA (receita média por estabelecimento).
- Novos clientes pagantes no período, churn (cancelamentos) e retenção por coorte.
- Conversão do funil de leads por etapa e por origem; tempo médio até a conversão.

**Uso do produto**
- Agendamentos criados por dia/semana/mês (total e por estabelecimento).
- Estabelecimentos ativos (>= 1 agendamento nos últimos 7 dias) x inativos.
- Clientes finais ativos e novos; agendamentos por cliente.
- Taxa de ocupação média da agenda; horários de pico; serviços mais agendados.
- Adoção da customização: % de estabelecimentos com tema publicado.

**Qualidade e saúde**
- Taxa de no-show e de cancelamento (geral, por vertical, por estabelecimento).
- Lista de **risco de churn**: estabelecimentos sem agendamento há 14 dias ou com queda
  acentuada de uso.
- Tempo médio de agendamento (da abertura do app à confirmação).
- Erros do app, falhas de notificação, tickets de suporte abertos.

**Cortes obrigatórios em qualquer gráfico:** período, vertical, plano e estabelecimento.

## 7. Indicadores do Console do Estabelecimento
Agendamentos e faturamento estimado do período; ocupação por profissional; no-show;
serviços mais vendidos; clientes novos x recorrentes; clientes sem retorno há 45 dias.

## 8. Monetização
- **Grátis:** 1 profissional, limite mensal de agendamentos, marca da plataforma visível.
- **Pro:** equipe, personalização completa, lembretes por WhatsApp, indicadores.
- **Premium:** sinal/pagamento online, múltiplas unidades, domínio próprio, suporte prioritário.
- Preços e limites vivem em configuração (editáveis no Console da Plataforma), não em código.
- Geração de leads: página pública de captação da plataforma + convite pelo próprio app
  ("Quer um app assim para o seu negócio?") no rodapé do plano Grátis.

## 9. Requisitos não funcionais
- **Isolamento de dados por estabelecimento** garantido no banco (não só na aplicação).
- **LGPD:** consentimento, exportação e exclusão de dados do cliente final.
- **Acessibilidade:** contraste mínimo validado, alvos de toque grandes, leitores de tela.
- **Desempenho:** abrir o app e ver horários livres em menos de 2 segundos em 4G.
- **Manutenibilidade:** arquitetura orientada a objetos, camadas explícitas (ver CLAUDE.md).
- **Idioma:** pt-BR primeiro; textos preparados para internacionalização.

## 10. Fora de escopo (v1)
Marketplace de descoberta entre estabelecimentos; programa de fidelidade; estoque/PDV;
folha de comissões; emissão de nota fiscal.

## 11. Premissas a validar
1. Cliente final entra por link/QR do estabelecimento (um app por marca ou um app único com
   marca dinâmica). **Recomendação:** app único com marca dinâmica, para manter uma só
   publicação nas lojas; opção de app "white-label" dedicado como upsell Premium.
2. Cobrança dos estabelecimentos via gateway nacional (Pix e cartão recorrente).
3. WhatsApp via API oficial (custo por conversa repassado ao plano Pro/Premium).
