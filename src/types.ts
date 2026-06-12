export interface OfferHit {
  id: string;
  url: string;
  domain: string;
  title: string;
  tracker: string;
  platformName: string;
  market: 'BR' | 'Gringa';
  nicho: 'emagrecimento' | 'saude_masculina' | 'saude_bem_estar' | 'renda_extra' | 'relacionamento' | 'financas' | 'cripto' | 'beleza' | 'outros';
  type: 'VSL' | 'LOW_TICKET' | 'QUIZ' | 'DIRECT_SALES';
  score: number;
  rank: 'S' | 'A' | 'B' | 'C';
  scannedAt: string;
  uuid?: string;
  screenshotUrl?: string;
}

export interface Tracker {
  id: string;
  name: string;
  domain: string;
  market: 'BR' | 'Gringa';
}

export interface SearchProgress {
  trackerId: string;
  trackerName: string;
  market: 'BR' | 'Gringa';
  currentIndex: number;
  totalTrackers: number;
  hitsCount: number;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
}

export interface MiningStats {
  totalResults: number;
  eliteCount: number; // S
  topCount: number;   // A
  highCount: number;  // B
}
