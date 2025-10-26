# The Colosseum

## Workflow battle
```
┌────────────┐
│  PENDING   │  (Battle created)
└─────┬──────┘
      │
      ▼
┌────────────┐
│   ACTIVE   │───► Open bets
└─────┬──────┘
      │
      ├──────────┐
      │          │
      ▼          ▼
┌────────────┐  ┌──────────────┐
│  FINISHED  │  │  CANCELLED   │◄─── (cancelled battle)
└─────┬──────┘  └──────────────┘
      │
      ▼
┌────────────┐
│ VALIDATED  │───► Trigger process reward
└─────┬──────┘
      │
      ▼
┌────────────┐
│  ARCHIVED  │  (Final state)
└────────────┘

```

## Workflow bet

```
 ┌────────────┐
 │  PLACED    │  (user bet and stake points)
 └─────┬──────┘
       │
       ▼
 ┌────────────┐
 │  LOCKED    │  (user can't cancel bet)
 └─────┬──────┘
       │
       ▼
 ┌────────────────┐
 │ WAITING_RESULT │  (battle in progress)
 └─────┬──────────┘
       │
       ├──────────────┬───────────────┐
       │              │               │
       ▼              ▼               ▼
 ┌────────────┐  ┌────────────┐  ┌────────────┐
 │    WON     │  │    LOST    │  │  REFUNDED  │
 └─────┬──────┘  └────────────┘  └────────────┘
       │
       ▼
 ┌────────────┐
 │   PAID     │  (reward sent)
 └────────────┘
```