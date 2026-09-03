/**
 * Rampa de alfa vertical: PNG RGBA de 4×512, negro, con alfa = (y/511)² · 255.
 * Va embebida como data URI en vez de como asset de Metro para que se comporte
 * igual en depuración y en release, y para no depender de la resolución de
 * escalas de assets en tvOS.
 *
 * Regenerar (Python):
 *   raw = filtro 0 + [0,0,0, round(255*(y/511)**2)] * 4 por fila, IHDR 8 bits
 *   tipo de color 6, y el resultado en base64.
 */
export const SCRIM_DATA_URI =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAIACAYAAACl/81BAAAC1ElEQVR42u3IZ7TIdQCH8W+yCUkZIZFkRbJXRslIqIyMCCEje89kEy0rKg1RNpFZiqwmZZZsKSN7r7fO833zO/9z77nXOfc55/PmkRKKJ90BCQMjEdxG406INyMxxNVIAnE1kkLsjGQQOyM5xM5IATEyUkKMjFQQIyM1xMi4C6KMNBBlpIUoIx1EGXdDlJEeoox7IMrIAAHjXogy7oOAkRGijEwQMDJDwMgCAeN+CBhZIWBkg4CRHQLGAxAwckDAeBACRk7wkQsCxkMQMHKDj4chYOSBgPEI+MgLASMf+MgPAaMA+CgIPh6FgFEIfBQGH49BwCgCPh4HH0XBRzEIGMXBRwnwURJ8lAIfpcFHGfBRFnyUAx/lwccT4KMC+KgIPiqBj8rg40nw8RT4qAI+ngYfVcFHNfBRHXzUAB/PgGqCj2fBRy3wURt81AE9Bz6eBx8vgI+6oHrgoz74aAA+XgQ1BB+NwEdjUBPw8RL4aApqBj5eBjUHHy3AR0vQK+CjFag1+GgDPl4FtQUf7UDtwUcH0GvgoyOoE/joDOoCPrqCuoGP7qAe4KMnqBf46A3qAz76gvqBj/6gAaCB4GMQ6HXwMRj0BmgI+BgKGgY+hoNGgEaCj1Gg0aAx4ONN0FjQOPDxFuht0Dvg413Qe6Dx4GMCaCJoEviYDHofNAV8TAV9APoQ9BH4mAb6GPQJ6FPw8RloOuhz0AzwMRP0BehL0CzwMRs0BzQXNA80H3wsAC0ELQJ9BVoMPpaAvgYtBS0DLQcfK0ArQatA34C+Ba0GfQc+vgetAa0F/QBaB1oP2gA+NoI2gX4E/QT6GfQL6FfQb+BjM2gL6HfQH6CtoG2g7aAdoJ2gXeDjT9BfoN2gv0F7QHtB+0D7QQdAB0GHQIdB/4COgP4F/Qc+joKOgY6DToD+B50EnQKdBp0BnQWdA50HXQBdBF0CXQZdAV0FXQNdB9241U1uzajn0XuWHAAAAABJRU5ErkJggg==';
