import {describeStats, formatClock} from '../src/format';

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

describe('describeStats', () => {
  it('combina resolución y bitrate', () => {
    expect(describeStats({bitrate: 3_500_000, width: 1920, height: 1080})).toBe(
      '1920×1080  ·  3.5 Mbps',
    );
  });

  it('omite lo que aún no se ha reportado', () => {
    expect(describeStats({bitrate: 2_000_000, width: 0, height: 0})).toBe('2.0 Mbps');
  });

  it('avisa mientras no hay datos', () => {
    expect(describeStats({bitrate: 0, width: 0, height: 0})).toBe('Midiendo calidad…');
  });
});
