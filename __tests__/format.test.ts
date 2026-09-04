import {formatClock} from '../src/format';

describe('formatClock', () => {
  it('formatea por debajo de un minuto con minutos a cero', () => {
    expect(formatClock(7)).toBe('0:07');
  });

  it('formatea minutos y segundos', () => {
    expect(formatClock(95)).toBe('1:35');
  });

  it('añade horas sólo cuando hacen falta', () => {
    expect(formatClock(3671)).toBe('1:01:11');
  });

  it('trata el retraso negativo como directo', () => {
    expect(formatClock(-4)).toBe('0:00');
  });

  it('no rompe con valores no finitos', () => {
    expect(formatClock(Number.NaN)).toBe('0:00');
    expect(formatClock(Number.POSITIVE_INFINITY)).toBe('0:00');
  });
});
