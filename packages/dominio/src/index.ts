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

// identidade (dono: AS)
export { Audiencia } from "./identidade/audiencia";
export { Papel } from "./identidade/papel";
export type { NomeDoPapel } from "./identidade/papel";
export { UsuarioId } from "./identidade/usuario-id";
export { Email } from "./identidade/email";
export { SenhaEmTexto } from "./identidade/senha-em-texto";
export type { HashDeSenha } from "./identidade/hash-de-senha";
export { Credencial } from "./identidade/credencial";
export { Sessao } from "./identidade/sessao";
export type { DadosDaSessao, NovaSessao } from "./identidade/sessao";
export { Usuario } from "./identidade/usuario";
export type { DadosDoUsuario } from "./identidade/usuario";
export type { UsuarioRepositorio } from "./identidade/usuario-repositorio";
export { ContadorDeTentativas } from "./identidade/contador-de-tentativas";
export type { RegistroDeTentativas } from "./identidade/registro-de-tentativas";
export type { EmissorDeToken, TokenEmitido } from "./identidade/emissor-de-token";
export type { VerificadorDeSegundoFator } from "./identidade/verificador-de-segundo-fator";
export { PapelInvalidoError } from "./identidade/papel-invalido-error";
export { EmailInvalidoError } from "./identidade/email-invalido-error";
export { SenhaForaDaPoliticaError } from "./identidade/senha-fora-da-politica-error";
export type { MotivoDeSenhaRecusada } from "./identidade/senha-fora-da-politica-error";
export { SessaoInvalidaError } from "./identidade/sessao-invalida-error";
export { SessaoExpiradaError } from "./identidade/sessao-expirada-error";
export { TenantDivergenteError } from "./identidade/tenant-divergente-error";
export { CredenciaisInvalidasError } from "./identidade/credenciais-invalidas-error";
export { ContaBloqueadaPorTentativasError } from "./identidade/conta-bloqueada-por-tentativas-error";
export { SegundoFatorObrigatorioError } from "./identidade/segundo-fator-obrigatorio-error";
export { HashDeSenhaFake } from "./identidade/testes-suporte/hash-de-senha-fake";
export { UsuarioRepositorioEmMemoria } from "./identidade/testes-suporte/usuario-repositorio-em-memoria";
export { VerificadorDeSegundoFatorEmMemoria } from "./identidade/testes-suporte/verificador-de-segundo-fator-em-memoria";

// agenda (dono: BN)
export { DiaCivil } from "./agenda/dia-civil";
export type { DiaDaSemana } from "./agenda/dia-civil";
export { DiaCivilInvalidoError } from "./agenda/dia-civil-invalido-error";
export { FusoHorario } from "./agenda/fuso-horario";
export { FusoHorarioInvalidoError } from "./agenda/fuso-horario-invalido-error";
export { HorarioDeTrabalho } from "./agenda/horario-de-trabalho";
export type { DadosDoHorarioDeTrabalho } from "./agenda/horario-de-trabalho";
export { HorarioDeTrabalhoInvalidoError } from "./agenda/horario-de-trabalho-invalido-error";
export { BloqueioId } from "./agenda/bloqueio-id";
export { Bloqueio } from "./agenda/bloqueio";
export type { DadosDoBloqueio, DadosDeFolga } from "./agenda/bloqueio";
export { HorarioLivre } from "./agenda/horario-livre";
export type { AgendaDoProfissional } from "./agenda/agenda-do-profissional";
export { CalculadoraDeHorariosLivres } from "./agenda/calculadora-de-horarios-livres";
export type { EntradaDoCalculo } from "./agenda/calculadora-de-horarios-livres";
export { HorarioIndisponivelError } from "./agenda/horario-indisponivel-error";
export { PassoDaAgendaInvalidoError } from "./agenda/passo-da-agenda-invalido-error";
export type { HorarioDeTrabalhoRepositorio } from "./agenda/horario-de-trabalho-repositorio";
export type { BloqueioRepositorio } from "./agenda/bloqueio-repositorio";

// agendamento: ciclo de vida e politica (dono: BN)
export { AtorDoAgendamento } from "./agendamento/ator-do-agendamento";
export type { TipoDeAtor } from "./agendamento/ator-do-agendamento";
export { AgendamentoNaoConcluivelError } from "./agendamento/agendamento-nao-concluivel-error";
export { AgendamentoNaoRemarcavelError } from "./agendamento/agendamento-nao-remarcavel-error";
export { PoliticaDeCancelamentoPorAntecedencia } from "./agendamento/politica-de-cancelamento-por-antecedencia";
export { PoliticaDeCancelamentoInvalidaError } from "./agendamento/politica-de-cancelamento-invalida-error";

// catalogo: entidades e erros (dono: BN)
export { Servico } from "./catalogo/servico";
export type { DadosDoServico } from "./catalogo/servico";
export { Profissional } from "./catalogo/profissional";
export type { DadosDoProfissional } from "./catalogo/profissional";
export { ServicoInvalidoError } from "./catalogo/servico-invalido-error";
export { ServicoNaoEncontradoError } from "./catalogo/servico-nao-encontrado-error";
export { ProfissionalInvalidoError } from "./catalogo/profissional-invalido-error";
export { ProfissionalNaoEncontradoError } from "./catalogo/profissional-nao-encontrado-error";
export { ProfissionalNaoExecutaServicoError } from "./catalogo/profissional-nao-executa-servico-error";
export { EstabelecimentoNaoEncontradoError } from "./catalogo/estabelecimento-nao-encontrado-error";
export type {
  EstabelecimentoPublico,
  TemaPublicadoLeitura,
} from "./catalogo/estabelecimento-publico";
export type { EstabelecimentoPublicoRepositorio } from "./catalogo/estabelecimento-publico-repositorio";

// eventos de negocio (dono: BN)
export { AgendamentoCriado } from "./eventos/agendamento-criado";
export type { CanalDeAgendamento, DadosDeAgendamentoCriado } from "./eventos/agendamento-criado";
export { AgendamentoCancelado } from "./eventos/agendamento-cancelado";
export type { DadosDeAgendamentoCancelado } from "./eventos/agendamento-cancelado";
export { AgendamentoRemarcado } from "./eventos/agendamento-remarcado";
export type { DadosDeAgendamentoRemarcado } from "./eventos/agendamento-remarcado";
export { AtendimentoConcluido } from "./eventos/atendimento-concluido";
export type { DadosDeAtendimentoConcluido } from "./eventos/atendimento-concluido";
export { EstabelecimentoCriado } from "./eventos/estabelecimento-criado";
export type { DadosDeEstabelecimentoCriado } from "./eventos/estabelecimento-criado";
export { NOMES_DOS_EVENTOS_DE_NEGOCIO } from "./eventos/catalogo-de-eventos";
export type { EventoDeNegocioDeBn } from "./eventos/catalogo-de-eventos";
export { SolicitanteDeAgendamento } from "./agendamento/solicitante-de-agendamento";
export { AcaoNaoPermitidaError } from "./agendamento/acao-nao-permitida-error";

// fakes em memoria para testes de casos de uso (dono: BN)
export { AgendamentoRepositorioEmMemoria } from "./agendamento/testes-suporte/agendamento-repositorio-em-memoria";
export {
  ServicoRepositorioEmMemoria,
  ProfissionalRepositorioEmMemoria,
  EstabelecimentoRepositorioEmMemoria,
} from "./catalogo/testes-suporte/catalogo-em-memoria";
export {
  HorarioDeTrabalhoRepositorioEmMemoria,
  BloqueioRepositorioEmMemoria,
} from "./agenda/testes-suporte/agenda-em-memoria";
export { PublicadorDeEventosEmMemoria } from "./eventos/testes-suporte/publicador-de-eventos-em-memoria";
