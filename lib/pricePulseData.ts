export interface PriceDeal {
  id: string;
  hotelName: string;
  destination: string;
  image: string;
  discount: number;
  wasPrice: string;
  nowPrice: string;
  expediaUrl: string;
  expiresIn: string;
  nightlyRate: string;
}

export const pricePulseDeals: PriceDeal[] = [
  {
    id: 'pp1',
    hotelName: 'Four Seasons Baa Atoll',
    destination: 'Maldives',
    image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=300&h=300&fit=crop&q=80',
    discount: 31,
    wasPrice: '$1,200',
    nowPrice: '$828',
    nightlyRate: '$828/night',
    expediaUrl: 'https://expedia.com/affiliates/osvasa/socialtravel',
    expiresIn: '2 days',
  },
  {
    id: 'pp2',
    hotelName: 'Andronis Luxury Suites',
    destination: 'Santorini, Greece',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=300&h=300&fit=crop&q=80',
    discount: 27,
    wasPrice: '$620',
    nowPrice: '$453',
    nightlyRate: '$453/night',
    expediaUrl: 'https://expedia.com/affiliates/osvasa/socialtravel',
    expiresIn: '5 days',
  },
  {
    id: 'pp3',
    hotelName: 'Komaneka at Bisma',
    destination: 'Ubud, Bali',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300&h=300&fit=crop&q=80',
    discount: 18,
    wasPrice: '$380',
    nowPrice: '$312',
    nightlyRate: '$312/night',
    expediaUrl: 'https://expedia.com/affiliates/osvasa/socialtravel',
    expiresIn: '1 day',
  },
];

// Post IDs that have active price drops (keyed by post ID from mockData)
export const postPriceDrops: Record<string, { discount: number; expediaUrl: string }> = {
  '1': { discount: 31, expediaUrl: 'https://expedia.com/affiliates/osvasa/socialtravel' },
  '2': { discount: 18, expediaUrl: 'https://expedia.com/affiliates/osvasa/socialtravel' },
  '4': { discount: 27, expediaUrl: 'https://expedia.com/affiliates/osvasa/socialtravel' },
};
