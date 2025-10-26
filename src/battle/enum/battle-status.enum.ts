export enum BattleStatusEnum {
  PENDING = 'pending', // programmé, pari pas encore ouvert
  ACTIVE = 'active', // paris ouverts puis combat en cours
  FINISHED = 'finished', // combat terminé
  VALIDATED = 'validated', // résultat officiel confirmé
  ARCHIVED = 'archived', // historique figé
  CANCELLED = 'cancelled', // annulé => remboursement
}
