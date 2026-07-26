export const COMMON_MEDICATIONS = [
  'Losartán 50 mg', 'Losartán 100 mg', 'Enalapril 10 mg',
  'Metformina 500 mg', 'Metformina 850 mg',
  'Atorvastatina 10 mg', 'Atorvastatina 20 mg',
  'Ibuprofeno 400 mg', 'Ibuprofeno 600 mg',
  'Paracetamol 500 mg', 'Paracetamol 1 g',
  'Amoxicilina 500 mg', 'Amoxicilina 875 mg',
  'Omeprazol 20 mg', 'Omeprazol 40 mg',
  'Aspirina 100 mg', 'Prednisona 5 mg', 'Prednisona 20 mg',
  'Warfarina 5 mg', 'Lisinopril 10 mg', 'Salbutamol inhalador',
]

export const PRESCRIPTION_REASONS = [
  'Hipertensión', 'Diabetes', 'Gastritis', 'Artritis', 'Asma', 'EPOC',
  'Insuficiencia renal', 'Insuficiencia hepática', 'Infección', 'Dolor',
  'Colesterol alto', 'Hipotiroidismo', 'Depresión', 'Ansiedad',
  'Alergia', 'Osteoporosis', 'Otra',
]

export const ADMINISTRATION_ROUTES = [
  'Oral', 'Sublingual', 'Intramuscular', 'Intravenosa',
  'Tópica', 'Oftálmica', 'Inhalatoria', 'Ótica', 'Nasal', 'Rectal', 'Otra',
]

export const FREQ_OPTIONS = [
  { label: 'Cada 24h', value: 1, hours: 24, times: ['08:00'] },
  { label: 'Cada 12h', value: 2, hours: 12, times: ['08:00', '20:00'] },
  { label: 'Cada 8h', value: 3, hours: 8, times: ['08:00', '14:00', '20:00'] },
  { label: 'Cada 6h', value: 4, hours: 6, times: ['08:00', '12:00', '16:00', '20:00'] },
  { label: 'Según indicación', value: 0, hours: 0, times: [] },
]
