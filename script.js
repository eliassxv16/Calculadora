const pantalla = document.getElementById('pantalla');
let entradaActual = '';
let operador = '';
let entradaPrevia = '';
let modoActual = 'cientifica';
let baseActual = 'dec';
let valorDecimal = 0;

function actualizarPantalla() {
    let displayValue;
    if (operador && entradaPrevia !== '') {
        let current = entradaActual || '0';
        displayValue = entradaPrevia + operador + current;
    } else {
        displayValue = entradaActual || '0';
    }
    pantalla.value = displayValue;
}

document.querySelectorAll('.boton').forEach(boton => {
    boton.addEventListener('click', () => {
        const valor = boton.textContent;

        if (boton.classList.contains('numero') || boton.classList.contains('decimal')) {
            if (modoActual === 'programador') {
                if (boton.classList.contains('decimal')) return; // No se permiten decimales en modo programador
                const baseNum = obtenerRadix(baseActual);
                const valorNum = parseInt(valor);
                if (isNaN(valorNum) || valorNum >= baseNum) return; // Inválido para la base
                if (entradaActual === '' || entradaActual === '0') {
                    entradaActual = valor;
                } else {
                    entradaActual += valor;
                }
                valorDecimal = parseInt(entradaActual, baseNum);
            } else {
                if (entradaActual === '' || entradaActual === '0') {
                    entradaActual = valor;
                } else {
                    entradaActual += valor;
                }
            }
            actualizarPantalla();
        } else if (boton.classList.contains('operador')) {
            if (modoActual === 'programador') {
                // Convertir a decimal para el cálculo
                const numeroBase = obtenerRadix(baseActual);
                const num = parseInt(entradaActual, numeroBase);
                if (!isNaN(num)) {
                    valorDecimal = num;
                    entradaActual = valorDecimal.toString();
                }
            }
            if (entradaActual !== '') {
                if (entradaPrevia !== '' && operador !== '') {
                    calcular();
                }
                operador = valor;
                entradaPrevia = entradaActual;
                entradaActual = '';
                actualizarPantalla();
            }
        } else if (boton.classList.contains('funcion')) {
            if (modoActual === 'programador') {
                // Cambiar a científico para funciones o convertir
                cambiarModo('cientifica');
            }
            manejarFuncion(valor);
        } else if (boton.classList.contains('igual')) {
            if (modoActual === 'programador') {
                // Convertir resultado de vuelta a la base actual
                const numeroBase = obtenerRadix(baseActual);
                entradaActual = valorDecimal.toString(numeroBase).toUpperCase();
            }
            calcular();
            actualizarPantalla();
        } else if (boton.classList.contains('limpiar')) {
            limpiar();
        } else if (boton.classList.contains('retroceso')) {
            entradaActual = entradaActual.slice(0, -1);
            if (entradaActual === '') {
                entradaActual = '';
            }
            if (modoActual === 'programador') {
                const baseNum = obtenerRadix(baseActual);
                valorDecimal = parseInt(entradaActual, baseNum) || 0;
            }
            actualizarPantalla();
        }
    });
});

// Soporte para teclado
document.addEventListener('keydown', (event) => {
    const tecla = event.key;
    if (/[0-9]/.test(tecla)) {
        if (modoActual === 'programador') {
            const baseNum = obtenerRadix(baseActual);
            const valorNum = parseInt(tecla);
            if (valorNum >= baseNum) return;
            if (entradaActual === '' || entradaActual === '0') {
                entradaActual = tecla;
            } else {
                entradaActual += tecla;
            }
            valorDecimal = parseInt(entradaActual, baseNum) || 0;
        } else {
            if (entradaActual === '' || entradaActual === '0') {
                entradaActual = tecla;
            } else {
                entradaActual += tecla;
            }
        }
        actualizarPantalla();
    } else if (tecla === '.') {
        if (modoActual === 'cientifica') {
            if (entradaActual === '' || entradaActual === '0') {
                entradaActual = '0.';
            } else if (!entradaActual.includes('.')) {
                entradaActual += '.';
            }
            actualizarPantalla();
        }
    } else if (['+', '-', '*', '/'].includes(tecla)) {
        if (modoActual === 'programador') {
            const numeroBase = obtenerRadix(baseActual);
            const num = parseInt(entradaActual, numeroBase);
            if (!isNaN(num)) {
                valorDecimal = num;
                entradaActual = valorDecimal.toString();
            }
        }
        if (entradaActual !== '') {
            if (entradaPrevia !== '' && operador !== '') {
                calcular();
            }
            operador = tecla;
            entradaPrevia = entradaActual;
            entradaActual = '';
            actualizarPantalla();
        }
    } else if (tecla === 'c' || tecla === 'C') {
        limpiar();
    } else if (tecla === 'Enter') {
        if (modoActual === 'programador') {
            const numeroBase = obtenerRadix(baseActual);
            entradaActual = valorDecimal.toString(numeroBase).toUpperCase();
        }
        calcular();
        actualizarPantalla();
    } else if (tecla === 'Backspace') {
        entradaActual = entradaActual.slice(0, -1);
        if (entradaActual === '') {
            entradaActual = '';
        }
        if (modoActual === 'programador') {
            const numeroBase = obtenerRadix(baseActual);
            valorDecimal = parseInt(entradaActual, numeroBase) || 0;
        }
        actualizarPantalla();
    } else if (modoActual === 'programador' && baseActual === 'hex' && /[A-F]/.test(tecla.toUpperCase())) {
        if (entradaActual === '' || entradaActual === '0') {
            entradaActual = tecla.toUpperCase();
        } else {
            entradaActual += tecla.toUpperCase();
        }
        const numeroBase = obtenerRadix(baseActual);
        valorDecimal = parseInt(entradaActual, numeroBase) || 0;
        actualizarPantalla();
    }
});

function manejarFuncion(func) {
    switch (func) {
        case 'sin':
            entradaActual = Math.sin(parseFloat(entradaActual || 0) * Math.PI / 180).toString();
            break;
        case 'cos':
            entradaActual = Math.cos(parseFloat(entradaActual || 0) * Math.PI / 180).toString();
            break;
        case 'tan':
            entradaActual = Math.tan(parseFloat(entradaActual || 0) * Math.PI / 180).toString();
            break;
        case 'log':
            entradaActual = Math.log10(parseFloat(entradaActual || 0)).toString();
            break;
        case 'ln':
            entradaActual = Math.log(parseFloat(entradaActual || 0)).toString();
            break;
        case 'sqrt':
            entradaActual = Math.sqrt(parseFloat(entradaActual || 0)).toString();
            break;
        case '^':
            if (entradaActual !== '') {
                if (entradaPrevia !== '' && operador !== '') {
                    calcular();
                }
                operador = '^';
                entradaPrevia = entradaActual;
                entradaActual = '';
                actualizarPantalla();
            }
            return;
        case 'π':
            entradaActual += Math.PI.toString();
            break;
        case 'e':
            entradaActual += Math.E.toString();
            break;
    }
    actualizarPantalla();
}

function calcular() {
    let resultado;
    const anterior = parseFloat(entradaPrevia);
    const actual = parseFloat(entradaActual);

    if (isNaN(anterior) || isNaN(actual)) return;

    switch (operador) {
        case '+':
            resultado = anterior + actual;
            break;
        case '-':
            resultado = anterior - actual;
            break;
        case '*':
            resultado = anterior * actual;
            break;
        case '/':
            resultado = anterior / actual;
            break;
        case '^':
            resultado = Math.pow(anterior, actual);
            break;
        default:
            return;
    }

    entradaActual = resultado.toString();
    operador = '';
    entradaPrevia = '';
}

function limpiar() {
    entradaActual = '';
    operador = '';
    entradaPrevia = '';
    valorDecimal = 0;
    actualizarPantalla();
}

// Cambio de modo
document.querySelectorAll('.modo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const modo = btn.dataset.modo;
        cambiarModo(modo);
    });
});

function cambiarModo(modo) {
    if (modoActual === modo) return;
    const oldModo = modoActual;
    modoActual = modo;
    document.querySelectorAll('.modo-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-modo="${modo}"]`).classList.add('active');

    const cientifica = document.querySelector('.botones-cientificos');
    const programador = document.querySelector('.botones-programador');

    if (modo === 'cientifica') {
        if (oldModo === 'programador') {
            if (entradaActual.trim() !== '') {
                const numeroBase = obtenerRadix(baseActual);
                valorDecimal = parseInt(entradaActual, numeroBase) || 0;
                entradaActual = valorDecimal.toString();
            } else {
                entradaActual = '';
            }
        }
        programador.style.opacity = '0';
        programador.style.transform = 'translateY(10px)';
        setTimeout(() => {
            programador.style.display = 'none';
            cientifica.style.display = 'flex';
            setTimeout(() => {
                cientifica.style.opacity = '1';
                cientifica.style.transform = 'translateY(0)';
            }, 50);
        }, 300);
    } else {
        if (oldModo === 'cientifica') {
            if (entradaActual.trim() !== '') {
                valorDecimal = parseFloat(entradaActual) || 0;
                const numeroBase = obtenerRadix(baseActual);
                entradaActual = valorDecimal.toString(numeroBase).toUpperCase();
            } else {
                entradaActual = '';
            }
        }
        cientifica.style.opacity = '0';
        cientifica.style.transform = 'translateY(10px)';
        setTimeout(() => {
            cientifica.style.display = 'none';
            programador.style.display = 'flex';
            setTimeout(() => {
                programador.style.opacity = '1';
                programador.style.transform = 'translateY(0)';
            }, 50);
        }, 300);
    }
    actualizarPantalla();
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.base-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (modoActual !== 'programador') return;
            const base = btn.dataset.base;
            cambiarBase(base);
        });
    });

    document.querySelectorAll('.hex-letter').forEach(btn => {
        btn.addEventListener('click', () => {
            if (modoActual === 'programador' && baseActual === 'hex') {
                entradaActual += btn.dataset.letter;
                const numeroBase = obtenerRadix(baseActual);
                valorDecimal = parseInt(entradaActual, numeroBase) || 0;
                actualizarPantalla();
            }
        });
    });
});

function obtenerRadix(base) {
    switch (base) {
        case 'dec': return 10;
        case 'bin': return 2;
        case 'oct': return 8;
        case 'hex': return 16;
        default: return 10;
    }
}

function cambiarBase(base) {
    if (baseActual === base) return;
    const oldNumeroBase = obtenerRadix(baseActual);
    valorDecimal = parseInt(entradaActual, oldNumeroBase) || 0;
    baseActual = base;
    const newNumeroBase = obtenerRadix(base);
    entradaActual = valorDecimal.toString(newNumeroBase).toUpperCase();
    document.querySelectorAll('.base-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-base="${base}"]`).classList.add('active');
    actualizarPantalla();
}
