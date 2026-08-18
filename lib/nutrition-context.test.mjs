import assert from 'node:assert/strict'
import test from 'node:test'
import { evaluateMealSelection, summarizeDailyNutrition } from './nutrition-context.ts'

test('prioriza una alergia alimentaria por encima de cualquier otra regla', () => {
  const result = evaluateMealSelection({
    meal: 'snack',
    foods: 'Barra de cereal con maní y chocolate',
    profile: { allergies: ['Maní'], conditions: ['Diabetes'] },
  })

  assert.equal(result.level, 'alerta')
  assert.match(result.message, /alergia al maní/i)
  assert.ok(result.triggeredRules.includes('allergy.peanut'))
  assert.match(result.consultation, /evitá consumirlo/i)
})

test('normaliza variantes en español y evalúa toda la selección para diabetes', () => {
  const result = evaluateMealSelection({
    meal: 'breakfast',
    foods: 'Pan blanco, gaseosa azucarada y postre',
    profile: { conditions: ['Diabetes tipo 2'] },
  })

  assert.equal(result.level, 'precaucion')
  assert.match(result.message, /diabetes/i)
  assert.match(result.suggestions.join(' '), /azúcares añadidos|fibra/i)
  assert.ok(result.triggeredRules.includes('diabetes.added-sugars'))
  assert.ok(result.triggeredRules.includes('diabetes.refined-carbs'))
})

test('considera antecedentes escritos libremente para gastritis', () => {
  const result = evaluateMealSelection({
    meal: 'breakfast',
    foods: 'Café, jugo de naranja y pan con ají',
    profile: { medicalHistory: 'Antecedente de gastritis crónica' },
  })

  assert.equal(result.level, 'precaucion')
  assert.match(result.message, /gastritis/i)
  assert.ok(result.triggeredRules.includes('gastritis.irritants'))
  assert.match(result.suggestions.join(' '), /bebida no irritante|avena/i)
})

test('detecta sodio y carnes procesadas ante hipertensión', () => {
  const result = evaluateMealSelection({
    meal: 'lunch',
    foods: 'Salchicha, jamón, sopa instantánea y gaseosa',
    profile: { conditions: ['Hipertensión arterial'] },
  })

  assert.equal(result.level, 'precaucion')
  assert.match(result.message, /hipertensión/i)
  assert.ok(result.triggeredRules.includes('hypertension.sodium-processed'))
})

test('reconoce una selección declarada como alta en sal para hipertensión', () => {
  const result = evaluateMealSelection({
    meal: 'dinner',
    foods: 'Sopa con mucha sal y bebida procesada',
    profile: { conditions: ['HTA'] },
  })

  assert.equal(result.level, 'precaucion')
  assert.ok(result.triggeredRules.includes('hypertension.sodium-processed'))
})

test('da una orientación adecuada cuando no se activa una regla pertinente', () => {
  const result = evaluateMealSelection({
    meal: 'dinner',
    foods: 'Pescado al horno, verduras y agua',
    profile: { conditions: ['Asma'] },
  })

  assert.equal(result.level, 'adecuado')
  assert.match(result.message, /compatible/i)
  assert.deepEqual(result.triggeredRules, [])
})

test('resume los patrones relevantes de todas las comidas del día', () => {
  const summary = summarizeDailyNutrition({
    breakfast: 'Café y pan blanco',
    lunch: 'Salchicha con gaseosa',
    dinner: 'Pizza procesada',
    snack: 'Galletas dulces',
  }, { conditions: ['Diabetes', 'Hipertensión'] })

  assert.equal(summary.level, 'precaucion')
  assert.match(summary.message, /durante el día/i)
  assert.ok(summary.triggeredRules.includes('diabetes.added-sugars'))
  assert.ok(summary.triggeredRules.includes('hypertension.sodium-processed'))
})
