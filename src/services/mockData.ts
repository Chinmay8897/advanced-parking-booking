export const mockParkingLocations = [
  {
    id: '1',
    name: 'Central Mall Parking',
    address: '456 Shopping Ave, Central',
    image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFsbCUyMHBhcmtpbmd8ZW58MHwwfDB8fHww',
    price: 75,
    spotsAvailable: 8,
    totalSpots: 8,
    amenities: ['Indoor', 'CCTV', '24/7'],
    slots: [
      { name: 'A1', status: 'available' },
      { name: 'A2', status: 'available' },
      { name: 'A3', status: 'available' },
      { name: 'A4', status: 'available' },
      { name: 'B1', status: 'available' },
      { name: 'B2', status: 'available' },
      { name: 'B3', status: 'available' },
      { name: 'B4', status: 'available' }
    ]
  },
  {
    id: '2',
    name: 'Downtown Garage',
    address: '123 Main St, Downtown',
    image: 'https://images.unsplash.com/photo-1597328588953-bfea27ae2fa9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZG93bnRvd24lMjBnYXJhZ2UlMjBwYXJraW5nfGVufDB8MHwwfHx8MA%3D%3D',
    price: 150,
    spotsAvailable: 5,
    totalSpots: 8,
    amenities: ['Covered', 'Security', 'EV Charging', 'CCTV'],
    slots: [
      { name: 'A1', status: 'available' },
      { name: 'A2', status: 'available' },
      { name: 'A3', status: 'available' },
      { name: 'A4', status: 'unavailable' },
      { name: 'B1', status: 'available' },
      { name: 'B2', status: 'available' },
      { name: 'B3', status: 'unavailable' },
      { name: 'B4', status: 'unavailable' }
    ]
  },
  {
    id: '3',
    name: 'Riverside Parking Lot',
    address: '789 River Rd, Eastside',
    image: 'https://images.pexels.com/photos/1756957/pexels-photo-1756957.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    price: 50,
    spotsAvailable: 8,
    totalSpots: 8,
    amenities: ['Outdoor', 'Guarded', 'Car Wash'],
    slots: [
      { name: 'A1', status: 'available' },
      { name: 'A2', status: 'available' },
      { name: 'A3', status: 'available' },
      { name: 'A4', status: 'available' },
      { name: 'B1', status: 'available' },
      { name: 'B2', status: 'available' },
      { name: 'B3', status: 'available' },
      { name: 'B4', status: 'available' }
    ]
  }
];

export const mockParkingSlots = {
  'central-mall': [
    { id: 'a1', name: 'A1', status: 'available' },
    { id: 'a2', name: 'A2', status: 'available' },
    { id: 'a3', name: 'A3', status: 'available' },
    { id: 'a4', name: 'A4', status: 'unavailable' },
    { id: 'b1', name: 'B1', status: 'available' },
    { id: 'b2', name: 'B2', status: 'available' },
    { id: 'b3', name: 'B3', status: 'unavailable' },
    { id: 'b4', name: 'B4', status: 'available' }
  ],
  'downtown-garage': [
    { id: 'a1', name: 'A1', status: 'available' },
    { id: 'a2', name: 'A2', status: 'available' },
    { id: 'a3', name: 'A3', status: 'available' },
    { id: 'a4', name: 'A4', status: 'unavailable' },
    { id: 'b1', name: 'B1', status: 'available' },
    { id: 'b2', name: 'B2', status: 'unavailable' },
    { id: 'b3', name: 'B3', status: 'unavailable' },
    { id: 'b4', name: 'B4', status: 'available' }
  ],
  'riverside-lot': [
    { id: 'a1', name: 'A1', status: 'available' },
    { id: 'a2', name: 'A2', status: 'available' },
    { id: 'a3', name: 'A3', status: 'available' },
    { id: 'a4', name: 'A4', status: 'available' },
    { id: 'b1', name: 'B1', status: 'available' },
    { id: 'b2', name: 'B2', status: 'available' },
    { id: 'b3', name: 'B3', status: 'available' },
    { id: 'b4', name: 'B4', status: 'available' }
  ]
};