/** Shared types for ClickHouse trading data */

export interface VwapRow {
  minute:       string;
  vwap:         number;
  volume: number;
}

export interface BuySellRow {
  minute:      string;
  buy_volume:  number;
  sell_volume: number;
}

export interface OhlcvRow {
  minute:      string;
  open:        number;
  high:        number;
  low:         number;
  close:       number;
  volume:      number;
  trade_count: number;
}
