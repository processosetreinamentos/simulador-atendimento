// Importa os scripts de atendimento
import { scriptSegundaVia, scriptSemSinal, scriptCancelamentoFacil, scriptCancelamentoMedio, respostaDesconhecida } from './clientes_scripts.js';

const arrayScript = [scriptSegundaVia, scriptSemSinal, scriptCancelamentoFacil, scriptCancelamentoMedio,]

// Função para gerar indice aleatório
function indiceAleatorio(array) {
    var randomArray = Math.floor(Math.random() * array.length)
    return randomArray
}

let scriptEscolhido = arrayScript[indiceAleatorio(arrayScript)]

// Função que converte a mensagem para minúsculas e remove espaços em volta
function mensagemMinuscula(texto) {
    return texto.toLowerCase().trim();
}

// Função para gerar respostas com base nas palavras-chave encontradas
export function gerarResposta(mensagem) {
    const mensagemTratada = mensagemMinuscula(mensagem); 
    const respostas = [];

    // Verifica as palavras-chave e acumula respostas
    for (const palavraChave in scriptEscolhido) {
        const palavraChaveMinuscula = palavraChave.toLowerCase(); // Converte a palavra-chave para minúsculas

        if (mensagemTratada.includes(palavraChaveMinuscula)) { // Verifica se pelo menos uma palavra-chave completa está presente na mensagem do cliente
            respostas.push(scriptEscolhido[palavraChave]);
        }
    }

    // Retorna uma resposta desconhecida aleatoriamente caso não seja encontrado a palavra-chave
    if (respostas.length === 0) {
        const respostaAleatoria = respostaDesconhecida[Math.floor(Math.random() * respostaDesconhecida.length)];
        respostas.push(respostaAleatoria);
    }

    return respostas;
}
