/**
 * Catálogo de mensagens pt-BR (idioma padrão). Nenhum texto de interface fica em componente.
 * Marcadores `{nome}` são substituídos por parâmetros; os do vocabulário do estabelecimento
 * (`{profissional}`, `{Servico}`, `{agendamento_pl}`...) entram automaticamente. Frases evitam
 * artigos antes do vocabulário porque o gênero muda de um segmento para outro.
 */
export const CATALOGO_PT_BR = {
  "pagina.pularParaOConteudo": "Pular para o conteúdo",
  "marca.logoDe": "Logo de {nome}",

  "inicio.titulo": "Agende em poucos toques",
  "inicio.descricao": "Digite o código de acesso ou abra o link que você recebeu.",
  "inicio.campoCodigo": "Código de acesso",
  "inicio.ajudaCodigo": "Exemplo: studio-aurora",
  "inicio.acaoAbrir": "Abrir",
  "inicio.codigoInvalido": "Esse código não parece válido. Use letras minúsculas, números e hífen.",

  "navegacao.rotulo": "Navegação principal",
  "navegacao.inicio": "Início",
  "navegacao.servicos": "{Servico_pl}",
  "navegacao.profissionais": "{Profissional_pl}",
  "navegacao.agendar": "Agendar",
  "navegacao.meusAgendamentos": "Meus {agendamento_pl}",
  "navegacao.entrar": "Entrar",
  "navegacao.modoProfissional": "Sou {profissional}",

  "vitrine.escolhaServico": "Escolha para agendar",
  "vitrine.verTodos": "Ver todos",
  "vitrine.verProfissionais": "Conhecer {profissional_pl}",
  "vitrine.acaoAgendar": "Agendar {nome}",
  "servicos.titulo": "{Servico_pl}",
  "profissionais.titulo": "{Profissional_pl}",
  "profissionais.nomePadrao": "{Profissional} {numero}",
  "profissionais.acaoAgendar": "Agendar com {nome}",
  "profissionais.vazio": "Sem {profissional_pl} com horários livres nos próximos dias.",

  "agendar.titulo": "Agendar {agendamento}",
  "agendar.secaoServico": "{Servico}",
  "agendar.secaoProfissional": "{Profissional}",
  "agendar.secaoDia": "Dia",
  "agendar.secaoHorario": "Horário",
  "agendar.qualquerProfissional": "Qualquer {profissional}",
  "agendar.semHorarios": "Sem horários livres neste dia. Escolha outro dia.",
  "agendar.semNenhumDia": "Sem horários livres nos próximos dias.",
  "agendar.resumo": "{servico}, {dia} às {hora} ({preco})",
  "agendar.confirmar": "Confirmar {agendamento}",
  "agendar.confirmando": "Confirmando...",
  "agendar.entrarParaConfirmar": "Entrar para confirmar",
  "agendar.confirmadoTitulo": "Tudo certo!",
  "agendar.verMeusAgendamentos": "Ver meus {agendamento_pl}",
  "agendar.selecionado": "Selecionado:",
  "agendar.acaoEscolher": "Escolher {nome}",

  "entrar.titulo": "Entrar",
  "entrar.descricaoTelefone": "Informe seu celular para receber um código de acesso.",
  "entrar.campoTelefone": "Celular com DDD",
  "entrar.acaoEnviarCodigo": "Receber código",
  "entrar.descricaoCodigo": "Digite o código de 6 dígitos enviado para {telefone}.",
  "entrar.campoCodigo": "Código de 6 dígitos",
  "entrar.acaoConfirmarCodigo": "Entrar",
  "entrar.acaoTrocarTelefone": "Usar outro celular",
  "entrar.avisoSimulado": "Ambiente de desenvolvimento: o código de teste é {codigo}.",
  "entrar.sair": "Sair",

  "meus.titulo": "Meus {agendamento_pl}",
  "meus.vazio": "Você ainda não tem {agendamento_pl}.",
  "meus.precisaEntrar": "Entre para ver seus {agendamento_pl}.",
  "meus.acaoCancelar": "Cancelar",
  "meus.acaoCancelarDe": "Cancelar {nome} em {dia} às {hora}",
  "meus.cancelado": "Cancelamento realizado.",
  "meus.statusConfirmado": "Confirmado",
  "meus.statusCancelado": "Cancelado",
  "meus.statusConcluido": "Concluído",

  "profissional.titulo": "Modo {profissional}",
  "profissional.descricaoEntrar": "Entre com seu e-mail e senha.",
  "profissional.campoEmail": "E-mail",
  "profissional.campoSenha": "Senha",
  "profissional.acaoEntrar": "Entrar",
  "profissional.agendaDoDia": "Agenda de hoje",
  "profissional.agendaVazia": "Nenhum atendimento hoje.",
  "profissional.acaoConcluir": "Concluir atendimento",
  "profissional.acaoConcluirDe": "Concluir {nome} das {hora}",
  "profissional.avisoSimulado": "Agenda de demonstração: a API ainda não expõe a agenda do dia.",

  "duracao.minutos": "{minutos} min",
  "duracao.horas": "{horas} h",
  "duracao.horasEMinutos": "{horas} h {minutos} min",

  "estado.carregando": "Carregando...",
  "estado.tentarDeNovo": "Tentar de novo",
  "estado.erroTitulo": "Algo deu errado",
  "estado.naoEncontradoTitulo": "Não encontramos esse endereço",
  "estado.naoEncontradoTexto": "Confira o código ou o link e tente novamente.",
  "estado.voltarAoInicio": "Voltar ao início",

  "pwa.adicionarATelaInicial": "Adicionar à tela inicial",

  "erro.generico": "Não foi possível concluir. Tente novamente.",
  "erro.rede_indisponivel": "Sem conexão com o servidor. Verifique a internet e tente novamente.",
  "erro.sessao_invalida": "Sua sessão expirou. Entre novamente.",
  "erro.credenciais_invalidas": "E-mail ou senha incorretos.",
  "erro.conta_bloqueada_por_tentativas": "Muitas tentativas. Aguarde alguns minutos.",
  "erro.horario_indisponivel": "Esse horário acabou de ser ocupado. Escolha outro.",
  "erro.agendamento_no_passado": "Esse horário já passou. Escolha outro.",
  "erro.fora_do_prazo_de_cancelamento": "O prazo para cancelar já passou.",
  "erro.agendamento_nao_cancelavel": "Não é mais possível cancelar.",
  "erro.agendamento_nao_encontrado": "Não encontramos esse registro.",
  "erro.servico_nao_encontrado": "{Servico} não encontrado.",
  "erro.profissional_nao_encontrado": "{Profissional} não encontrado.",
  "erro.profissional_nao_executa_servico":
    "Essa combinação de {profissional} e {servico} não é válida.",
  "erro.muitas_requisicoes": "Muitas tentativas. Aguarde um instante.",
  "erro.telefone_invalido": "Informe um celular com DDD.",
  "erro.codigo_invalido": "Código incorreto. Confira e tente de novo.",
} as const;

export type ChaveDeMensagem = keyof typeof CATALOGO_PT_BR;

/** Vocabulário usado quando o estabelecimento não define o próprio. */
export const VOCABULARIO_PADRAO = {
  profissional: { singular: "profissional", plural: "profissionais" },
  servico: { singular: "serviço", plural: "serviços" },
  agendamento: { singular: "agendamento", plural: "agendamentos" },
  cliente: { singular: "cliente", plural: "clientes" },
  estabelecimento: { singular: "estabelecimento", plural: "estabelecimentos" },
} as const;
