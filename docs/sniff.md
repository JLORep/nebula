# /sniff - TrenchKings Standards Enforcement Scanner

**Version**: v11.0.0 (March 6, 2026) | **42 Golden Rules** | **30 Detectors** | **2772+ GOTCHAs**
**Script**: `python -m sniff.main` | **Aliases**: `/scan`, `/compliance`, `/standards`

---

## QUICK START

```bash
# Daily workflow
/sniff -Q                               # Quick scan (2-5s, critical violations only)
/sniff -yourwork                        # Deep scan YOUR session-modified files (1min, ALL detectors)

# Category scans
/sniff --electron                       # Electron/Officers Club (F1-F5)
/sniff --whale                          # Whale routing (G1-G5)
/sniff --perps                          # Perp venue (H1-H5)
/sniff --trading                        # Combined trading (G1-I4, 14 rules)
/sniff --type-safety                    # Type safety (B1-B5)
/sniff -sec                             # Security (D1-D4)
/sniff -redis                           # Redis patterns (C1-C5)

# Full audit
/sniff --standards                      # All 42 rules (45-90s)
/sniff --officers-club                  # Full Officers Club audit
```

---

## THE 42 GOLDEN RULES

### Category A: Architecture (5 Rules)

| Rule | Name | GOTCHA | Flag | Severity |
|------|------|--------|------|----------|
| A1 | Service Registry ONLY | #7 | `-help` | CRITICAL |
| A2 | Blueprint Registry | #8 | `-blueprint` | HIGH |
| A3 | 5-Stage Initialization | #9 | `-5stage` | HIGH |
| A4 | SSE Only (No Polling) | #14 | `--frontend` | HIGH |
| A5 | Provider Router Ownership | #556, #630 | `-fall` | HIGH |

### Category B: Type Safety (5 Rules)

| Rule | Name | GOTCHA | Flag | Severity |
|------|------|--------|------|----------|
| B1 | Format Specifier Type Safety | #622, #636 | `--type-safety` | CRITICAL |
| B2 | Sub-Dict isinstance() Guards | #634 | `--type-safety` | CRITICAL |
| B3 | Dict-to-Float Validation | #559 | `--type-safety` | CRITICAL |
| B4 | isinstance() Before Iteration | #537, #541 | `--type-safety` | HIGH |
| B5 | Migration Format Support | #574 | `--type-safety` | HIGH |

### Category C: Redis & Data (5 Rules)

| Rule | Name | GOTCHA | Flag | Severity |
|------|------|--------|------|----------|
| C1 | ONE BIG SAVE Pattern | #631, #632, #635 | `-redis` | CRITICAL |
| C2 | Atomic Redis Updates | #612, #614 | `-redis` | CRITICAL |
| C3 | json_get Not hgetall | #633 | `-redis` | CRITICAL |
| C4 | Never Cache Errors | #538 | `-redis` | HIGH |
| C5 | Auto-Deserialization Check | #577, #408 | `-redis` | HIGH |

### Category D: Safety & Security (4 Rules)

| Rule | Name | GOTCHA | Flag | Severity |
|------|------|--------|------|----------|
| D1 | HARD REJECT Safety Gates | #618 | `--standards` | CRITICAL |
| D2 | Parameterized SQL | #15, #16 | `-sql` | CRITICAL |
| D3 | Telegram Session Safety | #110 | `-tg` | CRITICAL |
| D4 | Windows Path Safety | Path bugs | `-win` | HIGH |

### Category E: Code Quality (4 Rules)

| Rule | Name | GOTCHA | Flag | Severity |
|------|------|--------|------|----------|
| E1 | Unified Logger V2.0 | #544 | `-logging` | HIGH |
| E2 | API Field Name Verification | #620-627 | `--standards` | HIGH |
| E3 | Fallback Chain Validation | #524, #528 | `-fall` | HIGH |
| E4 | Logging Philosophy | - | `-logging` | MEDIUM |

### Category F: Electron/Officers Club (5 Rules)

| Rule | Name | GOTCHA | Flag | Severity |
|------|------|--------|------|----------|
| F1 | No Circular Dependencies | #1643, #1644 | `--circular` | CRITICAL |
| F2 | IPC Parameter Matching | #1706 | `--ipc` | CRITICAL |
| F3 | Store Rehydration Sync | #1671 | `--electron` | CRITICAL |
| F4 | Position Monitor Sync | #1668, #1670 | `--electron` | HIGH |
| F5 | WebSocket Subscription Queue | #1666 | `--electron` | HIGH |

### Category G: Trading & Signal Routing (5 Rules)

| Rule | Name | GOTCHA | Flag | Severity |
|------|------|--------|------|----------|
| G1 | ONE RIVER — TradeRiver owns ALL positions | #2001 | `--whale` | CRITICAL |
| G2 | PumpPortal BUY only, Jupiter for SELL | #2740 | `--whale` | CRITICAL |
| G3 | KOLSCAN mainnet HARD BLOCK | #2759 | `--whale` | CRITICAL |
| G4 | Convoy minConvoySize >= 5 HARD FLOOR | #2760 | `--whale` | CRITICAL |
| G5 | THREE-PILLAR whale sync (JSON+Helius+Redis) | #2738 | `--whale` | CRITICAL |

### Category H: Perps & Multi-Venue (5 Rules)

| Rule | Name | GOTCHA | Flag | Severity |
|------|------|--------|------|----------|
| H1 | TARiver is THE ONE TA | #2719 | `--perps` | CRITICAL |
| H2 | Drift SDK lazy import only | rpc-websockets | `--perps` | HIGH |
| H3 | Perp venue routing (signal.perpVenue) | multi-venue | `--perps` | HIGH |
| H4 | 1x leverage ONLY — no liquidation | perps | `--perps` | CRITICAL |
| H5 | Campaign deploy includes ALL perp fields | #2763, #2771 | `--perps` | CRITICAL |

### Category I: Safety & Exit Gates (4 Rules)

| Rule | Name | GOTCHA | Flag | Severity |
|------|------|--------|------|----------|
| I1 | Freeze check = HARD BLOCK | #2758 | `--trading` | CRITICAL |
| I2 | whale:{address} profile required | #2772 | `--whale` | CRITICAL |
| I3 | PATTERN_EXIT P&L gate (+2.5%/-1.5%) | #2742 | `--trading` | HIGH |
| I4 | ARCHETYPE_DEFAULTS_VERSION bump | #2696 | `--trading` | HIGH |

---

## ARCHITECTURE

```
sniff/
├── main.py                   # Entry point (~3900 lines) - mode dispatch
├── cli/
│   ├── argument_parser.py    # Primary CLI (51 switches, consolidated from 171)
│   ├── argument_parser_v2.py # Rationalized parser
│   ├── command.py            # UltraSniffCommand class
│   ├── output_formatter.py   # Output formatting
│   └── progress.py           # Progress indicators
├── config/
│   └── severity_rules.py     # 5-level severity classification
├── core/
│   ├── scanner_engine.py     # UltraSniffConfig (150+ options)
│   ├── ultrasniff_orchestrator.py  # Master orchestrator + violation aggregation
│   ├── pattern_engine.py     # Pattern matching
│   ├── analysis_engine.py    # Analysis pipeline
│   ├── autofixer.py          # Auto-fix generation
│   ├── cache_system.py       # UltraSniffCache
│   └── standards_enforcement_engine.py
├── detectors/                # 30 specialized detectors
│   ├── base_detector.py      # Universal base (13 methods, 99.3% FP reduction)
│   ├── electron_detector.py  # F1-F5 (v10.0.4)
│   ├── whale_routing_detector.py   # G1-G5 (v11.0.0)
│   ├── perp_venue_detector.py      # H1-H5 (v11.0.0)
│   ├── trading_infrastructure_detector.py  # I1-I4 (v11.0.0)
│   └── ... (26 more)
├── database/                 # 5 SQLite databases
│   ├── core_database.py      # 6-tier storage (SQLite primary)
│   ├── analytics_manager.py  # Trend/health tracking
│   └── models.py             # ViolationRecord, TaskRecord
├── enhancements/             # 9 enhancement tools
├── integrations/             # 7 integration systems
│   ├── auto_fix_engine.py    # AI-generated code fixes
│   ├── git_hooks_integration.py  # Pre-commit hooks
│   └── realtime_monitor.py   # Continuous monitoring
├── metrics/
│   └── compliance_metrics.py # Redis-powered dashboards
└── utilities/                # 17 utility modules
    ├── meta_analysis_engine.py     # Self-analyzing FP/bug detection (35KB)
    ├── multi_claude_coordinator.py # Cross-session coordination
    └── discovery_engine.py         # Semantic code search
```

### How Scanning Works

```
CLI args → argument_parser.py → UltraSniffConfig
    → main.py dispatches to scan mode
    → Detectors scan files (parallel workers, max 8)
    → Each detector yields typed violations (dataclass)
    → ViolationAggregator deduplicates + correlates
    → Severity classification (5 levels, context-aware)
    → Output formatting (console/JSON/markdown)
    → Database logging (SQLite, scan history, analytics)
```

### Violation Flow

```
Detector._detect_*()
    → WhaleRoutingViolation / PerpVenueViolation / etc. (dataclass)
    → .to_dict() → unified dict format
    → ViolationAggregator._identify_detector_and_category()
    → Severity rules (test files downgraded, critical infra upgraded)
    → Output (console with severity icons, optional JSON export)
```

---

## DETECTORS

### 30 Specialized Detectors

| Flag | Detector | Rules | Scans |
|------|----------|-------|-------|
| `--electron` | Electron V10.0.4 | F1-F5 | officers-club-app/src/ (TS) |
| `--whale` | Whale Routing v11.0.0 | G1-G5 | officers-club-app/src/ (TS) + blueprints/ (Python) |
| `--perps` | Perp Venue v11.0.0 | H1-H5 | officers-club-app/src/ (TS) |
| `--trading` | Trading Infra v11.0.0 | I1-I4 | officers-club-app/src/ (TS) |
| `--type-safety` | Type Safety V3.0.2 | B1-B5 | Python files |
| `-redis` | Redis Patterns V2.0 | C1-C5 | Python files |
| `-sql` | SQL Quality | D2 | Python files |
| `-tg` | Telegram Safety | D3 | Python files |
| `-win` | Windows Safety | D4 | All files |
| `-help` | Helper/Service Registry | A1 | Python files |
| `-blueprint` | Blueprint Registry | A2 | Python files |
| `-5stage` | 5-Stage Initialization | A3 | Python files |
| `-fall` | Fallback Chain | A5, E3 | Python files |
| `-logging` | Unified Logger + E4 | E1, E4 | Python files |
| `-dup` | Duplicate Code | #1713 | All files (AST-based) |
| `-orph` | Orphaned Code | #1713 | All files (cross-ref) |
| `-hygiene` | Code Hygiene | - | All files |
| `-comp` | Enterprise Compliance | - | All files |
| `-analytics` | Violation Analytics | - | Database |
| `-baseline` | Baseline Compliance | - | Meta-scan |
| `-sec` | Security (all) | D1-D4 | All files |
| `--frontend` | TypeScript/React | A4 | TypeScript files |
| `--ipc` | IPC Parameter Matching | F2 | main.ts + preload.ts |
| `--circular` | Circular Dependencies | F1 | officers-club-app/src/ |
| `--standards` | Full Standards Audit | All 42 | Everything |

### v11.0.0 Detector Details

#### Whale Routing Detector (Category G)

**File**: `sniff/detectors/whale_routing_detector.py`
**Scans**: `officers-club-app/src/` (TypeScript) + `blueprints/` (Python)
**Entry point**: `run_whale_routing_scan(target_dir)`

5 detection methods:

| Method | Rule | What It Catches |
|--------|------|-----------------|
| `_detect_convoy_hard_floor()` | G4 | `minConvoySize` assignments < 5 |
| `_detect_kolscan_mainnet_leak()` | G3 | KOLSCAN signals without mainnet HARD BLOCK |
| `_detect_pumpportal_sell()` | G2 | PumpPortal used for SELL operations |
| `_detect_missing_whale_profile()` | I2 | Signal routing without `whale:{address}` lookup |
| `_detect_three_pillar_sync()` | G5 | Whale ops touching < 3 systems |

**Patterns**:

```typescript
// G2: PumpPortal SELL (CRITICAL) — silently no-ops on completed curves
// BAD
await pumpPortal.sell({ pool: 'pump', mint, amount })

// GOOD — Jupiter for ALL sells
await jupiter.sell({ mint, amount, slippage: 'emergency' })
```

```typescript
// G4: Convoy Hard Floor (CRITICAL) — 28.1% WR at 2-4 whales
// BAD
minConvoySize: 2

// GOOD — HARD FLOOR enforced
Math.max(campaign.minConvoySize || 5, 5)
```

```typescript
// G5: Three-Pillar Sync (CRITICAL) — all 3 must update together
// BAD — only updates JSON, forgets Helius + Redis
await fs.writeFile('proven_wallets.json', updated)

// GOOD — all three pillars
await fs.writeFile('proven_wallets.json', updated)      // 1. JSON config
await helius.updateWebhook(webhookId, addresses)         // 2. Helius webhook
await redis.json_set(`whale:${address}`, '$', profile)   // 3. Redis profile
```

#### Perp Venue Detector (Category H)

**File**: `sniff/detectors/perp_venue_detector.py`
**Scans**: `officers-club-app/src/` (TypeScript only)
**Entry point**: `run_perp_venue_scan(target_dir)`

5 detection methods:

| Method | Rule | What It Catches |
|--------|------|-----------------|
| `_detect_ta_outside_tariver()` | H1 | TA/candle/indicator logic outside ta-river.ts |
| `_detect_drift_eager_import()` | H2 | Non-lazy Drift SDK imports |
| `_detect_leverage_above_1x()` | H4 | Leverage settings > 1 |
| `_detect_missing_perp_fields_deploy()` | H5 | Campaign deploy missing perp fields |
| `_detect_hardcoded_perp_size()` | H5 | Hardcoded position sizes in trade-river.ts |

**TA_ALLOWED_FILES**: `ta-river.ts`, `ta-engine.ts`, `market-data-service.ts`
**REQUIRED_PERP_FIELDS**: `perpVenue`, `perpProject`, `perpMarketSymbols`, `perpDefaultSizeUsdc`, `isPerp`

**Patterns**:

```typescript
// H1: TA Outside TARiver (CRITICAL) — TARiver is THE ONE TA
// BAD — TA in component
const rsi = calculateRSI(candles)
const macd = calculateMACD(prices)

// GOOD — TARiver hooks
const state = useTAMarketState('SOL-PERP')
const regime = useMarketRegime('SOL-PERP')
```

```typescript
// H2: Drift Eager Import (HIGH) — crashes rpc-websockets on startup
// BAD
import { DriftClient } from '@drift-labs/sdk'

// GOOD — lazy import
const { getDriftClient } = await import('./drift-client')

// OK — type-only imports are fine
import type { PerpMarketAccount } from '@drift-labs/sdk'
```

```typescript
// H5: Missing Perp Fields (CRITICAL) — GOTCHA #2763/#2771
// BAD — campaign deploy drops perp fields
const campaign = { name: s.name, isPerp: s.isPerp }

// GOOD — ALL perp fields mapped
const campaign = {
  name: s.name,
  isPerp: s.isPerp,
  perpVenue: s.perpVenue,           // 'drift' | 'hyperliquid'
  perpProject: s.perpProject,       // 'majors' | 'alt-l1' | etc.
  perpMarketSymbols: s.perpMarketSymbols,
  perpDefaultSizeUsdc: s.perpDefaultSizeUsdc,
}
```

#### Trading Infrastructure Detector (Category I)

**File**: `sniff/detectors/trading_infrastructure_detector.py`
**Scans**: `officers-club-app/src/` (TypeScript)
**Entry point**: `run_trading_infra_scan(target_dir)`

5 detection methods:

| Method | Rule | What It Catches |
|--------|------|-----------------|
| `_detect_cottage_industry()` | G1 | Direct IPC trade calls bypassing TradeRiver |
| `_detect_direct_localstorage()` | F3 | Raw localStorage instead of configRiver |
| `_detect_setinterval_polling()` | A4 | setInterval polling instead of SSE |
| `_detect_freeze_check_warn()` | I1 | Freeze check as warning instead of HARD BLOCK |
| `_detect_pattern_exit_no_pnl_gate()` | I3 | PATTERN_EXIT without P&L thresholds |

**IPC_TRADE_ALLOWLIST**: `main.ts`, `preload.ts` (allowed to call IPC directly)
**LOCALSTORAGE_ALLOWLIST**: `config-river.ts`, `store.ts`

**Patterns**:

```typescript
// G1: Cottage Industry (CRITICAL) — TradeRiver owns ALL positions
// BAD — bypassing TradeRiver
await window.electronAPI.executeTrade({ mint, amount })
ipcRenderer.invoke('execute-buy', params)

// GOOD
tradeRiver.executeManualBuy({ mint, amount, slippage })
tradeRiver.executeManualSell(mint, 'MANUAL')
```

```typescript
// I1: Freeze Check (CRITICAL) — must be HARD BLOCK, not warning
// BAD — warn and continue
if (isFrozen) { log.warn('Token frozen'); /* continues execution */ }

// GOOD — HARD BLOCK
if (isFrozen) { log.error('HARD BLOCK: frozen'); return; }
```

```typescript
// I3: PATTERN_EXIT P&L Gate (HIGH) — prevents chop at +-0.1%
// BAD — exits at any P&L
if (pattern === 'PATTERN_EXIT') return exitPosition()

// GOOD — P&L gate: +2.5% protect gains, -1.5% cut early, between: HOLD
if (pattern === 'PATTERN_EXIT') {
  if (pnlPct >= 2.5 || pnlPct <= -1.5) return exitPosition()
  return // HOLD — let TP/SL work
}
```

---

## CLI REFERENCE

### 10 Gold Modes

| Flag | Mode | Time | Description |
|------|------|------|-------------|
| `--mode everything` | Default | 45-90s | All features optimized |
| `--mode emergency` | Emergency | 2-5s | Critical issues only |
| `--mode discover` | Discovery | - | Semantic code search |
| `--mode guardian` | Guardian | - | System protection mode |
| `--mode purge` | Purge | - | Dead code removal |
| `--mode compliance` | Compliance | 45-90s | Standards enforcement |
| `--mode speed` | Speed | - | Performance optimization |
| `--mode ship` | Ship | - | Deployment readiness |
| `--mode preset` | Preset | - | Custom configurations |
| `--mode frontend` | Frontend | 10-20s | TypeScript/React/ESLint |

### 9 Power User Shortcuts

| Flag | Description | Time |
|------|-------------|------|
| `-Q` | Quick mode (incremental + parallel + cache) | 2-5s |
| `-F` | Fast mode (parallel + lazy) | 5-15s |
| `-D` | Deep analysis mode | 60-120s |
| `-f` | Full comprehensive scan | 45-90s |
| `-x` | Security-focused scanning | 10-20s |
| `-T` | Strict compliance mode | 45-90s |
| `-S` | Silent mode — minimal output | varies |
| `-yourwork` | Deep scan session-modified files only | ~60s |
| `-lint` | Pylint on whole backend | 30-60s |

### Category Scan Flags

| Flag | Category | Rules |
|------|----------|-------|
| `--architecture` / `-help -blueprint -5stage -fall` | A | A1-A5 |
| `--type-safety` | B | B1-B5 |
| `-redis` | C | C1-C5 |
| `-sec` / `-sql -tg -win` | D | D1-D4 |
| `-logging -fall` | E | E1-E4 |
| `--electron` / `--officers-club` | F | F1-F5 |
| `--whale` | G | G1-G5 |
| `--perps` | H | H1-H5 |
| `--trading` | G+H+I | G1-I4 (14 rules) |
| `--standards` | All | A1-I4 (42 rules) |

### Import Analysis

| Flag | Description |
|------|-------------|
| `-import` | Comprehensive import analysis |
| `-deps` | Requirements validation |
| `-circular` | Circular import detection |
| `-service-registry` | Service registry compliance |
| `-import-health` | Complete import health audit |

### Output & Export

| Flag | Description |
|------|-------------|
| `--json` | JSON output |
| `--json-only` | JSON only (no console) |
| `--summary` | Summary output |
| `--export-summary FILE` | Export to file |
| `--claude-mode` | AI-optimized output |
| `--verbose` / `--quiet` / `--detailed` | Verbosity |
| `--trending` | Show trends |
| `--report` | Full report |

### Targeting

| Flag | Description |
|------|-------------|
| `--file PATH` | Single file scan |
| `--priority LEVEL` | Filter by severity (critical/high/medium/low) |
| `--autofix` | Auto-generate fixes |
| `--summary-only` | Summary without details |
| `target` | Positional target directory |

### Database & Analytics

| Flag | Description |
|------|-------------|
| `-db` / `--filter TYPE` | Query cached violations |
| `--trends [DAYS]` | Violation trends |
| `--health-score` | Compliance health score (0-100) |
| `--team-dashboard` | Team leaderboard |
| `--fp-stats` | False positive statistics |
| `--analytics-export FILE` | Export analytics |
| `--clear-cache` | Clear scan cache |
| `--refresh-db` | Refresh database |

### Meta-Analysis

| Flag | Description |
|------|-------------|
| `--meta` | Run meta-analysis (FP detection, bug tracking) |
| `--meta-report FILE` | Export meta-analysis report |
| `--suggest TEXT` | Submit improvement suggestion |
| `--show-fp-patterns` | Show known false positive patterns |
| `--show-bugs` | Show detected scanner bugs |
| `--show-improvements` | Show improvement suggestions |

### Discovery Mode (Grep)

| Flag | Description |
|------|-------------|
| `--pattern REGEX` | Search pattern |
| `--case-insensitive` | Case insensitive |
| `--context N` | Context lines |
| `--glob PATTERN` | File glob filter |
| `--multiline` | Multiline matching |

### Git Integration

| Flag | Description |
|------|-------------|
| `--install-hooks` | Install pre-commit hooks |
| `--uninstall-hooks` | Remove hooks |
| `--git-verify` | Verify git integration |

### Multi-Claude

| Flag | Description |
|------|-------------|
| `--team-status` | Show all Claude session tasks |
| `--claim N` | Claim N violations to fix |

---

## SCAN MODES IN DETAIL

### Quick Scan (-Q)

```bash
/sniff -Q
```

Fastest possible scan. Enables incremental scanning (only changed files), parallel workers, and result caching. Returns CRITICAL violations only. Use for daily pre-commit checks.

### Standards Compliance (--standards)

```bash
/sniff --standards              # Full 42-rule audit
/compliance                     # Alias
```

Runs ALL 42 Golden Rules across the entire codebase. The most comprehensive scan. Use before PRs and deployments.

### Electron Scan (--electron)

```bash
/sniff --electron               # Rules F1-F5 (10-20s)
/sniff --officers-club          # Comprehensive OC audit
```

Scans `officers-club-app/src/` for Electron-specific patterns: circular dependencies, IPC parameter mismatches, store rehydration, position monitor sync, WebSocket subscription queuing.

### Whale Routing (--whale)

```bash
/sniff --whale                  # Rules G1-G5 (5-10s)
/sniff --whale officers-club-app/   # Targeted
```

Scans TypeScript + Python for: convoy hard floor violations, KOLSCAN mainnet leaks, PumpPortal sell attempts, missing whale profile lookups, incomplete three-pillar sync.

### Perp Venue (--perps)

```bash
/sniff --perps                  # Rules H1-H5 (5-10s)
/sniff --perps officers-club-app/   # Targeted
```

Scans TypeScript for: TA logic outside TARiver, eager Drift SDK imports, leverage > 1x, missing perp fields in campaign deploy, hardcoded position sizes.

### Combined Trading (--trading)

```bash
/sniff --trading                # Rules G1-I4 (10-15s)
```

Runs ALL three trading detectors (whale routing + perp venue + trading infrastructure). Results grouped by category. Use after any trading system changes.

### Your Work (-yourwork)

```bash
/sniff -yourwork                # ~60s, ALL detectors on YOUR files
```

Deep scans only files modified in the current session. All detectors run (not just critical). Use before committing to catch everything in your changes.

---

## WORKFLOW CHEATSHEET

### Daily Development

```bash
/sniff -Q                       # Quick pre-commit (2s)
```

### Before Pull Request

```bash
/sniff --standards              # Full compliance
/sniff --trading                # Trading system check
/sniff --electron               # Officers Club patterns
```

### Before Officers Club Release

```bash
/sniff --officers-club          # Full OC audit
/sniff --circular               # Circular deps
/sniff --ipc                    # IPC signatures
/sniff --trading                # Trading rules
```

### After Whale Bucket Changes

```bash
/sniff --whale                  # Convoy, KOLSCAN, PumpPortal, three-pillar
```

### After Perp / TARiver Changes

```bash
/sniff --perps                  # TA boundaries, Drift imports, leverage, perp fields
```

### After Trading System Changes

```bash
/sniff --trading                # All 14 trading rules (G+H+I)
```

### After Officers Club Crash

```bash
# "Cannot access 'X' before initialization"
/sniff --circular

# IPC timeout or wrong data
/sniff --ipc

# Positions not updating
/sniff --electron --priority high
```

### After Pipeline Crash

```bash
# "Unknown format code 'f' for object of type 'str'"
/sniff --type-safety --priority critical
```

### After Redis Errors

```bash
# "WRONGTYPE" or "new objects must be created at the root"
/sniff -redis --priority critical
```

---

## GOTCHA COVERAGE

| GOTCHA Range | Category | Flag |
|--------------|----------|------|
| #7-9 | Architecture (A1-A3) | `-help`, `-blueprint`, `-5stage` |
| #14 | SSE/Polling (A4) | `--frontend`, `--trading` |
| #15-16 | SQL Injection (D2) | `-sql` |
| #110 | Telegram Safety (D3) | `-tg` |
| #537-541 | Iteration Safety (B4) | `--type-safety` |
| #559-636 | Type Safety + Redis (B1-C5) | `--type-safety`, `-redis` |
| #1496-1497 | React Hooks | `--electron` |
| #1643-1644 | Circular Deps (F1) | `--circular` |
| #1648-1706 | IPC + Position Sync (F2-F5) | `--electron`, `--ipc` |
| #1713 | Code Deduplication | `-dup`, `-orph` |
| #2001 | ONE RIVER (G1) | `--whale`, `--trading` |
| #2696 | ARCHETYPE_DEFAULTS_VERSION (I4) | `--trading` |
| #2719 | TARiver Only (H1) | `--perps` |
| #2733 | Hardcoded Perp Size (H5) | `--perps` |
| #2738 | Three-Pillar Sync (G5) | `--whale` |
| #2740 | PumpPortal Sell (G2) | `--whale` |
| #2742 | PATTERN_EXIT Gate (I3) | `--trading` |
| #2758 | Freeze Check (I1) | `--trading` |
| #2759 | KOLSCAN Block (G3) | `--whale` |
| #2760 | Convoy Floor (G4) | `--whale` |
| #2763, #2771 | Perp Deploy (H5) | `--perps` |
| #2772 | Whale Profile (I2) | `--whale` |

---

## OFFICERS CLUB FILE REFERENCE

Files the detectors monitor:

| File | Rules Checked |
|------|---------------|
| `src/main/main.ts` | F2, F4, G1, G2 (IPC handlers, trade execution, PumpPortal) |
| `src/main/preload.ts` | F2 (IPC signatures, parameter order) |
| `src/renderer/lib/trade-river.ts` | G1, G3, G4, I1, I3 (ONE RIVER, KOLSCAN block, convoy, exits) |
| `src/renderer/lib/ta-river.ts` | H1 (TARiver boundaries, PATTERN_EXIT gates) |
| `src/renderer/lib/config-river.ts` | F3 (config persistence, localStorage ownership) |
| `src/renderer/lib/price-river.ts` | F4 (price updates, TruthAnchor) |
| `src/renderer/lib/campaign-river.ts` | H5 (campaign deploy, perp fields) |
| `src/renderer/App.tsx` | G3, I2 (signal routing, rehydration sync) |
| `src/renderer/components/overlord/` | H5 (campaign deploy panels) |
| `blueprints/elite_webhook_bp.py` | G5 (whale routing, three-pillar sync) |

---

## DATABASE & CACHING

### 6-Tier Storage Architecture

| Tier | Backend | Status |
|------|---------|--------|
| 1 | Memory cache (1000 items, 5min TTL) | Active |
| 2 | Cloudflare KV | Disabled |
| 3 | Redis | Disabled |
| 4 | Azure SQL | Disabled |
| **5** | **SQLite (PRIMARY)** | **Active** |
| 6 | Blob storage | Disabled |

### Databases

| Database | Purpose |
|----------|---------|
| `sniff_data.db` | Core violations + tasks + scan history |
| `scanner_analytics.db` | Trends + health scores |
| `scanner_issues.db` | Issue tracking |
| `violations.db` | Violation history |
| `ultrasniff.db` | Scan results |

### Instant Database Queries (-db)

```bash
/sniff -db                      # Top violations from cache (0.1s!)
/sniff -db --filter critical    # Critical only
/sniff --trends 30              # 30-day violation trends
/sniff --health-score           # Compliance score (0-100)
```

The `-db` flag queries cached results instead of re-scanning. Results in 0.1s instead of 45-90s.

---

## SEVERITY SYSTEM

### 5 Levels

| Level | Icon | Action | Examples |
|-------|------|--------|----------|
| CRITICAL | `[!!]` | Fix immediately | SQL injection, leverage > 1x, PumpPortal sell |
| HIGH | `[!]` | Fix soon | Missing type guards, eager imports, duplicate code |
| MEDIUM | `[~]` | Fix when convenient | Windows safety, hygiene issues |
| LOW | `[.]` | Optional | Missing docstrings, whitespace |
| IGNORE | - | Suppressed | False positives, acceptable patterns |

### Context-Aware Adjustments

- **Test files**: Downgraded 2 levels
- **Archived files**: Downgraded 2-3 levels
- **Critical infrastructure** (trade-river.ts, main.ts): Upgraded 1 level

---

## PERFORMANCE

| Scan Type | Time | Coverage |
|-----------|------|----------|
| Quick (-Q) | 2-5s | Critical only, cached |
| Your Work (-yourwork) | ~60s | All detectors, your files only |
| Electron | 10-20s | F1-F5 |
| Whale Routing | 5-10s | G1-G5 |
| Perp Venue | 5-10s | H1-H5 |
| Trading Combined | 10-15s | G1-I4 (14 rules) |
| Type Safety | 5-10s | B1-B5 |
| Security | 10-20s | D1-D4 |
| Standards (full) | 45-90s | All 42 rules |
| Full + Analytics | 60-120s | Everything |
| Database Query (-db) | 0.1s | Cached results |

---

## EXAMPLES

```bash
# Daily
/sniff -Q                               # Quick pre-commit
/sniff -yourwork                        # Your changes, all detectors

# Category scans
/sniff --whale                          # Whale routing
/sniff --perps                          # Perp venue
/sniff --trading                        # G+H+I combined
/sniff --electron                       # Electron patterns
/sniff --type-safety                    # Type safety

# Targeted
/sniff --file src/renderer/lib/trade-river.ts
/sniff --whale officers-club-app/
/sniff --electron --priority critical
/sniff --ipc --file src/main/preload.ts
/sniff --circular officers-club-app/

# Analytics
/sniff -db                              # Instant cached results
/sniff --health-score                   # Compliance score
/sniff --trends 30                      # 30-day trends
/sniff --team-dashboard                 # Team leaderboard

# Advanced
/sniff --meta                           # FP detection + bug tracking
/sniff --mode discover --pattern "executeBuy"  # Semantic search
/sniff --autofix --priority critical    # Auto-generate fixes
/sniff -lint                            # Pylint on backend
```

---

## VERSION HISTORY

### V11.0.0 (Mar 6, 2026) — TRADING SYSTEMS EDITION
- **14 new Golden Rules**: Categories G (Trading), H (Perps), I (Safety) — 28 → 42
- **3 new detectors**: WhaleRoutingDetector, PerpVenueDetector, TradingInfrastructureDetector (rewrite)
- **3 new scan modes**: `--whale`, `--perps`, `--trading`
- GOTCHA coverage: 1713 → 2772+

### V10.1.1 (Jan 4, 2026) — ZERO VIOLATIONS EDITION
- Electron Detector V10.0.5: 110 → 0 violations (100% reduction)

### V10.1.0 (Jan 4, 2026) — CODE CLEANUP EDITION
- GOTCHA #1713: Code deduplication, archived 54 orphaned files

### V10.0.0 (Jan 4, 2026) — ELECTRON EDITION
- Category F (F1-F5), 12 Electron detection patterns, 28 rules, 35 detectors

### V9.1.0 (Nov 27, 2025)
- Type Safety V3.0.2, Redis Detector V2.0

---

**Standards Version**: v420.0 (42 Golden Rules) | **Docs**: `docs/standards/overview.md`, `docs/standards/deepdive.md`
