import type { Asset } from '@/lib/types/asset-list';

/**
 * Варіації контенту для тестування фільтрів.
 * Кожен масив — можливі значення для відповідного поля;
 * при генерації моків значення обираються випадково, щоб будь-який фільтр знаходив хоч кілька інспекцій.
 */
export const FILTER_TEST_POOLS = {
  streets: [
    'Main Street', 'Oak Avenue', 'Elm Street', 'Maple Drive', 'Cedar Lane',
    'Pine Road', 'Birch Way', 'Park Lane', 'River Road', 'Hill Street',
    'Lake View', 'Forest Ave', 'Sunset Blvd', 'Washington St', 'Lincoln Ave',
    'Church Street', 'Market Street', 'Broadway', 'First Avenue', 'Second St',
  ],
  materials: ['PVC', 'Clay', 'Concrete', 'HDPE', 'Ductile Iron', 'Vitrified Clay'],
  cities: ['Springfield', 'Riverside', 'Oakdale', 'Lakeside', 'Hillcrest'],
  purposes: ['Routine Inspection', 'Post-Repair', 'Emergency', 'Pre-Construction', 'Condition Assessment'],
  directions: ['Downstream', 'Upstream'],
  weather: ['Clear', 'Rainy', 'Cloudy', 'Overcast', 'Snow'],
  surveyedBy: ['John Smith', 'Jane Doe', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson', 'Diana Lee'],
  widths: [6, 8, 10, 12, 15, 18, 21, 24],
  /** Широкий діапазон років — щоб фільтр по Year Constructed / Year Renewed завжди мав збіги */
  years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
} as const;

/** Простий детермінований "random" на основі індексу — щоб кожне значення з пулу регулярно з'являлось */
function pickFrom<T>(pool: readonly T[], index: number): T {
  return pool[index % pool.length];
}

/**
 * Генерує мок-активи з різними варіаціями полів для зручного тестування фільтрів.
 * При будь-якому фільтрі (material, street, date, surveyedBy тощо) залишаються хоч кілька записів.
 */
export function generateFilterTestAssets(count: number, startIdOffset: number = 0): Asset[] {
  const baseDate = new Date(2025, 0, 1); // 1 Jan 2025
  const assets: Asset[] = [];

  for (let i = 0; i < count; i++) {
    const n = i + startIdOffset;
    const seg = String(n + 1).padStart(3, '0');
    const street = pickFrom(FILTER_TEST_POOLS.streets, n);
    const material = pickFrom(FILTER_TEST_POOLS.materials, Math.floor(n / 3));
    const width = pickFrom(FILTER_TEST_POOLS.widths, n);
    const purpose = pickFrom(FILTER_TEST_POOLS.purposes, n);
    const direction = pickFrom(FILTER_TEST_POOLS.directions, n % 2);
    const weather = pickFrom(FILTER_TEST_POOLS.weather, n);
    const surveyedBy = pickFrom(FILTER_TEST_POOLS.surveyedBy, n);
    const city = pickFrom(FILTER_TEST_POOLS.cities, Math.floor(n / 4));
    const observationCount = (n % 5) + 1;
    const maxGrade = (n % 5) + 1;
    const hasDefects = n % 3 !== 0;
    const preCleaning = n % 2 === 0;
    const date = new Date(baseDate);
    date.setDate(date.getDate() + (n % 90));

    assets.push({
      id: `asset-${n + 1}`,
      asset_type: 'ML',
      pipeSegment: `ML-${seg}`,
      project: 'CityTestQA',
      city,
      street,
      upstreamMH: `MH-${100 + n}`,
      downstreamMH: `MH-${101 + n}`,
    material,
    width,
    yearConstructed: pickFrom(FILTER_TEST_POOLS.years, n),
    yearRenewed: pickFrom(FILTER_TEST_POOLS.years, n + 5),
    latestInspection: {
        id: `insp-${n + 1}`,
        certificateNumber: `CERT-2025-${seg}`,
        date: date.toISOString().split('T')[0],
        purpose,
        preCleaning,
        direction,
        mediaLabel: `ML${seg}_2025`,
        weather,
        surveyedBy,
      },
      observationCount,
      hasDefects,
      maxGrade,
    });
  }

  return assets;
}
