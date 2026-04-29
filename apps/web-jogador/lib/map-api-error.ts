/** Maps backend domain error codes to Portuguese messages for player actions. */
export function mapPlayerApiError(err: unknown): string {
  if (!(err instanceof Error)) {
    return "Pedido falhou.";
  }
  const code = (err as Error & { code?: string }).code;
  switch (code) {
    case "RegistrationClosedError":
      return "As inscrições estão fechadas para esta partida.";
    case "UserAlreadyRegisteredError":
      return "Já tens uma inscrição ativa nesta partida.";
    case "UserMarkedAbsentError":
      return "Já marcaste que não vais nesta partida.";
    case "MatchNotOpenError":
      return "A partida não está aberta a inscrições.";
    case "RegistrationBlockedByAbsenceError":
      return "Remova primeiro o voto de ausência para se inscrever.";
    case "AbsenceBlockedByRegistrationError":
      return "Desinscreve-te primeiro da partida para marcar que não vais.";
    case "InvalidMatchStateError":
      return "O estado da partida não permite esta ação.";
    case "NoRegistrationSlotsError":
      return "Não há vagas disponíveis.";
    case "MatchNotFoundError":
      return "Partida não encontrada.";
    default:
      return err.message || "Erro desconhecido.";
  }
}
