// Registro de exportacoes do dominio. Cada subagente acrescenta APENAS as suas linhas
// (plano.md, secao 4.1); nao reordene nem remova linhas alheias.

// compartilhado (dono: AD)
export { ErroDeDominio } from "./compartilhado/erro-de-dominio";
export { Instante } from "./compartilhado/instante";
export { InstanteInvalidoError } from "./compartilhado/instante-invalido-error";
export type { Relogio } from "./compartilhado/relogio";
export { RelogioFixo } from "./compartilhado/relogio-fixo";
export { Dinheiro } from "./compartilhado/dinheiro";
export { DinheiroInvalidoError } from "./compartilhado/dinheiro-invalido-error";
export { Identificador, EstabelecimentoId } from "./compartilhado/identificador";
export { IdentificadorInvalidoError } from "./compartilhado/identificador-invalido-error";
export type { GeradorDeIdentificador } from "./compartilhado/gerador-de-identificador";
export { GeradorSequencialDeIdentificador } from "./compartilhado/gerador-sequencial-de-identificador";

// agendamento e catalogo (dono: BN)
export { Agendamento } from "./agendamento/agendamento";
export type { DadosDoAgendamento } from "./agendamento/agendamento";
export { AgendamentoId } from "./agendamento/agendamento-id";
export { ClienteFinalId } from "./agendamento/cliente-final-id";
export { JanelaDeTempo } from "./agendamento/janela-de-tempo";
export { JanelaDeTempoInvalidaError } from "./agendamento/janela-de-tempo-invalida-error";
export { StatusAgendamento } from "./agendamento/status-agendamento";
export type { PoliticaDeCancelamento } from "./agendamento/politica-de-cancelamento";
export { AgendamentoNoPassadoError } from "./agendamento/agendamento-no-passado-error";
export { AgendamentoNaoCancelavelError } from "./agendamento/agendamento-nao-cancelavel-error";
export { ForaDoPrazoDeCancelamentoError } from "./agendamento/fora-do-prazo-de-cancelamento-error";
export { AgendamentoNaoEncontradoError } from "./agendamento/agendamento-nao-encontrado-error";
export type { AgendamentoRepositorio } from "./agendamento/agendamento-repositorio";
export { ServicoId } from "./catalogo/servico-id";
export { ProfissionalId } from "./catalogo/profissional-id";
export { Slug } from "./catalogo/slug";
export { SlugInvalidoError } from "./catalogo/slug-invalido-error";
export type { ServicoLeitura } from "./catalogo/servico-leitura";
export type { ProfissionalLeitura } from "./catalogo/profissional-leitura";
export type { EstabelecimentoLeitura } from "./catalogo/estabelecimento-leitura";
export type { ServicoRepositorio } from "./catalogo/servico-repositorio";
export type { ProfissionalRepositorio } from "./catalogo/profissional-repositorio";
export type { EstabelecimentoRepositorio } from "./catalogo/estabelecimento-repositorio";

// notificacao (dono: NC)
export { CANAIS_DE_MENSAGEM } from "./notificacao/canal-de-mensagem";
export type { CanalDeMensagem } from "./notificacao/canal-de-mensagem";
export { ESTADOS_DA_MENSAGEM } from "./notificacao/estado-da-mensagem";
export type { EstadoDaMensagem } from "./notificacao/estado-da-mensagem";
export { Telefone } from "./notificacao/telefone";
export { ContatoDeMensagem } from "./notificacao/contato-de-mensagem";
export { ModeloDeMensagem } from "./notificacao/modelo-de-mensagem";
export { MensagemParaEnviar } from "./notificacao/mensagem-para-enviar";
export type { DadosDaMensagem } from "./notificacao/mensagem-para-enviar";
export { IdDaMensagemNoProvedor } from "./notificacao/id-da-mensagem-no-provedor";
export { ResultadoDoEnvio } from "./notificacao/resultado-do-envio";
export type { DadosDoResultado } from "./notificacao/resultado-do-envio";
export type { ProvedorDeMensagem } from "./notificacao/provedor-de-mensagem";
export { DestinatarioInvalidoError } from "./notificacao/destinatario-invalido-error";
export { ModeloDeMensagemInvalidoError } from "./notificacao/modelo-de-mensagem-invalido-error";
export { IdDoProvedorInvalidoError } from "./notificacao/id-do-provedor-invalido-error";
export { CanalNaoSuportadoError } from "./notificacao/canal-nao-suportado-error";
export { EnvioNaoEncontradoError } from "./notificacao/envio-nao-encontrado-error";
export { ProvedorDeMensagemIndisponivelError } from "./notificacao/provedor-de-mensagem-indisponivel-error";
export { MensagemRejeitadaPeloProvedorError } from "./notificacao/mensagem-rejeitada-pelo-provedor-error";
export { TransicaoDeEnvioInvalidaError } from "./notificacao/transicao-de-envio-invalida-error";
export { ProvedorDeMensagemEmMemoria } from "./notificacao/testes-suporte/provedor-de-mensagem-em-memoria";

// cobranca (dono: NC)
export { PERIODICIDADES_DE_COBRANCA } from "./cobranca/periodicidade-de-cobranca";
export type { PeriodicidadeDeCobranca } from "./cobranca/periodicidade-de-cobranca";
export { ESTADOS_DA_ASSINATURA } from "./cobranca/estado-da-assinatura";
export type { EstadoDaAssinatura } from "./cobranca/estado-da-assinatura";
export { ESTADOS_DA_COBRANCA } from "./cobranca/estado-da-cobranca";
export type { EstadoDaCobranca } from "./cobranca/estado-da-cobranca";
export { IdNoGateway } from "./cobranca/id-no-gateway";
export { PedidoDeAssinatura } from "./cobranca/pedido-de-assinatura";
export type { DadosDoPedidoDeAssinatura } from "./cobranca/pedido-de-assinatura";
export { PedidoDeCobranca } from "./cobranca/pedido-de-cobranca";
export type { DadosDoPedidoDeCobranca } from "./cobranca/pedido-de-cobranca";
export { AssinaturaNoGateway } from "./cobranca/assinatura-no-gateway";
export type { DadosDaAssinaturaNoGateway } from "./cobranca/assinatura-no-gateway";
export { CobrancaNoGateway } from "./cobranca/cobranca-no-gateway";
export type { DadosDaCobrancaNoGateway } from "./cobranca/cobranca-no-gateway";
export type { GatewayDePagamento } from "./cobranca/gateway-de-pagamento";
export { PedidoDeCobrancaInvalidoError } from "./cobranca/pedido-de-cobranca-invalido-error";
export { IdNoGatewayInvalidoError } from "./cobranca/id-no-gateway-invalido-error";
export { AssinaturaNaoEncontradaError } from "./cobranca/assinatura-nao-encontrada-error";
export { CobrancaNaoEncontradaError } from "./cobranca/cobranca-nao-encontrada-error";
export { TransicaoDeCobrancaInvalidaError } from "./cobranca/transicao-de-cobranca-invalida-error";
export { GatewayDePagamentoIndisponivelError } from "./cobranca/gateway-de-pagamento-indisponivel-error";
export { PedidoRecusadoPeloGatewayError } from "./cobranca/pedido-recusado-pelo-gateway-error";
export { GatewayDePagamentoEmMemoria } from "./cobranca/testes-suporte/gateway-de-pagamento-em-memoria";
export type { EventoDeDominio } from "./compartilhado/evento-de-dominio";
export type { PublicadorDeEventos } from "./compartilhado/publicador-de-eventos";
